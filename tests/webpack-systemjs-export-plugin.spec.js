"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const ava_1 = require("ava");
const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const SystemJS = require("systemjs");
const webpack_systemjs_export_plugin_1 = require("../src/webpack-systemjs-export-plugin");
var config = require('./example/webpack.config.js');
ava_1.default('SystemJS is bundled with the correct chunk', (t) => __awaiter(this, void 0, void 0, function* () {
    let c = Object.assign({}, config, {
        plugins: [
            new webpack_systemjs_export_plugin_1.default({
                bundleSystemJS: 'vendor'
            })
        ]
    });
    let wp = yield new Promise((res, rej) => {
        webpack(c, (err, stats) => {
            if (err)
                rej(err.message);
        })
            .run((err, stats) => {
            if (err)
                t.fail(err.message);
            let vendorBuildPath = path.join(config.output.path, 'vendor.min.js');
            let vendorHasSystem = fs.readFileSync(vendorBuildPath).toString().includes('SystemJS');
            if (vendorHasSystem)
                res('Vendor has SystemJS bundled!');
        });
    })
        .then((res) => t.pass(res))
        .catch((err) => t.fail(err));
}));
/*
test('External modules not found in built chunks', async t => {
  var c = Object.assign({}, config,
    {
      plugins: [
        new WebpackSystemJSExportPlugin({
          externals: ['three']
        })]
    });
  t.fail();
});
*/
ava_1.default('Public `node_modules` accessable to SystemJS', (t) => __awaiter(this, void 0, void 0, function* () {
    var c = Object.assign({}, config, {
        plugins: [
            new webpack_systemjs_export_plugin_1.default({
                public: ['lodash']
            })
        ]
    });
    let wp = yield new Promise((res, rej) => {
        webpack(c, (err, stats) => {
            if (err)
                rej(err.message);
        })
            .run((err, stats) => {
            if (err)
                t.fail(err.message);
            // Run built code and see if lodash is accessable.
            let vendorBuildPath = path.join(config.output.path, 'vendor.min.js');
            require(vendorBuildPath);
            SystemJS.import('lodash')
                .then(_ => res('Bundled modules are accessable to SystemJS!'))
                .catch(err => rej(err.message));
        });
    })
        .then((res) => t.pass(res))
        .catch((err) => t.fail(err));
}));
/*
test('Custom chunk aliases loadable by SystemJS', async t => {
  var c = Object.assign({}, config,
    {
      plugins: [
        new WebpackSystemJSExportPlugin({
          register: [{
            name: 'dynamic',
            alias: (chunk) => `myapp/${chunk}`
          }]
        })
      ]
    });

  let wp = await new Promise<string>((res, rej) => {
    webpack(c, (err, stats) => {
      if (err)
        rej(err.message);
    })
      .run((err, stats) => {
        if (err)
          t.fail(err.message);

        // Run built code and see if lodash is accessable.
        let dynamicBuildPath = path.join(config.output.path, 'dynamic.min.js');
        SystemJS.import(dynamicBuildPath)
          .then(m => (typeof m.default !== 'undefined') ? res('Bundled modules are accessable to SystemJS!') : rej('Failed to find default export!'))
          .catch(err => rej(err.message))
      });
  })
    .then((res) => t.pass(res))
    .catch((err) => t.fail(err));

  t.fail();
});
*/ 
