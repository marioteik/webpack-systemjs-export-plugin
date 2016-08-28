const webpack = require('webpack');
const path = require('path');

const nodeExternals = require('webpack-node-externals');

let env = process.env['NODE_ENV'];
let isProduction = env && env.match(/production/);

let config = {
  context: path.join(__dirname, 'src'),
  entry: './webpack-systemjs-export-plugin',
  target: "node",
  node: {
    __dirname: false,
    process: false
  },
  externals: [nodeExternals()],
  output: {
    path: __dirname,
    filename: '[name].js',
    library: "[name]",
    libraryTarget: "umd"
  },
  resolve: {
    extensions: ['', '.ts', '.tsx', '.js'],
    modules: [
      path.resolve('./src'),
      'node_modules'
    ]
  },
  module: {
    loaders: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  ts: {
    transpileOnly: true
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: isProduction,
      debug: !isProduction
    })
  ]
};



if (isProduction) {
  // Production Mode
  config = Object.assign(
    {},
    config,
    {
      plugins: [
        ...config.plugins,
        new webpack.optimize.UglifyJsPlugin()
        ]
    });

}

module.exports = config;
