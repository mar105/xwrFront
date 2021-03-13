const path = require('path');
const getFilePath = require("./getFilepath");

// 获取开发环境重定向的规则，只在开发环境中使用
function getRewritesList(){
  // 获取各个模块
  const moduleList = getFilePath('./src');

  // 需要在开发环境重写的规则数组
  const rewrites = [];  // webpack-dev-server的historyApiFallback中使用
  for(let index in moduleList){
    const moduleName = moduleList[index]
    // 以模块名开头的路径，重定向到 改模块下的index.html模板文件 比如路径一以/a开头，会重定向到a模块下的index.html
    rewrites.push({
      from:new RegExp('^\/' + moduleName),
      to: path.resolve(__dirname, '/' + moduleName +'/index.html')
    })
  }
  return rewrites;
}

module.exports = {
  getRewritesList
};