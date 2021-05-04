import * as application from '../application';

export const prefix: string = 'xwrBasic';
export const pageSize: number = application.pageSize;
export const urlPrefix: string = application.urlPrefix + '/xwrBasic';
export const urlCommon: string = application.urlCommon;

export function paramInit(param) {
  param.type = 'computerBasic';
  return param;
}
