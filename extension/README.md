## Building
bun 1.2.20
node 23.6.0

Run `bun install` to install the required dependencies
use `bun build.mjs package` to create a packaged extension at `pkg/latest-firefox.zip`

All source code can be found in `./src`

Note that the `version` in the manifest will be different from the submitted addon code as the build version is autoincremented