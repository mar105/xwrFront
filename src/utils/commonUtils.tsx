import { Stomp } from "@stomp/stompjs";
import {urlSockJs, urlWebSocket} from "../application";
import SockJS from 'sockjs-client';
import moment from 'moment';
import dynamic from "dva/dynamic";
import * as React from "react";
import {Tooltip} from "antd";
import { PlusSquareOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, CopyOutlined } from '@ant-design/icons';

var Snowflake = (function() {
  function Snowflake(_workerId, _dataCenterId, _sequence) {
    this.twepoch = 1288834974657n;
    //this.twepoch = 0n;
    this.workerIdBits = 5n;
    this.dataCenterIdBits = 5n;
    this.maxWrokerId = -1n ^ (-1n << this.workerIdBits); // 值为：31
    this.maxDataCenterId = -1n ^ (-1n << this.dataCenterIdBits); // 值为：31
    this.sequenceBits = 12n;
    this.workerIdShift = this.sequenceBits; // 值为：12
    this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：17
    this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：22
    this.sequenceMask = -1n ^ (-1n << this.sequenceBits); // 值为：4095
    this.lastTimestamp = -1n;
    //设置默认值,从环境变量取
    this.workerId = 1n;
    this.dataCenterId = 1n;
    this.sequence = 0n;
    if (this.workerId > this.maxWrokerId || this.workerId < 0) {
      throw new Error('_workerId must max than 0 and small than maxWrokerId-[' + this.maxWrokerId + ']');
    }
    if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
      throw new Error('_dataCenterId must max than 0 and small than maxDataCenterId-[' + this.maxDataCenterId + ']');
    }

    this.workerId = BigInt(_workerId);
    this.dataCenterId = BigInt(_dataCenterId);
    this.sequence = BigInt(_sequence);
  }
  Snowflake.prototype.tilNextMillis = function(lastTimestamp) {
    var timestamp = this.timeGen();
    while (timestamp <= lastTimestamp) {
      timestamp = this.timeGen();
    }
    return BigInt(timestamp);
  };
  Snowflake.prototype.timeGen = function() {
    return BigInt(Date.now());
  };
  Snowflake.prototype.nextId = function() {
    var timestamp = this.timeGen();
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id for ' +
        (this.lastTimestamp - timestamp));
    }
    if (this.lastTimestamp === timestamp) {
      this.sequence = (this.sequence + 1n) & this.sequenceMask;
      if (this.sequence === 0n) {
        timestamp = this.tilNextMillis(this.lastTimestamp);
      }
    } else {
      this.sequence = 0n;
    }
    this.lastTimestamp = timestamp;
    return ((timestamp - this.twepoch) << this.timestampLeftShift) |
      (this.dataCenterId << this.dataCenterIdShift) |
      (this.workerId << this.workerIdShift) |
      this.sequence;
  };
  return Snowflake;
}());
const snowflake = new Snowflake(1n, 1n, 0n);

/**   创建主表id   */
export function newId() {
  return snowflake.nextId().toString();
}

export function isEmpty(value) {
  return value === null || value === undefined || value === '';
}

export function isNotEmpty(value) {
  return !isEmpty(value);
}

export function isEmptyArr(value) {
  return value === null || value === undefined || value === '' || value.length === 0;
}

export function isNotEmptyArr(value) {
  return Array.isArray(value) && !isEmptyArr(value);
}

export function isEmptyObj(value) {
  return value === null || value === undefined || value === '' || Object.keys(value).length === 0;
}

export function isNotEmptyObj(value) {
  return !isEmptyObj(value);
}

export function isEmptyorZero(value) {
  return value === null || value === undefined || value === '' || value === 0;
}

export function isNotEmptyorZero(value) {
  return !isEmptyorZero(value);
}

export function isEmptyDefault(value, defaultValue) {
  return isEmpty(value) ? defaultValue : value;
}

export function isEmptyorZeroDefault(value, defaultValue) {
  return isEmptyorZero(value) ? defaultValue : value;
}

//  websocket 推送消息
export function getWebSocketData(stompClientOld, onSuccess, authorization) {
  let socket;
  let stompClient;
  if (stompClientOld == null) {
    if ('WebSocket' in window) {
      socket = new WebSocket(urlWebSocket);
    } else {
      socket = new SockJS(urlSockJs);
    }
    stompClient = Stomp.over(socket);
  } else {
    stompClient = stompClientOld;
  }
  stompClient.connect({authorization}, frame => {
    onSuccess();
    // // websocket订阅一个topic，第一个参数是top名称
    // // 第二个参数是一个回调函数,表示订阅成功后获得的data
    stompClient.subscribe('/topic-websocket/heartbeat', data => {
      // 一般来说这个data是一个 Frame对象,需要JSON.parse(data)一下拿到数据
      stompClient.send('/websocket/heartbeat', {}, JSON.stringify({}));
      // 这样才能拿到需要的数据格式,一个对象。  下面是一个例子
      //  {name:"xwr"}
      //  然后对这个数据进行处理,渲染到页面就可以了。
    });
  });
  return stompClient;
}

