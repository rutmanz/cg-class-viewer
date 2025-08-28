import { getData } from "../../lib/api";
import { TableInput, generateTable } from "../../../../common/render";
import jquery from "jquery"
import { getSchool, setSchool } from "../../lib/storage";

window["$"] = jquery

window.addEventListener("load",load)
let latestData:TableInput|null = null
async function load() {
    updateData()
    const configureExportButton = () => {
        const exportButton = document.getElementById("export")
        console.log("checking", exportButton)
        if (exportButton == null) {
            requestAnimationFrame(configureExportButton)
            return
        }
        exportButton.addEventListener("click", async () => {
            console.log(latestData, "GAAAG")
            if (latestData == null) return
            const rows = Object.entries(latestData.students).map(([student, commonClasses]) => {
                return [student, ...latestData!.classes.map((className) => commonClasses.classes.includes(className) ? "TRUE" : "FALSE")]
            })
            const output = [["Student", ...latestData.classes], ...rows]
            console.log(output)
            const outputStr = output.map((arr) => arr.join(",")).join("\n")
            await navigator.clipboard.writeText(outputStr)
            exportButton.innerHTML = "Copied!"
            setTimeout(() => {exportButton.innerHTML = "Export as CSV"}, 1200)
        })
    }
    requestAnimationFrame(configureExportButton)
    async function updateData() {
        const school = await getSchool()
        const data = await getData(school ?? "catlin")
        if (data == null) {
            window.location.assign("login.html")
            return
        }
        
        try {
            const classes: Set<string> = new Set()
            Object.entries(data).forEach(([student, {classes:classlist}]) => {
                for (const classname of classlist) {
                    classes.add(classname)
                }
            })
            const result: TableInput = {
                classes: [...classes.values()].sort(),
                students: data
            }
            latestData = result
            const exportButton = document.getElementById("export")
            if (exportButton != null) exportButton.style.display = "inline-block"
            generateTable(result)
        } catch (e) {
            console.error(e)
        }
    }
}