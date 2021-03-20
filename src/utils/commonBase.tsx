import * as commonUtils from "./commonUtils";

export function onAdd() {
  const dataRow: any = {};
  dataRow.handleType = 'add';
  dataRow.id = commonUtils.newId();
  dataRow.key = dataRow.id;
  return dataRow;
}