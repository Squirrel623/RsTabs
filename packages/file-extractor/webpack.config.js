const path = require('path');

module.exports = {
  entry: './demo/index.ts',
  devtool: false,
  mode: 'development',
  module: {
    rules: [{
      test: /.ts$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'dist.js',
    path: path.resolve(__dirname, 'demo'),
  }
};
