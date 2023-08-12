import "./wasm.index"


export type WasmResponse = {classes:string[],students:{[key:string]:string[]}}
declare global {
    const getSchedule: (key:string, v:string) => string
    const Go:any
}