//form.setFieldsValue时做个数据格式化。
export function setFieldsValue(value, container: any = null) {
  const returnValue = {};
  if (container) {
    Object.keys(value).forEach(item => {
      const index = container.slaveData.findIndex(config => config.fieldName === item);
      if (index > -1) {
        const config = container.slaveData[index];
        if (config.containerType === 'cascader') {
          returnValue[config.fieldName] = isEmpty(value[config.fieldName]) ? [] : value[config.fieldName].split(',');
        } else if (config.fieldType === 'datetime') {
          returnValue[config.fieldName] = isEmpty(value[config.fieldName]) ? null : moment(value[config.fieldName]);
        } else if (config.multiple) {
          returnValue[config.fieldName] = isEmpty(value[config.fieldName]) ? [] : typeof value[config.fieldName] === 'string' ? value[config.fieldName].split(',') : value[config.fieldName];
        } else {
          returnValue[config.fieldName] = value[config.fieldName];
        }
      } else {
        returnValue[item] = value[item];
      }
    });
  } else if (isNotEmptyObj(value)) {
    Object.keys(value).forEach(item => {
      if (item.substring(item.length - 4) === 'Date') {
        returnValue[item] = isEmpty(value[item]) ? null : moment(value[item]);
      } else {
        returnValue[item] = value[item];
      }
    });
  }
  return returnValue;
}

export function panesComponent(pane, routeData, callbackAddPane, callbackRemovePane, modalState?) {
  const Component: any = dynamic({...routeData});
  return {key: pane.key, component: <Component tabId={pane.key} modalState={modalState} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane}/>};
};


export function getTableProps(name, props) {
  //标准配置配置，直接把配置保存后后台配置表
  const configSetting = props.commonModel.userInfo.shopId === '1395719229487058944' ?
    <a onClick={props.onTableConfigSaveClick.bind(this, name)}> <Tooltip placement="top" title="列宽保存"><SaveOutlined /> </Tooltip></a> : '';
  const tableParam ={
    name,
    enabled: props.enabled,
    dispatchModifyState: props.dispatchModifyState,
    scrollToRow: props[name + 'ScrollToRow'],
    property: { columns: props[name + 'Columns'], dataSource: props[name + 'Data'], loading: props[name + 'Loading'] },
    sum: props[name + 'Sum'],
    eventOnRow: { onRowClick: props.onRowClick },
    rowSelection: { selectedRowKeys: props[name + 'SelectedRowKeys'] },
    eventSelection: { onRowSelectChange: props.onRowSelectChange },
    config: props[name + 'Container'],
    onReachEnd: props.onReachEnd, //分页滚动 拖动到最后调用接口
    onSortEnd: props.onSortEnd,
    draggableBodyRow: props.draggableBodyRow,
    isLastColumn: true,
    onLastColumnClick: props.onLastColumnClick,
    onTableChange: props.onTableChange,
    expandable: {onExpand: props.onExpand, expandedRowKeys: props[name + 'ExpandedRowKeys']},
    pagination: true, // 是否分页
    event: { onDataChange: props.onDataChange, getSelectList: props.getSelectList, onDropPopup: props.onDropPopup },
    lastTitle:
      <div> {props.enabled ? <a onClick={props.onTableAddClick.bind(this, name)}> <Tooltip placement="top" title="增加"><PlusOutlined /> </Tooltip></a> : '' }
      {props.enabled && props[name + 'Container'] && props[name + 'Container'].isTree ?
        <a onClick={props.onTableAddChildClick.bind(this, name)}> <Tooltip placement="top" title="增加子级"><PlusSquareOutlined /> </Tooltip></a> : '' }
    {configSetting}
    </div>,
    lastColumn: { title: 'o',
      render: (text,record, index)=> {
        return <div>
          <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, name, 'copyButton', record) : null}>
            <Tooltip placement="top" title="复制"><CopyOutlined /></Tooltip></a>
          {!props.enabled ? '' : <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, name, 'delButton', record) : null}>
      <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>}
      </div>
      }, width: 50 , fixed: 'right' }
  }
  return tableParam;
};


export function getUploadProps(name, props) {
  const uploadParam ={
    name,
    enabled: props.enabled,
    dispatchModifyState: props.dispatchModifyState,
    fileList: props[name + 'FileList'],
    delFileList: props[name + 'DelFileList'],
  }
  return uploadParam;
};

/** 处理数据格式
 * name 名称
 * saveTmpData 表单数据
 * delTmpData 表单删除数据
 * saveModifyTmpData 表单修改数据
 **/
const childMergeData = (treeData, isAll, returnData) => {
  treeData.forEach(data => {
    if (isNotEmptyArr(data.children)) {
      childMergeData(data.children, isAll, returnData);
    }
    if (isAll) {
      returnData.push(data);
    } else if (data.handleType === 'add') {
      returnData.push(data);
    }
  });
}

