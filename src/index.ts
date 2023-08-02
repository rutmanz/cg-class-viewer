import "./index.scss"
import "./lib/wasm_exec"
import $ from "jquery"
import cookies, { CookieAttributes } from "js-cookie"

declare global {
    const getSchedule: (key:string, v:string) => string
    const Go:any
}
const cookieOptions:CookieAttributes = {
    path:window.location.pathname,
    expires:60,
    sameSite:"strict",
    secure:true
}
globalThis.cookieManager = cookies;
type WasmResponse = {classes:string[],students:{[key:string]:string[]}}
async function main() {
    
    const token = cookies.get("classfinder_token") || await awaitToken()
    // console.log(token)
    const getUsername = () => {
        console.log("getting username")
        return prompt("Enter catlin username", "rutmanz")
    }
    const username = cookies.get("classfinder_username") || getUsername()
    cookies.set("classfinder_username", username ?? "", cookieOptions)
    cookies.set("classfinder_token", token ?? "", cookieOptions)
    $("#authframe").remove()
    let result:WasmResponse;
    try {
        result = JSON.parse(await getSchedule(username!, token!))
    } catch (e) {
        alert("Invalid token or username! "+e)
        return;
    }
    console.log({username, result})
    const grid = $("#grid")
    const header = $('<div class="grid-row"><div class="grid-item" onclick="sortGridByName()"></div></div>')
    result.classes.forEach((_class, i) => {
        header.append(`<div class="grid-item" onclick="sortGridByClass('${_class}')">${cleanClassName(_class)}</div>`)
    })
    grid.append(header)
    for (let [student, classes] of Object.entries(result.students)) {
        const row = $(`<div class="grid-row" name="${student}"></div>`)
        row.append(`<div class="grid-item">${student}</div>`)
        let sharesClass:boolean = false
        result.classes.forEach((_class, i) => {
            if (classes.includes(_class)) { 
                sharesClass = true
                row.append(`<div class="grid-item" title="${student} - ${cleanClassName(_class)}">✔</div>`)
            } else {
                row.append(`<div class="grid-item"></div>`)
            }
        })
        if (sharesClass) {
            grid.append(row)
        }
        
        
    }
    let activeSortKey:string|null = null
    const baseSort = (a,b) => {
        setHighlight(activeSortKey, a, false)
        setHighlight(activeSortKey, b, false)
        return a.getAttribute("name")!.localeCompare(b.getAttribute("name")!)
    }
    function sortGridByName() {
        sortGrid((rows) => {
            rows.sort(baseSort)
            activeSortKey = null
        })
    }
    function setHighlight(classname:string|null, element:HTMLElement, shouldHighlight:boolean) {
        if (!classname) return
        if (shouldHighlight) {
            element.classList.add("highlight-included")
            element.children[result.classes.indexOf(classname)+1].classList.add("highlight-column")
        } else {
            element.classList.remove("highlight-included")
            element.children[result.classes.indexOf(classname)+1].classList.remove("highlight-column")
        }
    }
    function sortGridByClass(name:string) {
        if (name == activeSortKey) {return}
        $("#grid").children().get(0)!.children[result.classes.indexOf(name)+1].classList.add("highlight-column")
        sortGrid((rows) => {
            const hasClass = (student:string|null) => result.students[student as string]?.includes(name)
            rows.sort(baseSort).sort((a, b) => {
                const aHas = hasClass(a.getAttribute("name"))
                const bHas = hasClass(b.getAttribute("name"))
                setHighlight(name, a, aHas)
                setHighlight(name, b, bHas)
                
                if (aHas == bHas) return 0
                if (aHas && !bHas) return -1
                return 1
            });
            activeSortKey = name
        })
    }
    function sortGrid(sorter:(rows:HTMLElement[]) => void) {
        if (activeSortKey) {
            $("#grid").children().get(0)!.children[result.classes.indexOf(activeSortKey)+1].classList.remove("highlight-column")
        }

        $("#grid").scrollLeft(0)
        
        const children = $("#grid").children() as unknown as HTMLElement[]
        const rows = children.slice(1)
        console.log(rows)
        
        sorter(rows)
        $("#grid").get(0)!.replaceChildren(children[0], ...rows)
    }
    
    globalThis.sortGridByClass = sortGridByClass
    globalThis.sortGridByName = sortGridByName
    header.parent().css("--grid-columns", result.classes.length)
}



function cleanClassName(name:string) {
    return name.replace(/\- \d+/, "").replace(/\(.+\)/, "").replace(/:.+$/, "")
}

const go = new Go();
WebAssembly.instantiateStreaming(fetch("./assets/index.wasm"), go.importObject).then((result) => {
    go.run(result.instance);
    main()
});

function awaitToken():Promise<string|null> {
    return new Promise((resolve, reject) => {
        document.body.appendChild($(`<iframe src="https://cs.catlin.edu/cs1api/tokens/get_token.py" id=authframe style="display:none"></iframe>`).get(0)!)

        const loop = setInterval(() => {
            const token = window.frames["authframe"]?.contentDocument?.getElementsByTagName("b")?.[0]?.textContent
            console.log("tokentmp", {token})
            if (token != null) {
                clearTimeout(timeout)
                clearInterval(loop)
                resolve(token)
            }
        }, 50)
        const timeout = setTimeout(() => {
            clearTimeout(timeout)
            clearInterval(loop)
            resolve(prompt("Please enter API Key"))
        }, 1000*10)

        
    })
}