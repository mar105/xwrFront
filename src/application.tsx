export const prefix: string = 'xwrMain';
export const pageSize: number = 20;
export const urlPrefix: string = 'http://127.0.0.1:8202/xwrMain';
export const urlCommon: string = 'http://127.0.0.1:8202/xwrCommon';
export const urlSockJs: string = 'http://127.0.0.1:8202/sockjs';
export const urlWs: string = 'ws://127.0.0.1:8202/websocket';

export function paramInit(param) {
  param.type = 'computer';
  return param;
}
