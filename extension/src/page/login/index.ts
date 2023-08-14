import { getData, getVeracrossCookie, isValidLogin } from "../../lib/api"
import { getSchool, setSchool } from "../../lib/storage"
import jquery from 'jquery';


const schoolname = document.getElementById("schoolCode") as HTMLInputElement
const schoolnameview = document.getElementById("schoolnameview")!
const form = document.getElementById("loginform") as HTMLFormElement
window["$"] = jquery
const attemptedCookies = {

}


window.addEventListener("load",async () => {
    let cookiePollLoop;
    let veracrossTab:Window;
    schoolname.value = await getSchool() ?? ""
    schoolnameview.textContent = schoolname.value || "school"
    checkLogin()
    schoolname.addEventListener("input", () => {schoolnameview.textContent = schoolname.value || "school"})
    schoolname.addEventListener("change", () => {
        setSchool(schoolname.value)
        
        checkLogin()
    })


    form.addEventListener("submit", (event)=> {
        event.preventDefault()
        veracrossTab = window.open(`https://portals.veracross.com/${schoolname.value}`, "_blank")!
        veracrossTab.focus()
        clearInterval(cookiePollLoop)
        cookiePollLoop = setInterval(checkLogin, 50)
    })

    async function isLoggedin() {
        return await isValidLogin(schoolname.value)
    }



    async function checkLogin() {
        const cookie = await getVeracrossCookie()
        if (attemptedCookies[cookie]) {return}

        if (await isLoggedin()) {
            window.location.assign("view.html")
            if (veracrossTab != null) {veracrossTab.close()}
        } else {
            attemptedCookies[cookie] = true
        }
    }
})