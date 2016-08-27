import test from 'ava';

import * as path from 'path';
import * as webpack from 'webpack';

import WebpackSystemJSExportPlugin from '../src/webpack-systemjs-export-plugin';

let config = {
  plugins: [
    new WebpackSystemJSExportPlugin({})
  ]
};

test('External modules not found in built chunks', async t => {
  t.fail();
});

test('Public `node_modules` accessable to SystemJS', async t => {
  t.fail();
});

test('Custom chunk aliases accessable by SystemJS', async t => {
  t.fail();
});

test('Able to load with SystemJS a chunk built with the plugin', async t => {
  t.fail();
});

