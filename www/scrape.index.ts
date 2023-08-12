import "../common/style/index.scss"
import { generateTable } from "../common/render"
import { WasmResponse } from "."


export async function main() {
    const data = prompt("Paste JSON")
    try {
        const classes:{[key:string]:any} = {}
        console.log(data)
        const parsed = JSON.parse(data!) as {[key:string]:string[]}
        Object.entries(parsed).forEach(([student, classlist]) => {
            
            for (const classname of classlist) {
                console.log(classname)
                classes[classname] = true
            }
        })
        const result:WasmResponse = {
            classes: Object.keys(classes),
            students: parsed
        }
        console.log(result)
        generateTable(result)
    } catch (e) {
        alert(e)
    }
}
