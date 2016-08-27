const webpack = require('webpack');
const path = require('path');

let env = process.env['NODE_ENV'];
let isProduction = env && env.match(/production/);

let config = {
  context: path.join(__dirname, 'src'),
  entry: './webpack-systemjs-plugin',
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
      loader: 'ts-loader'
    }]
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
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production')
          }
        })]
    });

}

module.exports = config;
