import { CookieAttributes } from "js-cookie"
import cookies from "js-cookie"


interface ClassfinderCookies {
    token?:string
    username?:string
}
const cookieOptions:CookieAttributes = {
    path:window.location.pathname,
    expires:60,
    sameSite:"strict",
    secure:true
}

export function saveCookies({token, username}:ClassfinderCookies) {
    cookies.set("classfinder_username", username ?? "", cookieOptions)
    cookies.set("classfinder_token", token ?? "", cookieOptions)
}

export function loadCookies():ClassfinderCookies {
    const username = cookies.get("classfinder_username")
    const token = cookies.get("classfinder_token")
    return {username, token}
}