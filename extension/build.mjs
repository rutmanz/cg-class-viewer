"use strict";
import htmlPlugin from "@chialab/esbuild-plugin-html";
import { exec } from "child_process";
import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import fse from "fs-extra";
import fs from "fs/promises";
import path from "path";
import util from "node:util"
import conf from "./conf.json" assert { type: "json" };
import { fileURLToPath } from "url";
const execAsync = util.promisify(exec)


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { major, minor, patch, build } = conf;
const version = [major, minor, patch, build].join(".");
async function buildExtension(browser) {
	const distdir = path.join("./dist", browser);
	await fs.readdir("./src/page").then(async (files) => {
		await Promise.all(
			files.map(async (file) => {
				if (!(await fs.stat(path.join("./src/page", file))).isDirectory()) {
					return;
				}
				await esbuild.build({
					entryPoints: [`src/page/${file}/${file}.html`],
					outfile: `${distdir}/page/${file}.html`,
					format: "iife",
					platform: "browser",
					bundle: true,
					minify: true,
					sourcemap: true,
					assetNames: `assets/${file}/[name]`,
					chunkNames: `assets/${file}/[ext]/[name]`,
					plugins: [sassPlugin({ logger: { warn() {} } }), htmlPlugin()],
				});
			})
		);
	});
	await esbuild.build({
		entryPoints: ["src/service-worker.ts"],
		outdir: distdir,
		format: "iife",
		platform: "browser",
		bundle: true,
		minify: true,
	});

	await fs.readdir("./static").then(async (files) => {
		await Promise.all(
			files.map(
				(file) =>
					fse.copy(path.join("./static", file), path.join(distdir, file)),
				{ recursive: true, overwrite: true }
			)
		);
	});

	await fs.copyFile(`./src/manifest/${browser}.json`, `${distdir}/manifest.json`);

	await fs
		.readFile(`${distdir}/manifest.json`, "utf-8")
		.then(async (buffer) => {
			const parsed = JSON.parse(buffer);
			parsed["version"] = version;

			fs.writeFile(`${distdir}/manifest.json`, JSON.stringify(parsed, null, 2));
		});
}

async function pkg(...browsers) {
	await buildAll(...browsers);
	browsers.map(async (browser) => {
        const distdir = path.join(__dirname, "dist", browser)
		await execAsync(`zip -r ../../pkg/${version}-${browser}.zip ./*`, {
			cwd:distdir
		});
		await fs.copyFile(`./pkg/${version}-${browser}.zip`, `./pkg/latest-${browser}.zip`)
	});
}

if (process.argv[2] == "package") {
	pkg("firefox", "chrome");
} else {
	buildAll("chrome");
}

function buildAll(...browsers) {
	return Promise.allSettled(
		browsers.map((browser) => buildExtension(browser))
	).then(() => {
		conf.build++;
		fs.writeFile("./conf.json", JSON.stringify(conf, null, 4));
	});
}
