export type TableInput = {
    classes: string[];
    ignoredClasses?: string[]
    students: {
        [key: string]: string[];
    };
}
export function generateTable(data:TableInput) {
    const grid = $("#grid")
    grid.empty()
    const header = $(`
    <div class="grid-row">
        <div class="grid-item" id="header-name"></div>
        <div class="grid-item" id="header-count"># of Shared Classes</div>
    </div>`)

    data.classes.forEach((_class, i) => {
        console.log(data.ignoredClasses?.includes(_class), data.ignoredClasses)
        header.append(`<div class="grid-item" id="class-${_class}"><button>-</button><div class="class-label ${data.ignoredClasses?.includes(_class)? "disabled": ""}">${cleanClassName(_class)}</div></div>`)
    })
    grid.append(header)
    data.classes.forEach((_class, i) => {
        const element = document.getElementById(`class-${_class}`)
        
        element?.addEventListener("click", () => sortGridByClass(_class))

        const child = element?.querySelector("button")
        child?.addEventListener("click", (e) => {
            e.preventDefault()
            data.ignoredClasses ??= []
            const index = data.ignoredClasses.indexOf(_class)
            if (index == -1) {
                data.ignoredClasses.push(_class)
            } else {
                data.ignoredClasses.splice(index, 1)
            }
            generateTable(data)
        })
    })
    document.getElementById("header-name")!.addEventListener("click", () => sortGridByName())
    document.getElementById("header-count")!.addEventListener("click", () => sortGridByCount())

    for (let [student, classes] of Object.entries(data.students).sort((a, b) => a[0]?.localeCompare(b[0]))) {
        const classCount = classes.filter((className) => !data.ignoredClasses?.includes(className)).length
        const row = $(`<div class="grid-row" name="${student}" data-count="${classCount}"></div>`)
        row.append(`<div class="grid-item">${student}</div>`)
        row.append(`<div class="grid-item">${classCount}</div>`)
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
        return a.getAttribute("name")!.localeCompare(b.getAttribute("name")!)
    }
    function sortGridByName() {
        sortGrid((rows) => {
            rows.sort(baseSort)
            activeSortKey = null
        })
    }

    function sortGridByCount() {
        sortGrid((rows) => {
            rows.sort(baseSort).sort((a, b) => {
                return parseInt(b.getAttribute("data-count") ?? "0") - parseInt(a.getAttribute("data-count") ?? "0")
            })
            activeSortKey = null
        })
        document.getElementById("header-count")?.classList.add("highlight-column")
    }
    function setHighlight(classname:string|null, element:HTMLElement, shouldHighlight:boolean) {
        if (!classname) return
        if (shouldHighlight) {
            element.classList.add("highlight-included")
            element.children[data.classes.indexOf(classname)+2].classList.add("highlight-column")
        } else {
            element.classList.remove("highlight-included")
            element.children[data.classes.indexOf(classname)+2].classList.remove("highlight-column")
        }
    }
    function sortGridByClass(name:string) {
        if (name == activeSortKey) {return}
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
        $("#grid").children().get(0)!.children[data.classes.indexOf(name)+2].classList.add("highlight-column")
    }
    function sortGrid(sorter:(rows:HTMLElement[]) => void) {
        document.querySelectorAll(".highlight-column").forEach((element) => {element.classList.remove("highlight-column")})
        document.querySelectorAll(".highlight-included").forEach((element) => {element.classList.remove("highlight-included")})

        $("#grid").scrollLeft(0)
        
        const children = $("#grid").children() as unknown as HTMLElement[]
        const rows = children.slice(1)
        
        sorter(rows)
        $("#grid").get(0)!.replaceChildren(children[0], ...rows)
        document.getElementById("header-count")?.classList.remove("highlight-column")
    }
    
    globalThis.sortGridByClass = sortGridByClass
    globalThis.sortGridByName = sortGridByName
    header.parent().css("--grid-columns", data.classes.length+1)
}


export function cleanClassName(name:string) {
    return name.replace(/\- \d+/, "").replace(/\(.+\)/, "")
}