export function mergeData(name, saveTmpData, saveModifyTmpData, delTmpData, isAll = false) {
  const delData = isEmptyArr(delTmpData) ? [] : delTmpData;
  const savesData = isEmptyArr(saveTmpData) ? [] : saveTmpData;
  const returnData: any = [];
  let saveModifyData = isAll ? [] : isEmptyArr(saveModifyTmpData) ? [] : saveModifyTmpData;
  savesData.forEach(data => {
    if (isNotEmptyArr(data.children)) {
      childMergeData(data.children, isAll, returnData);
    }
    if (isAll) {
      returnData.push(data);
    } else if (data.handleType === 'add') {
      returnData.push(data);
    }

  });
  if (name === 'master' && isNotEmptyArr(saveTmpData) && saveTmpData[0].handleType === 'modify') {
    const rowData = { handleType: 'modify', id: saveTmpData[0].id, sortNum: saveTmpData[0].sortNum};
    saveModifyData = isEmptyArr(saveModifyData) ? [rowData] : [{...saveModifyData[0], ...rowData }];
  }
  return { name, data: [...returnData, ...saveModifyData, ...delData] };
}

/**   转换字符串为对象   */
export function stringToObj(str) {
  return isEmpty(str) ? {} : JSON.parse(str);
}

/**   转换字符串为对象   */
export function stringToArr(str) {
  return isEmpty(str) ? [] : JSON.parse(str);
}

/**   对象转数组   */
export function objectToArr(obj) {
  const arr: any = [];
  if (isNotEmptyObj(obj)) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      arr.push({ value, id: key, title: value });
    }
  }
  return arr;
}

export function getRouteComponent(routeInfo, path) {
  let routeReturn;
  for(const route of routeInfo) {
    if (route.path === path) {
      routeReturn = route;
      break;
    } else if (route.children) {
      return getRouteComponent(route.children, path);
    }
  }
  return routeReturn;
};

export function mapStateToProps(state) {
  const { commonModel, router } = state;
  const returnProps = { commonModel, state: router.location.state };
  return returnProps;
}

export function paramGet(param) {
  let returnStr = '';
  Object.keys(param).forEach(key => {
    returnStr = returnStr === '' ? '?' + key + '=' + param[key] : returnStr + '&' + key + '=' + param[key];
  });
  return returnStr;
}

/** 转换成相应小数位的数字 */
export function round(value, num) {
  num = isEmpty(num) ? 6 : num;
  const fix = '10000000000'.substring(0, num + 1);
  return Math.round(value * parseFloat(fix)) / parseFloat(fix);
}

export function getAssignFieldValue(name, assignField, option, allDataset = undefined) {
  const returnField = {};
  if (isNotEmpty(assignField)) {
    assignField.split(',').forEach(item => {
      const arrAssign = item.split('=');
      if (item.indexOf('=') > -1) {
        returnField[arrAssign[0].trim()] = isNotEmptyObj(option) ? copeDataSetValue(name, option, arrAssign[1].trim(), allDataset): '';
      } else {
        returnField[arrAssign[0].trim()] = isNotEmptyObj(option) ? option[arrAssign[1].trim()] : '';
      }
    });
  }
  return returnField;
}

/** 获取数据默认值  取消其他表值数据时  sTaxId:master.sTaxId */
export function getDefaultValue(container, allDataset) {
  let returnData = {};
  if (isNotEmptyObj(container)) {
    container.slaveData.filter(item => isNotEmpty(item.defaultValue)).forEach((childConfig) => {
      const {defaultValue, fieldName, fieldType} = childConfig;
      if (defaultValue.indexOf('=') > -1) { // && defaultValue.indexOf('.') > -1
        returnData = { ...returnData, ...getAssignFieldValue('', defaultValue, { default: ''}, allDataset) };
        // returnData[fieldName] = copeDataSetValue('', {}, defaultValue.split('=')[1].trim(), allDataset);
      } else {
        if (fieldType === 'tinyint') {
          returnData[fieldName] = parseInt(defaultValue);
        } else if (fieldType === 'datetime') {
          if (defaultValue === 'today') {
            returnData[fieldName] = moment().format('YYYY-MM-DD');
          } else {
            returnData[fieldName] = moment(defaultValue);
          }
        } else if (fieldType === 'int' || fieldType === 'smallint') {
          returnData[fieldName] = parseInt(defaultValue);
        } else if (fieldType === 'decimal') {
          returnData[fieldName] = parseFloat(defaultValue);
        } else {
          if (defaultValue === 'empty') {
            returnData[fieldName] = '';
          } else {
            returnData[fieldName] = defaultValue;
          }
        }
      }
    });
  }
  return returnData;
}

export function getTreeNodeById(treeData, id) {
  let treeNode: any = {};
  for(let index = 0; index < treeData.length; index++) {
    if (treeData[index].id === id) {
      treeNode = treeData[index];
      break;
    } else if (isNotEmptyArr(treeData[index].children)) {
      treeNode = getChildTreeNodeById(treeData[index].children, id);
    }
  }
  return treeNode;
}

export function getChildTreeNodeById(treeData, id) {
  let treeNode: any = { };
  for(let index = 0; index < treeData.length; index++) {
    if (treeData[index].id === id) {
      treeNode = treeData[index];
      break;
    } else if (isNotEmptyArr(treeData[index].children)) {
      treeNode = getChildTreeNodeById(treeData[index].children, id);
    }
  }
  return treeNode;
}

