import { getData } from "../../lib/api";
import { TableInput, generateTable } from "../../../../common/render";
import jquery from "jquery"
import { getSchool, setSchool } from "../../lib/storage";
const message = document.getElementById("message")!
const updatebutton = document.getElementById("updatebutton")!
const schoolname = document.getElementById("schoolname") as HTMLInputElement
window["$"] = jquery

window.addEventListener("load",load)
async function load() {
    console.log(window["$"])
    schoolname.value = await getSchool() ?? "catlin"

    updateData()
    updatebutton.addEventListener("click", () => {
        updateData()
    })

    schoolname.addEventListener("change", () => {
        setSchool(schoolname.value)
    })

    
    async function updateData() {
        message.hidden = true
        const data = await getData(schoolname.value)
        if (data == null) {
            console.log("login failed")
            message.hidden = false;
            message.textContent = "Please sign into Veracross"
            $("#grid").empty()
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