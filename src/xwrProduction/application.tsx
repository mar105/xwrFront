import * as application from '../application';

export const prefix: string = 'xwrProduction';
export const pageSize: number = application.pageSize;
export const urlMain: string = application.urlPrefix;
export const urlPrefix: string = application.url + '/' + prefix;
export const urlCommon: string = application.urlCommon;
export const urlBasic: string = application.urlBasic;
export const urlUpload: string = application.urlUpload;

export function paramInit(param) {
  param.type = 'computerProduction';
  return param;
}