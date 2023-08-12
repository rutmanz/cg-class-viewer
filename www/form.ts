import * as bootstrap from "bootstrap"
import { loadCookies } from "./cookies"
import $ from "jquery"

const loginModal = new bootstrap.Modal("#login-modal")
const formElements = {
    username: $("#usernameInput"),
    token: $("#apiKeyInput")
}

export function getLoginInfo():Promise<{username:string, token:string}> {
    const {username, token} = loadCookies()
    formElements.username.val(username ?? "")
    formElements.token.val(token ?? "")
    
    loginModal.show()
    return new Promise((resolve, reject) => {
        globalThis.loginFormSubmit = function() {
            const username = formElements.username.val() as string
            const token = formElements.token.val() as string
            loginModal.hide()
            resolve({username, token})
        }
    })
}

$("#loadTokenButton").on("click", async () => {
    const token = await fetchIFrameToken()
    if (token != null) {
        formElements.token.val(token)
    }
})
function fetchIFrameToken():Promise<string|null> {
    console.log("fetching")
    return new Promise((resolve, reject) => {
        if ($("#authframe").length > 0) {console.warn("already has auth iframe, not duplicating");resolve(null)}
        document.body.appendChild($(`<iframe src="https://cs.catlin.edu/cs1api/tokens/get_token.py" id=authframe style="display:none"></iframe>`).get(0)!)
        const loop = setInterval(() => {
            const token = window.frames["authframe"]?.contentDocument?.getElementsByTagName("b")?.[0]?.textContent
            if (token != null) {
                clearTimeout(timeout)
                clearInterval(loop)
                resolve(token)
            }
        }, 50)
        const timeout = setTimeout(() => {
            clearTimeout(timeout)
            clearInterval(loop)
            resolve(null)
        }, 1000*60)
    })
}




($("#loginform") as JQuery<HTMLFormElement>).on("submit", (event) => {
    event.preventDefault()
    globalThis.loginFormSubmit()
})