export const prefix: string = 'xwrMain';
export const pageSize: number = 20;
export const url: string = 'http://127.0.0.1:8202';
export const urlWs: string = 'ws://127.0.0.1:8202';
export const urlPrefix: string = url + '/xwrMain';
export const urlManage: string = url + '/xwrManage';
export const urlCommon: string = url + '/xwrCommon';
export const urlSockJs: string = url + '/sockjs';
export const urlWebSocket: string = urlWs + '/websocket';

export function paramInit(param) {
  param.type = 'computer';
  return param;
}
