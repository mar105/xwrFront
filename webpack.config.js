const path = require('path');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: path.resolve(__dirname, './src/index.tsx'),
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bunlde.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
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
          presets: ['@babel/react', '@babel/preset-env', '@babel/preset-typescript']
        }
      },
      // loader: 'babel-loader',
      // options: {
      //   presets: [
      //     '@babel/preset-env',
      //     '@babel/preset-react',
      //     '@babel/preset-typescript'
      //   ],
      //   plugins: [
      //     ['import', { libraryName: 'antd', style: 'css' }], // `style: true` 会加载 less 文件
      //   ],
      // }
    },
    {
      test: /\.css$/,
        use: ['style-loader', 'css-loader']
    }
  ]},
  plugins: [
    new CleanWebpackPlugin(),
    new htmlWebpackPlugin({
    template: './index.html'
  })]
};
