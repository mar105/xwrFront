export const prefix: string = 'xwrManage';
export const pageSize: number = 20;
export const urlPrefix: string = 'http://127.0.0.1:8202/xwrBasic';

export function paramInit(param) {
  param.type = 'computerBasic';
  return param;
}
