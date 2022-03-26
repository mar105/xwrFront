import * as application from '../application';

export const prefix: string = 'xwrSale';
export const pageSize: number = application.pageSize;
export const urlMain: string = application.urlPrefix;
export const urlPrefix: string = application.url + '/' + prefix;
export const urlCommon: string = application.urlCommon;
export const urlUpload: string = application.urlUpload;

export function paramInit(param) {
  param.type = 'computerSale';
  return param;
}