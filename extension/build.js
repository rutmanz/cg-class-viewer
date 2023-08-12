'use strict'
const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")
const fse = require("fs-extra")
const {sassPlugin} = require("esbuild-sass-plugin")


async function build() {
    await esbuild.build({
        entryPoints:["src/popup.ts"],
        outdir:"./dist",
        format:"iife",
        platform:"browser",
        bundle:true,
        minify:true,
        plugins: [sassPlugin({"logger":{warn(){}}})],
    })
    
    
    await fs.readdir("./static").then(async (files) => {
        await Promise.all(files.map((file) => fse.copy(path.join("./static", file), path.join("./dist", file)), {recursive:true, overwrite:true}))
    })
    
    await fs.readFile("./dist/manifest.json", "utf-8").then(async (buffer) => {
        const parsed = JSON.parse(buffer)
        
        const conf = JSON.parse(await fs.readFile("./conf.json", "utf-8"))
        conf.build++ 
        parsed["version"] = [conf.major, conf.minor, conf.patch, conf.build].join(".")
        fs.writeFile("./conf.json", JSON.stringify(conf, null, 4))
        fs.writeFile("./dist/manifest.json", JSON.stringify(parsed, null, 2))
    })
}
build()