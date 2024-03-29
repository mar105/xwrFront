/**
 * @file htmlConfig.js  页面html配置
 * @use: 动态配置html页面，获取src下每个文件下的pageinfo.json内容,解析到HtmlWebpackPlugin中
 */

const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");//生成html文件
const getFilePath = require("./getFilepath");
let htmlArr = [];

getFilePath("./src").map((item)=>{
  let infoJson ={}, infoData={};
  try{
    // 读取pageinfo.json文件内容，如果在页面目录下没有找到pageinfo.json 捕获异常
    infoJson = fs.readFileSync('src/' + item + '/pageinfo.json',"utf-8");//
    infoData = JSON.parse(infoJson);
  }catch(err){
    infoData = {};
  }
  if (item == 'index') {
    htmlArr.push(new HtmlWebpackPlugin({
      hash: true,
      template: './src/index.html',
      favicon: './src/favicon.ico',
      chunks: ['index'],
    }));
  } else {
    htmlArr.push(new HtmlWebpackPlugin({
      hash: true,
      title: infoData.title ? infoData.title : "webpack,react多页面架构",
      meta:{
        keywords: infoData.keywords ? infoData.keywords : "webpack，react，github",
        description:infoData.description ? infoData.description : "这是一个webpack，react多页面架构"
      },
      chunks:[item + '/' + item], //引入的js
      // template: "./src/index.html",
      template: "./src/template.html",
      favicon: './src/favicon.ico',
      inject: true,
      filename : item + '/index.html', //html位置
      minify:{//压缩html
        collapseWhitespace: true,
        preserveLineBreaks: true
      },
    }));
  }

});



module.exports = htmlArr;