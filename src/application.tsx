export const prefix: string = 'xwrMain';
export const pageSize: number = 20;
export const url: string = 'http://47.100.221.61:8202';
export const urlWs: string = 'ws://47.100.221.61:8202';
export const urlReport: string = 'http://192.168.3.3:8075';
export const urlPrefix: string = url + '/' + prefix;
export const urlManage: string = url + '/xwrManage';
export const urlCommon: string = url + '/xwrCommon';
export const urlBasic: string = url + '/xwrBasic';
export const urlSockJs: string = url + '/sockjs';
export const urlWebSocket: string = urlWs + '/websocket';
export const urlUpload: string = url + '/upload';

export function paramInit(param) {
  param.type = 'computer';
  return param;
}
