"use strict";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import { exec } from "child_process";
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import fse from "fs-extra";
import fs from "fs/promises";
import path from "path";
import conf from "./conf.json" assert { type: "json" };
const { major, minor, patch, build } = conf;
const version = [major, minor, patch, build].join(".");
async function go() {
    await fs.readdir("./src/page").then(async (files) => {
        await Promise.all(files.map(async (file ) => {
            if (!(await fs.stat(path.join("./src/page", file))).isDirectory()) {
                return
            }
            await esbuild.build({
                entryPoints: [`src/page/${file}/${file}.html`],
                outfile: `./dist/page/${file}.html`,
                format: "iife",
                platform: "browser",
                bundle: true,
                minify: true,
                sourcemap:true,
                assetNames: `assets/${file}/[name]`,
                chunkNames: `assets/${file}/[ext]/[name]`,
                plugins: [sassPlugin({ logger: { warn() {} } }), htmlPlugin()],
            });
        }))
    })
    await esbuild.build({
        entryPoints: ["src/service-worker.ts"],
        outdir: "./dist/",
        format: "iife",
        platform: "browser",
        bundle: true,
        minify: true,
    });
    
    await fs.readdir("./static").then(async (files) => {
        await Promise.all(
            files.map(
                (file) =>
                fse.copy(path.join("./static", file), path.join("./dist", file)),
                { recursive: true, overwrite: true }
                )
                );
            });
            
            await fs.readFile("./dist/manifest.json", "utf-8").then(async (buffer) => {
                const parsed = JSON.parse(buffer);
                parsed["version"] = version;
                conf.build++;
                fs.writeFile("./conf.json", JSON.stringify(conf, null, 4));
                fs.writeFile("./dist/manifest.json", JSON.stringify(parsed, null, 2));
            });
        }
        
        async function pkg() {
            await go();
            exec(`zip -r ../pkg/${version}-bundle.zip ./*`, {
                cwd: join(__dirname, "dist"),
            });
            exec(`zip -r ../pkg/latest.zip ./*`, { cwd: join(__dirname, "dist") });
        }
        
        if (process.argv[2] == "package") {
            pkg();
        } else {
            go();
        }
        