import { getData } from "../../lib/api";
import { TableInput, generateTable } from "../../../../common/render";
import jquery from "jquery"
import { getSchool, setSchool } from "../../lib/storage";

window["$"] = jquery

window.addEventListener("load",load)
async function load() {
    updateData()

    
    async function updateData() {
        const school = await getSchool()
        const data = await getData(school ?? "catlin")
        if (data == null) {
            window.location.assign("login.html")
            return
        }
        
        try {
            const classes: { [key: string]: any } = {}
            Object.entries(data).forEach(([student, classlist]) => {
                for (const classname of classlist) {
                    classes[classname] = true
                }
            })
            const result: TableInput = {
                classes: Object.keys(classes).sort(),
                students: data
            }
            generateTable(result)
        } catch (e) {
            console.error(e)
        }
    }
}