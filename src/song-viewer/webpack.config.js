const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: path.resolve(__dirname, './index.ts'),
  devtool: false,
  mode: 'development',
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
      options: {
        appendTsSuffixTo: [/\.vue$/],
      }
    }, {
      test: /\.vue$/,
      loader: 'vue-loader',
    }, {
      test: /\.css$/,
      use: [
        'vue-style-loader',
        'css-loader',
      ]
    }, {
      test: /\.scss$/,
      use: [
        'vue-style-loader',
        'css-loader',
        'sass-loader',
      ]
    }]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([path.resolve(__dirname, 'index.html')]),
  ],
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
    },
    extensions: ['.vue', '.ts', '.js'],
  },
  output: {
    filename: 'dist.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
    before: function(app) {
      // use proper mime-type for wasm files
      app.get('*.wasm', function(req, res, next) {
          var options = {
              root: path.join(__dirname, 'dist'),
              dotfiles: 'deny',
              headers: {
                  'Content-Type': 'application/wasm'
              }
          };
          res.sendFile(req.url, options, function (err) {
              if (err) {
                  next(err);
              }
          });
      });
    }
  }
};
