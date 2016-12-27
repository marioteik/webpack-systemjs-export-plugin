import test from 'ava';
import * as fs from 'fs';
import * as path from 'path';
import * as webpack from 'webpack';
import * as SystemJS from 'systemjs';

import WebpackSystemJSExportPlugin from '../src/webpack-systemjs-export-plugin';

var config = require('./example/webpack.config.js');

test('SystemJS is bundled with the correct chunk', async t => {

  let c = {
    ...config,
    plugins: [
      new WebpackSystemJSExportPlugin({
        bundleSystemJS: 'vendor'
      })]
  };

  let wp = await new Promise<string>((res, rej) => {

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

});


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

test('Public `node_modules` accessable to SystemJS', async t => {
  
  let c = {
    ...config,
    plugins: [
      new WebpackSystemJSExportPlugin({
        public: ['lodash']
      })
    ]
  };

  let wp = await new Promise<string>((res, rej) => {
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
});

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