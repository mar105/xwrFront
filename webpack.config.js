const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = true; //process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.tsx'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
    historyApiFallback: true,
  },
  resolve: {extensions: ['.js', '.jsx', '.css', '.json', '.less', '.ts', '.tsx']},
  module: {
    rules: [{
      test: /\.(ts|tsx)?$/,
      include: path.resolve(__dirname, 'src'),
      exclude: path.resolve(__dirname, 'node_modules'),
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/react', '@babel/preset-env', '@babel/preset-typescript'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            ['import', {libraryName: 'antd', libraryDirectory: 'es', style: 'true' }], // `style: true` 会加载 less 文件
          ],
        }
      },
    }, {
      test: /\.css$/,
      use: [devMode  ? "style-loader" : MiniCssExtractPlugin.loader, "css-loader"]
    }, {
      test: /\.less$/,
      use: [{
          loader: "style-loader" // creates style nodes from JS strings
      }, {
          loader: "css-loader" // translates CSS into CommonJS
      }, {
          loader: "less-loader",// compiles Less to CSS
          options: {
              sourceMap: true,
              modifyVars: {'primary-color': 'red', 'link-color': 'black', 'border-radius-base': '2px'},
              javascriptEnabled: true,
          }
      }]
    }, {
      test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
      loader: 'file-loader'
    }, {
      test:/\.(jpg|png|gif|bmp|jpeg)$/,
      use:'url-loader?limit=8908&name=[hash:8]-[name].[ext]'
    }]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new htmlWebpackPlugin({
      hash: true,
      template: './src/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    })
  ]
};
