# webpack-systemjs-export-plugin

![Release][release-img]
[![licence][license-img]][license-url]
[![Unit Tests][travis-img]][travis-url]
[![Coverage Tests][codecov-img]][codecov-url]
[![Dependency Status][david-img]][david-url]
[![devDependency Status][david-dev-img]][david-dev-url]

A Webpack 2 plugin that fully integrates Webpack with SystemJS.

## Install

```bash
npm i webpack-systemjs-export-plugin -S
```

## Features

- Dynamically load your build with `System.import('path/to/your/build.js)`, and get everything exposed by your entry module.

- Register any module you want in your build to SystemJS.

- Ignore modules that will be loadable on runtime.

- [TypeScript 2](http://www.typescriptlang.org/) and [Webpack 2](https://webpack.js.org/) Support!

- Unit/Coverage Tests powered by [Ava](https://github.com/avajs/ava).

- Bundle SystemJS directly into a chunk you're exporting. 

## Usage

Simply include the default export of the module into your webpack plugins, and configure it with an object of this type:

```ts
type Configuration = {

  // Any external modules that will not be bundled by Webpack (defaults to none.)
  externals?: (string | RegExp)[],

  // Any node_modules you wish to expose (defaults to all of them.)
  public?: (string | RegExp)[],

  // Specify which chunks you want to wrap with SystemJS.register (defaults to none.)
  register?: {
    name : string,
    alias?: string | (chunk: string) => string
  }[],

  // Bundles SystemJS as a global dependency to the chunk of your choosing. (defaults to none.)
  bundleSystemJS?: string

}
```

From your entry modules, expose whatever you would like:

```js
export * from './components';
export * from './actions';
export * from './utils';
```

In webpack, just add a new instance of the plugin to your `plugins` array:

```js
// webpack.config.js
const WebpackSystemJSExportPlugin = require('webpack-systemjs-export-plugin');

let config = {

  entry: {
    main: './main',
    vendor: [
      'lodash'
    ],
    dynamic: './dynamic'
  },

  //...

  plugins: [
    new WebpackSystemJSExportPlugin({

      // The following dependencies are loaded from SystemJS
      externals: [],

      // Expose the following node_modules
      public: [
        'react',
        'react-dom',
        'react-router'
      ],

      // Expose following entry points to SystemJS
      register: [
        {
          // Entry Point
          name: 'main',
          // Module Name
          alias: 'myapp'
        }
      ],

      // Include SystemJS in the following entry point
      bundleSystemJS: 'vendor'
    })
    // ...
  ]
};

```

Check out the [example project in the test suite](/test/example) if you're still not sure what to do.


[release-img]: https://img.shields.io/badge/release-2.1.0-4dbfcc.svg?style=flat-square
[license-img]: http://img.shields.io/:license-apache-blue.svg?style=flat-square
[license-url]: https://opensource.org/licenses/Apache-2.0
[david-url]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin
[david-img]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin.svg?style=flat-square
[david-dev-url]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin#info=devDependencies
[david-dev-img]: https://david-dm.org/alaingalvan/webpack-systemjs-export-plugin/dev-status.svg?style=flat-square
[travis-img]: https://img.shields.io/travis/alaingalvan/webpack-systemjs-export-plugin.svg?style=flat-square
[travis-url]:https://travis-ci.org/alaingalvan/webpack-systemjs-export-plugin
[codecov-img]:https://img.shields.io/codecov/c/github/alaingalvan/webpack-systemjs-export-plugin.svg?style=flat-square
[codecov-url]: https://codecov.io/gh/alaingalvan/webpack-systemjs-export-plugin
[npm-img]: https://img.shields.io/npm/v/webpack-systemjs-export-plugin.svg?style=flat-square
[npm-url]: http://npm.im/webpack-systemjs-export-plugin
[npm-download-img]: https://img.shields.io/npm/dm/webpack-systemjs-export-plugin.svg?style=flat-square