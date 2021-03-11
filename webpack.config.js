const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const getEntry = require("./webpackConfig/getEntry"); //入口配置
const entryArr = getEntry("./src");
const htmlArr =require("./webpackConfig/htmlConfig");// html配置

// const { getThemeVariables } = require('antd/dist/theme');
// const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'production',
  entry: entryArr, //path.resolve(__dirname, './src/index.tsx'),
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
            ['import', {libraryName: 'antd', libraryDirectory: 'es', style: true }], // `style: true` 会加载 less 文件
          ],
        }
      },
    }, {
      test: /\.css$/,
      use: ["style-loader", "css-loader"]
    }, {
      test: /\.less$/,
      use: [{
          loader: "style-loader" // creates style nodes from JS strings
      }, {
          loader: "css-loader" // translates CSS into CommonJS
      }, {
          loader: "less-loader",// compiles Less to CSS
          options: {
            lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级直接配置选项。
              // modifyVars: getThemeVariables({
              //   dark: true, // 开启暗黑模式
              //   compact: true, // 开启紧凑模式
              // }),
              modifyVars: {
                'primary-color': '#1DA57A',
                'link-color': '#1DA57A',
                'border-radius-base': '2px',
              },
              javascriptEnabled: true,
            },
          },
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
    ...htmlArr, // html插件数组
    // new htmlWebpackPlugin({
    //   hash: true,
    //   template: './src/index.html'
    // })
  ]
};
