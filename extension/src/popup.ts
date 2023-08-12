import "../../common/style/index.scss"
import { getData } from "./api";
import { TableInput, generateTable } from "../../common/render";
const message = document.getElementById("message")!
const updatebutton = document.getElementById("updatebutton")!
const schoolname = document.getElementById("schoolname") as HTMLInputElement

const getStorageData = key =>
    new Promise((resolve, reject) =>
        chrome.storage.sync.get(key, result =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve(result)
        )
    )

function setStorageData(data): Promise<void> {
    return new Promise((resolve, reject) =>
        chrome.storage.sync.set(data, () =>
            chrome.runtime.lastError
                ? reject(Error(chrome.runtime.lastError.message))
                : resolve()
        )
    );
}
(async () => {
    schoolname.value = (await getStorageData("schoolname") as any)["schoolname"] as string ?? "catlin"

    updateData()
    updatebutton.addEventListener("click", () => {
        updateData()
    })

    schoolname.addEventListener("change", () => {
        setStorageData({"schoolname": schoolname.value})
    })

    
    async function updateData() {
        message.hidden = true
        const data = await getData(schoolname.value)
        if (data == null) {
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
})()