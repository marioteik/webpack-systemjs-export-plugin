"use strict";
const path = require("path");
const fs = require("fs");
const appRoot = require("app-root-path");
const webpack_sources_1 = require("webpack-sources");
function bundleSystemJS(chunkName = '', compiler) {
    if (!chunkName)
        return;
    let root = appRoot.toString();
    compiler.plugin('compilation', function (compilation) {
        compilation.plugin("optimize-chunk-assets", function (chunks, callback) {
            chunks.forEach(chunk => {
                if (!((chunk.name === chunkName))) {
                    return;
                }
                let file = chunk.files[0];
                let production = '.src';
                // Use the production version of system.js if you're in production mode.
                if (process.env['NODE_ENV']) {
                    if (process.env['NODE_ENV'].match(/production/))
                        production = '-csp-production';
                }
                let pathToSystemJS = path.join(root, 'node_modules', 'systemjs', 'dist', `system${production}.js`);
                let systemjsString = new webpack_sources_1.RawSource(fs.readFileSync(pathToSystemJS).toString()); //don't kill me pls
                if (compilation.assets[file])
                    compilation.assets[file] = new webpack_sources_1.ConcatSource(compilation.assets[file], systemjsString);
            });
            callback();
        });
    });
}
exports.bundleSystemJS = bundleSystemJS;
