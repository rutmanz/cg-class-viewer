import { WasmResponse } from "."
import $ from "jquery"

export function generateTable(data:WasmResponse) {
    const grid = $("#grid")
    const header = $('<div class="grid-row"><div class="grid-item" onclick="sortGridByName()"></div></div>')
    data.classes.forEach((_class, i) => {
        header.append(`<div class="grid-item" onclick="sortGridByClass('${_class}')">${cleanClassName(_class)}</div>`)
    })
    grid.append(header)
    for (let [student, classes] of Object.entries(data.students)) {
        const row = $(`<div class="grid-row" name="${student}"></div>`)
        row.append(`<div class="grid-item">${student}</div>`)
        let sharesClass:boolean = false
        data.classes.forEach((_class, i) => {
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
            element.children[data.classes.indexOf(classname)+1].classList.add("highlight-column")
        } else {
            element.classList.remove("highlight-included")
            element.children[data.classes.indexOf(classname)+1].classList.remove("highlight-column")
        }
    }
    function sortGridByClass(name:string) {
        if (name == activeSortKey) {return}
        $("#grid").children().get(0)!.children[data.classes.indexOf(name)+1].classList.add("highlight-column")
        sortGrid((rows) => {
            const hasClass = (student:string|null) => data.students[student as string]?.includes(name)
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
            $("#grid").children().get(0)!.children[data.classes.indexOf(activeSortKey)+1].classList.remove("highlight-column")
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
    header.parent().css("--grid-columns", data.classes.length)
}


function cleanClassName(name:string) {
    return name.replace(/\- \d+/, "").replace(/\(.+\)/, "").replace(/:.+$/, "")
}