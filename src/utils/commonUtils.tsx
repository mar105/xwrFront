import { Stomp } from "@stomp/stompjs";
import {urlSockJs, urlWebSocket} from "../application";
import SockJS from 'sockjs-client';
import moment from 'moment';
import dynamic from "dva/dynamic";
import * as React from "react";

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
  return snowflake.nextId();
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
export function getWebSocketData(token, subscribeName: string, callBack: any) {
  // 下面的url是本地运行的jar包的websocket地址
  let socket;
  if ('WebSocket' in window) {
    socket = new WebSocket(urlWebSocket);
  } else {
    socket = new SockJS(urlSockJs);
  }
  const stompClient = Stomp.over(socket);
  stompClient.connect({ authorization: token, groupId: '', shopId: '' }, frame => {
    //setConnected(true);
    console.log('Connected11: ' + frame);

    // websocket订阅一个topic，第一个参数是top名称
    // 第二个参数是一个回调函数,表示订阅成功后获得的data
    stompClient.subscribe('/topic/test', data => {
      // 一般来说这个data是一个 Frame对象,需要JSON.parse(data)一下拿到数据
      const msg = JSON.parse(data.body);
      console.log(12345678, msg);
      // 这样才能拿到需要的数据格式,一个对象。  下面是一个例子
      //  {name:"Andy",age:30,"lastLogin":"2018-08-15 12:33:12","ipAddress":"45.123.12.4"}
      //  然后对这个数据进行处理,渲染到页面就可以了。
    });

  }, error => {
    console.log("error1111:", error);
  });
}

export function setFieldsValue(value) {
  const returnValue = {};
  if (isNotEmptyObj(value)) {
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

export function panesComponent(pane, routeData) {
  const Component: any = dynamic({...routeData});
  return {key: pane.key, component: <Component tabId={pane.key} />};
};


export function getTableProps(name, props) {
  const tableParam ={
    name,
    enabled: props.enabled,
    dispatchModifyState: props.dispatchModifyState,
    scrollToRow: props[name + 'ScrollToRow'],
    property: { columns: props[name + 'Columns'], dataSource: props[name + 'Data'], loading: props[name + 'Loading'] },
    eventOnRow: { onRowClick: props.onRowClick },
    rowSelection: { selectedRowKeys: props[name + 'SelectedRowKeys'] },
    eventSelection: { onRowSelectChange: props.onRowSelectChange },
    config: props[name + 'Container'],
    onReachEnd: props.onReachEnd,
    event: { onInputChange: props.onInputChange, onCheckboxChange: props.onCheckboxChange,
      onNumberChange: props.onNumberChange, onSelectChange: props.onSelectChange, getSelectList: props.getSelectList  }
  }
  return tableParam;
};

/** 处理数据格式
 * name 名称
 * saveTmpData 表单数据
 * delTmpData 表单删除数据*/
export function mergeData(name, saveTmpData, delTmpData, isAll = false) {
  const delData = isEmptyArr(delTmpData) ? [] : delTmpData;
  const savesData = isEmptyArr(saveTmpData) ? [] : saveTmpData;
  const returnData = isAll ? savesData : savesData.filter(item => item.handleType === 'add' || item.handleType === 'modify');
  return { name, data: [...returnData, ...delData] };
}

/**   转换字符串为对象   */
export function stringToObj(str) {
  return isEmpty(str) ? {} : JSON.parse(str);
}

/**   对象转数组   */
export function objectToArr(obj) {
  const arr: any = [];
  if (isNotEmptyObj(obj)) {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      arr.push({ value, id: key });
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
  const returnProps = {commonModel, ...router.location.state };
  return returnProps;
}

export function paramGet(param) {
  let returnStr = '';
  Object.keys(param).forEach(key => {
    returnStr = returnStr === '' ? '?' + key + '=' + param[key] : returnStr + '&' + key + '=' + param[key];
  });
  return returnStr;
}

