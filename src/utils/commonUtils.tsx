import { Stomp } from "@stomp/stompjs";
import {urlSockJs, urlWebSocket} from "../application";
import SockJS from 'sockjs-client';
import moment from 'moment';
import dynamic from "dva/dynamic";
import * as React from "react";
import {Tooltip} from "antd";
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

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

//  websocket 推送消息
var stompClient: any = null;
export function getWebSocketData(authorization) {
  if(stompClient === null || !stompClient.connected) {
    let socket;
    if ('WebSocket' in window) {
      socket = new WebSocket(urlWebSocket);
    } else {
      socket = new SockJS(urlSockJs);
    }
    stompClient = Stomp.over(socket);
    stompClient.connect({authorization}, frame => {
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
  }
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

export function panesComponent(pane, routeData, callbackAddPane, callbackRemovePane) {
  const Component: any = dynamic({...routeData});
  return {key: pane.key, component: <Component tabId={pane.key} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane}/>};
};


export function getTableProps(name, props) {
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
    pagination: true, // 是否分页
    event: { onInputChange: props.onInputChange, onCheckboxChange: props.onCheckboxChange, onNumberChange: props.onNumberChange,
      onSelectChange: props.onSelectChange, onDatePickerChange: props.onDatePickerChange, getSelectList: props.getSelectList,
      onCascaderChange: props.onCascaderChange },
    lastTitle: <a onClick={props.onTableAddClick.bind(this, name)}> <Tooltip placement="top" title="增加"><PlusOutlined /> </Tooltip></a>,
    lastColumn: { title: 'o',
      render: (text,record, index)=> {
        return <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, name, 'delButton', record) : null}>
          <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
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
export function mergeData(name, saveTmpData, saveModifyTmpData, delTmpData, isAll = false) {
  const delData = isEmptyArr(delTmpData) ? [] : delTmpData;
  const savesData = isEmptyArr(saveTmpData) ? [] : saveTmpData;
  let saveModifyData = isAll ? [] : isEmptyArr(saveModifyTmpData) ? [] : saveModifyTmpData;
  const returnData = isAll ? savesData : savesData.filter(item => item.handleType === 'add'); // || item.handleType === 'modify'
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
  const fix = '10000000000'.substring(0, num + 1);
  return Math.round(value * parseFloat(fix)) / parseFloat(fix);
}

export function getAssignFieldValue(assignField, option, allDataset = undefined) {
  const returnField = {};
  if (isNotEmptyObj(option) && isNotEmpty(assignField)) {
    assignField.split(',').forEach(item => {
      const arrAssign = item.split('=');
      if (item.indexOf('=') > -1 && item.indexOf('.') > -1) {
        returnField[arrAssign[0].trim()] = copeDataSetValue(arrAssign[1].trim(), allDataset);
      } else {
        returnField[arrAssign[0].trim()] = option[arrAssign[1].trim()];
      }
    });
  }
  return returnField;
}

/** 获取数据默认值  取消其他表值数据时  sTaxId:master.sTaxId */
export function getDefaultValue(container, allDataset) {
  const returnData = {};
  if (isNotEmptyObj(container)) {
    container.slaveData.filter(item => isNotEmpty(item.defaultValue)).forEach((childConfig) => {
      const {defaultValue, fieldName, fieldType} = childConfig;
      if (defaultValue.indexOf('=') > -1 && defaultValue.indexOf('.') > -1) {
        returnData[fieldName] = copeDataSetValue(defaultValue.split('=')[1].trim(), allDataset);
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
          returnData[fieldName] = defaultValue;
        }
      }
    });
  }
  return returnData;
}

// 处理赋值赋值字段、默认值赋值字段 其他数据集value;
export function copeDataSetValue(assignValueField, allDataset) {
  const oldFieldName = assignValueField;
  const dataSetName = oldFieldName.split('.')[0] + 'Data';
  const oldTableFieldName = oldFieldName.split('.')[1];
  if (isNotEmptyObj(allDataset[dataSetName])) {
    if (oldFieldName.includes('+') || oldFieldName.includes('-') || oldFieldName.includes('*') ||
      oldFieldName.includes('/') || oldFieldName.includes('(') || oldFieldName.includes(')')) {
      let formula = oldFieldName;
      let formulaSplit = oldFieldName;
      formulaSplit = formulaSplit.split('+').join('$');
      formulaSplit = formulaSplit.split('-').join('$');
      formulaSplit = formulaSplit.split('*').join('$');
      formulaSplit = formulaSplit.split('/').join('$');
      formulaSplit = formulaSplit.split('(').join('$');
      formulaSplit = formulaSplit.split(')').join('$');
      formulaSplit.split('$').forEach((oldFieldNameItem) => {
        const oldFieldItem = oldFieldNameItem.trim();
        if (oldFieldItem.indexOf('.') > -1) {
          const dataSetName = oldFieldItem.split('.')[0].trim() + 'Data';
          const oldTableFieldName = oldFieldItem.split('.')[1].trim();
          if (isNotEmptyObj(allDataset[dataSetName]) && allDataset[dataSetName][oldTableFieldName] !== undefined) {
            formula = formula.replace(oldFieldItem, allDataset[dataSetName][oldTableFieldName]);
          }
        } else {
          const oldTableFieldName = oldFieldItem.trim();
          if (allDataset[dataSetName][oldTableFieldName] !== undefined) {
            formula = formula.replace(oldTableFieldName, `(${allDataset[dataSetName][oldTableFieldName]})`);
            /* 加括号处理当值为负数时的异常 */
          }
        }
      });
      return oldTableFieldName.substring(0, 1) === '&' ? formula.split('+').join('') : round(eval(formula), 6);
    } else {
      return allDataset[dataSetName][oldTableFieldName];
    }
  } else {
    return '';
  }
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
        a.download = `${decodeURI(fileName)}` || "download.xls";
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