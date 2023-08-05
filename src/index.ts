import "./style/index.scss"
import "./lib/wasm_exec"
import $ from "jquery"
import { loadCookies, saveCookies } from "./cookies"
import { getLoginInfo } from "./form"
import { generateTable } from "./render"

declare global {
    const getSchedule: (key:string, v:string) => string
    const Go:any
}

const alertBannerElement = $("#alert-banner")



export type WasmResponse = {classes:string[],students:{[key:string]:string[]}}
async function main(resetCredentials:boolean=false) {
    let token:string|undefined = ""
    let username:string|undefined = "";

    if (!resetCredentials) { ({token, username} = loadCookies())}

    if (!(token && username)) {
        ({token, username} = await getLoginInfo())
    }

    console.log("logged in")
    saveCookies({token, username})
    
    let result:WasmResponse;
    try {
        result = JSON.parse(await getSchedule(username!, token!))
    } catch (e) {
        const msg =(e as string)?.match(/Catlin API Problem: (.+)/)?.[1] ?? e;
        console.error("Login error: "+msg)
        alertBannerElement.css("display", "flex")
        main(true)
        return;
    }
    alertBannerElement.css("display", "none")

    generateTable(result)
}


const go = new Go();
WebAssembly.instantiateStreaming(fetch("./assets/index.wasm"), go.importObject).then((result) => {
    go.run(result.instance);
    main()
});