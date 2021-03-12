/**
 * @file: getEntry.js 获取entry文件入口 优化入口方法 调用getFilePath
 */
const getFilePath = require("./getFilepath");
/**
 * 【获取entry文件入口】
 *
 * @param {String} path 引入根路径
 * @returns {Object} 返回的entry { "about/aoubt":"./src/about/about.js",...}
 */
module.exports = function getEntry(pathOld){
  const entry = {};
  getFilePath(pathOld).map((item)=>{
    /**
     * 下面输出格式为{"about/about":"./src/xwrManage/index.tsx"}
     * 这样目的是为了将js打包到对应的文件夹下
     */
    const path = pathOld.substring(1, pathOld.length);
    if (item === 'index') {
      entry['index'] = `${path}/index.tsx`;
    } else {
      entry[`${item}/${item}`] = `${path}/${item}/index.tsx`;
    }
  });
  console.log('getEntry', entry);
  return entry;
};