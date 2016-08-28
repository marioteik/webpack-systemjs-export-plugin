import test from 'ava';

import * as path from 'path';
import * as webpack from 'webpack';

import WebpackSystemJSExportPlugin from '../src/webpack-systemjs-export-plugin';

var config = require('./example/webpack.config.js');

test('Able to load with SystemJS a chunk built with the plugin', t => {
  var c = Object.assign({}, config,
    {
      plugins: [
        new WebpackSystemJSExportPlugin({
          bundleSystemJS: 'vendor'
        })
      ]
    });

  webpack(c, (err, stats) => {

    console.log(stats);
    console.log(err);
    t.fail();
  });
});

test('External modules not found in built chunks', t => {
  var c = Object.assign({}, config,
    {
      plugins: [
        new WebpackSystemJSExportPlugin({
          externals: ['three']
        })]
    });
  t.fail();
});

test('Public `node_modules` accessable to SystemJS', t => {
  var c = Object.assign({}, config,
    {
      plugins: [
        new WebpackSystemJSExportPlugin({
          public: ['lodash']
        })
      ]
    });
  t.fail();
});

test('Custom chunk aliases accessable by SystemJS', t => {
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
  t.fail();
});

test('All features work when minification is on', t => {
  t.fail();
});