// 处理赋值赋值字段、默认值赋值字段 其他数据集value;
export function copeDataSetValue(name, record, assignValueField, allDataset) {
  const fieldName = assignValueField.trim();
  const dataSetName = fieldName.indexOf('.') > -1 ? fieldName.split('.')[0].trim() + 'Data' : name;
  const tableFieldName = fieldName.indexOf('.') > -1 ? fieldName.split('.')[1].trim() : fieldName;
  if (tableFieldName.split('&').length > 1 || tableFieldName.includes('+') || tableFieldName.includes('-') || tableFieldName.includes('*') ||
    tableFieldName.includes('/') || tableFieldName.includes('(') || tableFieldName.includes(')')) {
    let formula = fieldName;
    let formulaSplit = fieldName;
    formulaSplit = formulaSplit.split('+').join('$');
    formulaSplit = formulaSplit.split('-').join('$');
    formulaSplit = formulaSplit.split('*').join('$');
    formulaSplit = formulaSplit.split('/').join('$');
    formulaSplit = formulaSplit.split('(').join('$');
    formulaSplit = formulaSplit.split(')').join('$');
    formulaSplit.split('$').forEach((fieldNameItem) => {
      const oldFieldItem = fieldNameItem.trim();
      if (oldFieldItem.indexOf('.') > -1) {
        const dataSetName = oldFieldItem.split('.')[0].trim() + 'Data';
        const tableFieldName = oldFieldItem.split('.')[1].trim();
        if (isNotEmptyArr(allDataset[dataSetName])) {
          const selectedName = oldFieldItem.split('.')[0].trim() + 'SelectedRowKeys';
          if (isNotEmptyArr(allDataset[selectedName])) {
            const index = allDataset[dataSetName].findIndex(item => item.id === allDataset[selectedName][0]);
            if (index > -1) {
              // 加括号处理当值为负数时的异常
              formula = formula.replace(oldFieldItem, '(' + allDataset[dataSetName][index][tableFieldName] + ')');
            }
          }
        } else if (isNotEmptyObj(allDataset[dataSetName]) && allDataset[dataSetName][tableFieldName] !== undefined) {
          formula = formula.replace(oldFieldItem, '(' + allDataset[dataSetName][tableFieldName] + ')');
        } else if (tableFieldName.substring(0, 1) === '&') {
          formula = formula.replace(oldFieldItem, '');
        } else {
          formula = formula.replace(oldFieldItem, '0');
        }
      } else if (isNotEmpty(allDataset[dataSetName])) {
        const tableFieldName = oldFieldItem.trim();
        if (allDataset[dataSetName][tableFieldName] !== undefined) {
          // 加括号处理当值为负数时的异常
          formula = formula.replace(tableFieldName, '(' + allDataset[dataSetName][tableFieldName] + ')');
        } else if (tableFieldName.substring(0, 1) === '&') {
          formula = formula.replace(tableFieldName, '');
        } else {
          formula = formula.replace(tableFieldName, '0');
        }
      } else {
        const tableFieldName = oldFieldItem.trim();
        if (record[tableFieldName] !== undefined) {
          // 加括号处理当值为负数时的异常
          formula = formula.replace(tableFieldName, '(' + record[tableFieldName] + ')');
        } else if (tableFieldName.substring(0, 1) === '&') {
          formula = formula.replace(tableFieldName, '');
        } else {
          formula = formula.replace(tableFieldName, '0');
        }
      }
    });

    return tableFieldName.substring(0, 1) === '&' ? formula.split('+').join('') : round(eval(formula), 6);
  } else if ((name + 'Data') === dataSetName) {
    return record[tableFieldName];
  } else if (isNotEmpty(allDataset) && isNotEmpty(allDataset[dataSetName]) && typeof allDataset[dataSetName] === 'object' && allDataset[dataSetName].constructor === Object) {
    return allDataset[dataSetName][tableFieldName];
  } else if (isNotEmpty(allDataset) && isNotEmpty(allDataset[dataSetName])) {
    const selectedName = fieldName.split('.')[0].trim() + 'SelectedRowKeys';
    if (isNotEmptyArr(allDataset[selectedName])) {
      const treeNode = getTreeNodeById(allDataset[dataSetName], allDataset[selectedName][0]);
      return treeNode[tableFieldName];
    }
    return undefined;
  } else {
    return record[fieldName];
  }
}

// 处理赋值赋值字段、默认值赋值字段 其他数据集value;
export function getCondition(name, record, conditions, allDataset) {
  const returnCondition = {};
  if (isNotEmpty(conditions)) {
    conditions.split(',').forEach(condition => {
      if (condition.split('.').length > 2) {
        returnCondition[condition.split('.')[2]] = copeDataSetValue(name, record, condition, allDataset);
      } else if (condition.split('.').length > 1) {
        returnCondition[condition.split('.')[1]] = copeDataSetValue(name, record, condition, allDataset);
      }
    });
  }
  return returnCondition;
}

export function getViewName(container, fieldName) {
  const index = container.slaveData.findIndex(item => item.fieldName === fieldName);
  return index > -1 ? container.slaveData[index].viewName : '';
}

export function isJson(str) {
  if (typeof str == 'string') {
    try {
      JSON.parse(str);
      return true;
    } catch(e) {
      return false;
    }
  }
  return false;
}

