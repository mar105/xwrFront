import * as commonUtils from "./commonUtils";

export function onAdd() {
  const dataRow: any = {};
  dataRow.handleType = 'add';
  dataRow.id = commonUtils.newId();
  dataRow.key = dataRow.id;
  return dataRow;
}

export function onModify() {
  const dataRow: any = {};
  dataRow.handleType = 'modify';
  return dataRow;
}

export function gotoError(dispatch, interfaceData) {
  dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
}