const webpack = require('webpack');
const path = require('path');
const WebpackSystemJSExportPlugin = require('../../src/webpack-systemjs-export-plugin')['default'];

let config = {
  context: __dirname,
  entry: {
    main: './main',
    vendor: [
      'lodash'
    ],
    dynamic: './dynamic'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].min.js'
  },
  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules'
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: Infinity,
      filename: 'vendor.min.js'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: false,
      debug: true
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new WebpackSystemJSExportPlugin({
      externals: [
        'three'
      ],
      public: [
        'lodash',
      ],
      register: [{
        name: 'dynamic',
        alias: (chunk) => `myapp/${chunk}`
      }],
      bundleSystemJS: 'vendor'
    })
  ]
};

module.exports = config;
