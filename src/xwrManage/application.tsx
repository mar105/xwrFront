import * as application from '../application';

export const prefix: string = 'xwrManage';
export const pageSize: number = application.pageSize;
export const urlPrefix: string = application.urlPrefix + '/xwrManage';
export const urlCommon: string = application.urlCommon;

export function paramInit(param) {
  param.type = 'computerManage';
  return param;
}