export function downloadExcel(interfaceReturn) {
  if (interfaceReturn.headers.get('content-type') !== 'application/json') {
    interfaceReturn.blob().then((blob) => {
      const a = window.document.createElement('a');
      // 获取 blob 本地文件连接 (blob 为纯二进制对象，不能够直接保存到磁盘上) //此处的type按照导出的格式来，这里是.xls
      const downUrl = window.URL.createObjectURL(new Blob([blob], { type: "application/vnd.ms-excel" }));
      //定义导出文件的命名
      let fileName = "download.xls";
      //下面的if判断为获取后台配置的文件名称，如果获取不到则走自己定义的文件名称
      if (interfaceReturn.headers.get('Content-Disposition') && interfaceReturn.headers.get('Content-Disposition').indexOf("filename=") !== -1) {
        fileName = interfaceReturn.headers.get('Content-Disposition').split('filename=')[1];
        a.href = downUrl;
        a.download = decodeURI(fileName) || "download.xls";
        a.click();
        window.URL.revokeObjectURL(downUrl);
      } else {
        a.href = downUrl;
        a.download = "数据导出.xls";
        a.click();
        window.URL.revokeObjectURL(downUrl);
      }
    }).catch(error => {
      throw new Error(error);
    });
  }
}

//数量转换到换算数量
export function getMeasureQtyToQtyCalc(commonModel, dataRow, type, fieldName, calcFieldName, formulaIdFieldName, coefficientFieldName) {
  const returnRow: any = {};
  let styleWidth = 0;
  let styleLength = 0;
  let styleHeight = 0;
  const count = isEmpty(dataRow[type + 'Style']) ? 0 : dataRow[type + 'Style'].split('*').length - 1;
  if (count === 0) {
    styleWidth = dataRow[type + 'Style'];
  } else if (count === 1) {
    styleWidth = dataRow[type + 'Style'].split('*')[0];
    styleLength = dataRow[type + 'Style'].split('*')[1];
  } else if (count === 2) {
    styleLength = dataRow[type + 'Style'].split('*')[0];
    styleWidth = dataRow[type + 'Style'].split('*')[1];
    styleHeight = dataRow[type + 'Style'].split('*')[2];
  }
  styleLength = Number.isNaN(styleLength) ? 0 : styleLength;
  styleWidth = Number.isNaN(styleWidth) ? 0 : styleWidth;
  styleHeight = Number.isNaN(styleHeight) ? 0 : styleHeight;
  const shopInfo = commonModel.userInfo.shopInfo;
  const commonConstant = commonModel.commonConstant;
  const indexTon = commonConstant.findIndex(item => item.constantName === 'ton');
  const isTon = indexTon > -1 && (commonConstant[indexTon].chineseName === dataRow[type + 'Unit'] ||
    commonConstant[indexTon].englishName === dataRow[type + 'Unit'] ||
    commonConstant[indexTon].traditionalName === dataRow[type + 'Unit']);
  const indexKg = commonConstant.findIndex(item => item.constantName === 'kg');
  const isKg = indexKg > -1 && (commonConstant[indexKg].chineseName === dataRow[type + 'Unit'] ||
    commonConstant[indexKg].englishName === dataRow[type + 'Unit'] ||
    commonConstant[indexKg].traditionalName === dataRow[type + 'Unit']);
  const indexM2 = commonConstant.findIndex(item => item.constantName === 'm2');
  const isM2 = indexM2 > -1 && (commonConstant[indexM2].chineseName === dataRow[type + 'Unit'] ||
    commonConstant[indexM2].englishName === dataRow[type + 'Unit'] ||
    commonConstant[indexM2].traditionalName === dataRow[type + 'Unit']);
  const indexM2Inch = commonConstant.findIndex(item => item.constantName === 'm2Inch');
  const isM2Inch = indexM2Inch > -1 && (commonConstant[indexM2Inch].chineseName === dataRow[type + 'Unit'] ||
    commonConstant[indexM2Inch].englishName === dataRow[type + 'Unit'] ||
    commonConstant[indexM2Inch].traditionalName === dataRow[type + 'Unit']);
  const toM2 = shopInfo.unitType === 'mm' ? 1000 * 1000 : // 毫米转平方
    shopInfo.unitType === 'cm'? 100 * 100 : // 厘米转平方
      shopInfo.unitType === 'inch' ? 39.3700787402 * 39.3700787402 : // 英寸转平方
        1000 * 1000;
  const toM2Inch = shopInfo.unitType === 'mm' ? 39.3700787402 * 39.3700787402 : // 毫米转平方
    shopInfo.unitType === 'cm'? 3.93700787402 * 3.93700787402 : // 厘米转平方
      shopInfo.unitType === 'inch' ? 1 * 1 : // 英寸转平方
        1000 * 1000;
  const toM = shopInfo.unitType === 'mm' ? 1000 : // 毫米转米
    shopInfo.unitType === 'cm'? 100 : // 厘米转米
      shopInfo.unitType === 'inch' ? 39.3700787402 : // 英寸转米
        1000;
  const toMInch = shopInfo.unitType === 'mm' ? 39.3700787402 : // 毫米转平方
    shopInfo.unitType === 'cm'? 3.93700787402 : // 厘米转平方
      shopInfo.unitType === 'inch' ? 1 * 1 : // 英寸转平方
        1000;
  const toCartonM2 = shopInfo.cartonUnitType === 'mm' ? 1000 * 1000 : // 毫米转平方
    shopInfo.cartonUnitType === 'cm'? 100 * 100 : // 厘米转平方
      shopInfo.cartonUnitType === 'inch' ? 39.3700787402 * 39.3700787402 : // 英寸转平方
        1000 * 1000;
  const toCartonM2Inch = shopInfo.unitType === 'mm' ? 39.3700787402 * 39.3700787402 : // 毫米转平方
    shopInfo.unitType === 'cm'? 3.93700787402 * 3.93700787402 : // 厘米转平方
      shopInfo.unitType === 'inch' ? 1 * 1 : // 英寸转平方
        1000 * 1000;
  const cartonLength = shopInfo.cartonUnitType === 'mm' ? 70 : // 毫米
    shopInfo.cartonUnitType === 'cm'? 7 : // 厘米
      shopInfo.cartonUnitType === 'inch' ? 2.7559055 : // 英寸
        70; //纸箱增加长度
  const cartonWidth = shopInfo.cartonUnitType === 'mm' ? 50 : // 毫米
    shopInfo.cartonUnitType === 'cm'? 5 : // 厘米
      shopInfo.cartonUnitType === 'inch' ? 1.9685039 : // 英寸
        50; //纸箱增加宽度

  const indexReel = commonConstant.findIndex(item => item.constantName === 'reel');
  const reelUnit = indexReel > -1 ? commonConstant[indexReel].viewName : '';
  const indexPaper = commonConstant.findIndex(item => item.constantName === 'paper');
  const paperUnit = indexPaper > -1 ? commonConstant[indexPaper].viewName : '';

  const indexM = commonConstant.findIndex(item => item.constantName === 'm');
  const isM = indexM > -1 && (commonConstant[indexM].chineseName === dataRow[type + 'Unit'] ||
    commonConstant[indexM].englishName === dataRow[type + 'Unit'] ||
    commonConstant[indexM].traditionalName === dataRow[type + 'Unit']);

  if (isNotEmpty(dataRow[formulaIdFieldName])) {
    returnRow[calcFieldName] = round(getFormulaValue('slave', dataRow, dataRow[formulaIdFieldName], { slave: dataRow }, commonModel), 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }
  // 单位相同 数量相同
  else if (dataRow.measureUnit === dataRow[type + 'Unit']) {
    returnRow[calcFieldName] = round(dataRow.measureQty, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }
  //平张材料处理
  // 1张 门幅*长度 889*1194
  else if (count === 1 && dataRow.gramWeight > 0 && !dataRow.isReel && isTon) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength * dataRow.gramWeight / toM2 / 1000000, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  } else if (count === 1 && dataRow.gramWeight > 0 && !dataRow.isReel && isKg) {
    dataRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength * dataRow.gramWeight / toM2  / 1000, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  } else if (count === 1 && !dataRow.isReel && isM2) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength / toM2, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  } else if (count === 1 && !dataRow.isReel && isM2Inch) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength / toM2Inch, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }

  // 卷筒材料处理
  // 1张 门幅*长度 889*1194
  else if (count === 1 && dataRow.gramWeight > 0 && dataRow.isReel && isTon) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength * dataRow.gramWeight / toM2 / 1000000, 6);
    returnRow.measureUnit = paperUnit;
  } else if (count === 1 && dataRow.gramWeight > 0 && dataRow.isReel && isKg) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength * dataRow.gramWeight / toM2  / 1000, 6);
    returnRow.measureUnit = paperUnit;
  }
  // 1卷 门幅*长度m 889*500m
  else if (count === 1 && dataRow.isReel && isM2) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength / toM, 6);
    returnRow.measureUnit = reelUnit;
  }
  else if (count === 1 && dataRow.isReel && isM2) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * styleLength / toMInch, 6);
    returnRow.measureUnit = reelUnit;
  }
  // 1m 门幅889
  else if (isNotEmpty(dataRow[type + 'Style']) && dataRow.gramWeight > 0 && dataRow.isReel && isM && isTon) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * dataRow.gramWeight / toM2 / 1000000, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  } else if (isNotEmpty(dataRow[type + 'Style']) && dataRow.gramWeight > 0 && dataRow.isReel && isM && isKg) {
    returnRow[calcFieldName] = round(dataRow.measureQty * styleWidth * dataRow.gramWeight / toM2  / 1000, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }
  // 纸箱材料处理
  // 100*200*300 长宽高
  else if (count === 2 && !dataRow.isReel && isM2) {
    returnRow[calcFieldName] = round(dataRow.measureQty * (styleLength + styleWidth + cartonLength) * (styleWidth + styleHeight + cartonWidth) * 2 / toCartonM2, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }
  else if (count === 2 && !dataRow.isReel && isM2) {
    returnRow[calcFieldName] = round(dataRow.measureQty * (styleLength + styleWidth + cartonLength) * (styleWidth + styleHeight + cartonWidth) * 2 / toCartonM2Inch, 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }
  // 普通材料处理
  // 1 * 系数
  else {
    returnRow[calcFieldName] = round(dataRow.measureQty * isEmptyorZeroDefault(dataRow[coefficientFieldName], 1), 6);
    returnRow.measureUnit = dataRow.measureStoreUnit;
  }

  return returnRow;
}

//数量转换到换算数量
export function getMeasureQtyToConvertCalc(commonModel, dataRow, type, fieldName, calcFieldName, formulaIdFieldName, coefficientFieldName) {
  const returnRow: any = {};
  if (isNotEmpty(dataRow[formulaIdFieldName])) {
    returnRow[calcFieldName] = getFormulaValue('slave', dataRow, dataRow[formulaIdFieldName], {slave: dataRow}, commonModel);
  }
  // 单位相同 数量相同
  else if (dataRow.measureUnit === dataRow.convertUnit) {
    returnRow[calcFieldName] = round(dataRow.measureQty, 6);
  }
  // 普通材料处理
  // 1 * 系数
  else {
    returnRow[calcFieldName] = round(dataRow.measureQty * isEmptyorZeroDefault(dataRow[coefficientFieldName], 1), 6);
  }
  return returnRow;
}

export function getStdPriceToMoney(commonModel, masterData, dataRow, type, fieldName) {
  const moneyPlace = commonModel.userInfo.shopInfo ? commonModel.userInfo.shopInfo.moneyPlace : 6;
  const pricePlace = commonModel.userInfo.shopInfo ? commonModel.userInfo.shopInfo.pricePlace : 6;
  const returnRow: any = {};
  const stdQty = isEmptyorZeroDefault(dataRow[type + 'Qty'], 0);
  returnRow[type + 'StdPrice'] = round(isEmptyorZeroDefault(dataRow[type + 'StdPrice'], 0), pricePlace);

  // 计算金额
  returnRow[type + 'StdMoney'] = round(stdQty * isEmptyorZeroDefault(dataRow[type + 'StdPrice'], 0), moneyPlace);
  returnRow[type + 'Money'] = round(returnRow[type + 'StdMoney']
    + isEmptyorZeroDefault(dataRow.knifePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.makePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.proofingMoney, 0)
    + isEmptyorZeroDefault(dataRow.freightMoney, 0)
    + isEmptyorZeroDefault(dataRow.businessMoney, 0), moneyPlace);
  returnRow[type + 'Price'] = stdQty === 0 ? 0 : round(returnRow[type + 'Money'] / stdQty, pricePlace);

  returnRow[type + 'WithoutTaxMoney'] = round(returnRow[type + 'Money'] / (1 + isEmptyorZeroDefault(dataRow.taxRate, 0) / 100), moneyPlace);
  returnRow[type + 'WithoutTaxPrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'WithoutTaxMoney'] / stdQty, pricePlace);

  returnRow[type + 'TaxMoney'] = round(returnRow[type + 'Money'] - returnRow[type + 'WithoutTaxMoney'], moneyPlace);

  // 计算金额（本位币）
  const exchangeRate = isEmptyorZeroDefault(masterData.exchangeRate, 1);
  returnRow[type + 'StdBaseMoney'] = round(returnRow[type + 'StdMoney'] / exchangeRate, moneyPlace);
  returnRow[type + 'BaseMoney'] = round((returnRow[type + 'Money']
    + isEmptyorZeroDefault(dataRow.knifePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.makePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.proofingMoney, 0)
    + isEmptyorZeroDefault(dataRow.freightMoney, 0)
    + isEmptyorZeroDefault(dataRow.businessMoney, 0)) / exchangeRate, moneyPlace);
  returnRow[type + 'BasePrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'BaseMoney'] / stdQty, pricePlace);

  returnRow[type + 'WithoutTaxBaseMoney'] = round(returnRow[type + 'BaseMoney'] / (1 + isEmptyorZeroDefault(dataRow.taxRate, 0) / 100), moneyPlace);
  returnRow[type + 'WithoutTaxBasePrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'WithoutTaxBaseMoney'] / stdQty, pricePlace);

  returnRow[type + 'TaxBaseMoney'] = round(returnRow[type + 'BaseMoney'] - returnRow[type + 'WithoutTaxBaseMoney'], moneyPlace);

  //计算成本金额
  returnRow.costMoney = round(stdQty * isEmptyorZeroDefault(dataRow.costPrice, 0), moneyPlace);

  return returnRow;
}

export function getStdMoneyToPrice(commonModel, masterData, dataRow, type, fieldName) {
  const moneyPlace = commonModel.userInfo.shopInfo ? commonModel.userInfo.shopInfo.moneyPlace : 6;
  const pricePlace = commonModel.userInfo.shopInfo ? commonModel.userInfo.shopInfo.pricePlace : 6;

  const returnRow: any = {};
  const stdQty = isEmptyorZeroDefault(dataRow[type + 'Qty'], 0);
  returnRow[type + 'StdMoney'] = round(isEmptyorZeroDefault(dataRow[type + 'StdMoney'], 0), moneyPlace);

  // 计算价格
  returnRow[type + 'StdPrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'StdMoney'] / stdQty, pricePlace);
  returnRow[type + 'Money'] = round(returnRow[type + 'StdMoney']
    + isEmptyorZeroDefault(dataRow.knifePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.makePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.proofingMoney, 0)
    + isEmptyorZeroDefault(dataRow.freightMoney, 0)
    + isEmptyorZeroDefault(dataRow.businessMoney, 0), moneyPlace);
  returnRow[type + 'Price'] = stdQty === 0 ? 0 : round(returnRow[type + 'Money'] / stdQty, pricePlace);

  returnRow[type + 'WithoutTaxMoney'] = round(returnRow[type + 'Money'] / (1 + isEmptyorZeroDefault(dataRow.taxRate, 0) / 100), moneyPlace);
  returnRow[type + 'WithoutTaxPrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'WithoutTaxMoney'] / stdQty, pricePlace);

  returnRow[type + 'TaxMoney'] = round(returnRow[type + 'Money'] - returnRow[type + 'WithoutTaxMoney'], moneyPlace);

  // 计算金额（本位币）
  const exchangeRate = isEmptyorZeroDefault(masterData.exchangeRate, 1);
  returnRow[type + 'StdBaseMoney'] = round(returnRow[type + 'StdMoney'] / exchangeRate, moneyPlace);
  returnRow[type + 'BaseMoney'] = round((returnRow[type + 'Money']
    + isEmptyorZeroDefault(dataRow.knifePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.makePlateMoney, 0)
    + isEmptyorZeroDefault(dataRow.proofingMoney, 0)
    + isEmptyorZeroDefault(dataRow.freightMoney, 0)
    + isEmptyorZeroDefault(dataRow.businessMoney, 0)) / exchangeRate, moneyPlace);
  returnRow[type + 'BasePrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'BaseMoney'] / stdQty, pricePlace);

  returnRow[type + 'WithoutTaxBaseMoney'] = round(returnRow[type + 'BaseMoney'] / (1 + isEmptyorZeroDefault(dataRow.taxRate, 0) / 100), moneyPlace);
  returnRow[type + 'WithoutTaxBasePrice'] = stdQty === 0 ? 0 : round(returnRow[type + 'WithoutTaxBaseMoney'] / stdQty, pricePlace);

  returnRow[type + 'TaxBaseMoney'] = round(returnRow[type + 'BaseMoney'] - returnRow[type + 'WithoutTaxBaseMoney'], moneyPlace);

  returnRow.costPrice = round(isEmptyorZeroDefault(dataRow.costMoney, 0) / isEmptyorZeroDefault(stdQty, 1), pricePlace);
  return returnRow;
}


//公式替换参数并计算
export function getFormulaValue(name, dataRow, formulaId, allDataRow, commonModel) {
  const { formulaParamList, formulaList } = commonModel;
  const index = formulaList.findIndex(item => item.id === formulaId);
  if (index > -1) {
    let formula = formulaList[index].formula;
    for(const key of Object.keys(allDataRow)) {
      formulaParamList.filter(item => item.paramType === key).forEach(formulaParam => {
        const splitField = formulaParam.fieldName.split('.');
        if (splitField.length > 1) {
          const value = name === key ? dataRow[splitField[0]] : allDataRow[key][splitField[0]];
          if (isNotEmpty(value)) {
            if (splitField[1] === 'left') {
              formula = formula.replace(formulaParam.paramName, value.split('*')[0]);
            } else if (splitField[1] === 'center') {
              formula = formula.replace(formulaParam.paramName, value.split('*')[1]);
            } else if (value.split('*').length > 1 && splitField[1] === 'right') {
              formula = value.split('*').length > 2 ? formula.replace(formulaParam.paramName, value.split('*')[2]) : formula.replace(formulaParam.paramName, value.split('*')[1]);
            }
          }
        } else {
          const value = name === key ? dataRow[formulaParam.fieldName] : allDataRow[key][formulaParam.fieldName];
          if (isNotEmpty(value)) {
            formula = formula.replace(formulaParam.paramName, value);
          }
        }
        // else {
        //   formula = formula.replace(formulaParam.paramName, 0);
        // }
      });
    }
    try {
      return eval(formula);
    }
    catch (e) {
      console.error(e);
      return 0;
    }
  } else {
    return 0;
  }
}

export function getSettleDate(dataRow) {
  let settleDate = moment().format('YYYY-MM-DD');
  if (dataRow.settleType === 'moment') {

  } else if (dataRow.settleType === 'month') {
    //按设置加月份。
    settleDate = moment(settleDate).add(dataRow.monthValue, 'months').format('YYYY-MM-DD');
    const day = moment(settleDate).get('date');
    //日期超过结账日加一月。
    if ( day > dataRow.settleDay) {
      settleDate = moment(settleDate).add(1, 'months').format('YYYY-MM-DD');
    }
    //结账日超过 月 的最后一天以最后一天为主。
    const endDay = moment(settleDate).endOf('month').get('date');
    settleDate = moment(settleDate).set('date', dataRow.settleDay > endDay ? endDay : dataRow.settleDay).format('YYYY-MM-DD');
  } else if (dataRow.settleType === 'deliverAfter') {
    if (isNotEmpty(dataRow.deliverDate)) {
      settleDate = moment(dataRow.deliverDate).add(1, 'months').format('YYYY-MM-DD');
    } else {
      settleDate = moment(settleDate).add(dataRow.deliverAfterDay, 'days').format('YYYY-MM-DD');
    }
  }
  return settleDate;
}