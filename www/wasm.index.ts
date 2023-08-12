import "../common/style/index.scss"
import "./lib/wasm_exec"
import $ from "jquery"
import { loadCookies, saveCookies } from "./cookies"
import { getLoginInfo } from "./form"
import { generateTable } from "../common/render"
import { WasmResponse } from "."


const alertBannerElement = $("#alert-banner")

window["$"] = $

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