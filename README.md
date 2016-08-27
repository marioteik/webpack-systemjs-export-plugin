# webpack-systemjs-export-plugin

[![Npm Package][npm-img]][npm-url] [![Build Status][travis-img]][travis-url] ![Release][release-img] [![licence][license-img]][license-url] [![Dependency Status][david-img]][david-url] [![devDependency Status][david-dev-img]][david-dev-url]

```bash
npm i webpack-systemjs-export-plugin --save
```

> Note: **Under Construction!** A Fork of @joeldenning's [Webpack System Register Plugin](https://www.npmjs.com/package/webpack-system-register) and @guybedford's [SystemJS Webpack Plugin](https://github.com/guybedford/systemjs-webpack-plugin).

Fully integrates Webpack with SystemJS, export systemjs libraries, expose modules, dynamically load chunks with systemjs, or load modules in your webpack build from SystemJS.

## Features

- Dynamically load your build with `System.import('path/to/your/build.js)`, and get everything exposed by your entry module.

- Register any module you want in your build to SystemJS.

- Ignore modules that will be loadable on runtime.

- [TypeScript 2.0](https://blogs.msdn.microsoft.com/typescript/2016/07/11/announcing-typescript-2-0-beta/) and [Webpack 2.1](https://github.com/webpack/webpack) Support!

- Unit Tests powered by [Ava](https://github.com/avajs/ava).

- Load from SystemJS directly from your build.

## Quick Start

From your entry module, expose whatever you would like (just like when you're building a library):

```js
export * from './components';
export * from './actions';
export * from './utils';
```

In webpack, just add a new instance of the plugin to your `plugins` array.:

```js
// webpack.config.js
const WebpackSystemJSExportPlugin = require('webpack-systemjs-export-plugin');

let config = {
  //...
  plugins: [
    new WebpackSystemJSExportPlugin({
      externals: [
        'three'
      ],
      public: [
        'react',
        'react-dom',
        'react-router'
      ],
      alias: (chunk) => `myapp/${chunk}`,
      bundleSystemJS: 'vendor'
    }),
    // ...
  ]
}

```

In this example, the module `'three'` will be bundled as `SystemJS.import('three').then(res => exports = res)`.

## Configuration Options

To configure the plugin pass an object of the following type to the constructor:

```ts
interface Configuration {
  // Any external modules that will not be bundled by Webpack (defaults to none.)
  externals?: (string | RegExp)[],

  // Any node_modules you wish to expose (defaults to all of them.)
  public?: (string | RegExp)[],

  // Specify which chunks you want to wrap with SystemJS.register (defaults to none.)
  register?: {
    name : string,
    alias: (chunk: string) => string
  }[],

  // Bundles SystemJS as a global dependency to the chunk of your choosing. (defaults to none.)
  bundleSystemJS?: string
}
```

## Examples

Check out the [example project](/example) if you're still not sure what to do. ;)

### Roadmap

* [ ] release webpack compiler definitions to DT.

[website-img]: docs/brand/cover.png
[website-url]: https://alain.xyz
[release-img]: https://img.shields.io/badge/release-2.1.0-4dbfcc.svg?style=flat-square
[license-img]: http://img.shields.io/:license-apache-blue.svg?style=flat-square
[license-url]: https://opensource.org/licenses/apache
[david-url]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin
[david-img]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin.svg?style=flat-square
[david-dev-url]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin#info=devDependencies
[david-dev-img]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin/dev-status.svg?style=flat-square
[travis-img]: https://api.travis-ci.org/alaingalvan/webpack-systemjs-export-plugin.svg?style=flat-square
[travis-url]:https://travis-ci.org/alaingalvan/webpack-systemjs-export-plugin
[npm-img]: https://img.shields.io/npm/v/webpack-systemjs-export-plugin.svg?style=flat-square
[npm-url]: http://npm.im/webpack-systemjs-export-plugin