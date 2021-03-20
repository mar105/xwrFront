import * as commonUtils from "./commonUtils";

export function onAdd() {
  const mainData: any = {};
  mainData.handleType = 'add';
  mainData.sId = commonUtils.newId();
  return mainData;
}