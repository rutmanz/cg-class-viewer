const esbuild = require("esbuild")
const child_process = require("child_process")
const {sassPlugin} = require("esbuild-sass-plugin")
esbuild.build({
    entryPoints: ["./index.ts"],
    minifyIdentifiers:false,
    minifySyntax:true,
    minifyWhitespace:true,
    plugins: [sassPlugin()],
    bundle:true,
    outfile: "../public/assets/index.js"
})

child_process.exec("go build -o ../public/assets/index.wasm", {
    cwd:"../wasm",
    env: {
        ...process.env,
        "GOOS":"js",
        "GOARCH": "wasm",
    }    
}, (err, stdout, stderr) => {
    if (err) {console.error(err)}
    if (stdout) {console.log(stdout)}
    if (stderr) {console.log(stderr)}
})