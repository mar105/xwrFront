import {TableComponent} from "../../../components/TableComponent";
import React, {useEffect, useRef } from "react";
import * as commonUtils from "../../../utils/commonUtils";
import { PlusOutlined, CopyOutlined, DeleteOutlined, SnippetsOutlined } from '@ant-design/icons';
import {Tooltip} from "antd";
import copy from "copy-to-clipboard";
import {isJson} from "../../../utils/commonUtils";
import { scrollTo } from 'virtuallist-antd';

const SyncContainer = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const { name } = props;
  const columns = [
    { title: '排序号', dataIndex: 'sortNum', fieldType: 'decimal', sortNum: 10, width: 120, fixed: 'left' },
    { title: '类型', dataIndex: 'syncType', isRequired: true, fieldType: 'varchar',  dropType: 'const',
      viewDrop: '{ "save": "保存时", "saveAfter": "保存后", "saveAfterRelevance": "保存后关联", "examineAfter": "审核后", "delAfter": "删除后" }', defaultValue: 'saveAfter', sortNum: 38, width: 150 },
    { title: '容器名称', dataIndex: 'containerViewName', isRequired: true, fieldType: 'varchar', dropType: 'sql',
      isTreeDrop: true, dropdownMatchSelectWidth: 400, assignField: 'containerViewName=viewName,containerId=id', treeKeyDrop: 'id', treeColumnNameDrop: 'viewName', sortNum: 31, width: 150 },
    { title: '异步key', dataIndex: 'tableSyncKey', fieldType: 'varchar', sortNum: 32, width: 150 },
  ];

  useEffect(() => {
    const { dispatchModifyState } = props;
    const syncContainer: any = {};
    const syncConfig: any = [];
    columns.forEach(item => {
      const config = {...item, viewName: item.title, fieldName: item.dataIndex };
      syncConfig.push(config);
    });
    syncContainer.isMultiChoise = true;
    syncContainer.slaveData = syncConfig;
    dispatchModifyState({syncColumns: columns, syncContainer, syncIsLastPage: true });
  }, []);

  const onClick = async (name, e) => {
    const { dispatch, dispatchModifyState, syncContainer, syncData: syncDataOld, syncSelectedRows } = propsRef.current;
    if (name === 'syncAddButton') {
      const data = props.onAdd(syncContainer);
      data.superiorId = propsRef.current.masterData.id;
      data.containerType = 'saveAfter';
      data.sortNum = syncDataOld.length + 1;
      const syncData = [...syncDataOld];
      syncData.push(data);
      dispatchModifyState({ syncData });
      setTimeout(() => {
        scrollTo({row: syncData.length, vid: props.tabId + 'sync'});
      }, 200);
    } else if (name === 'syncCopyToMultiButton') {
      copy(JSON.stringify(syncSelectedRows));
      props.gotoSuccess(dispatch, {code: '1', msg: '已复制到剪贴板'});
    } else if (name === 'syncPasteButton') {
      //本地127.0.0.1可以测试，其他不能测试，如 192.168.1.3 属于不安全访问
      if (navigator.clipboard) {
        const clipboardText: any = await navigator.clipboard.readText();
        if (isJson(clipboardText)) {
          const syncData = [...syncDataOld];
          const clipboardValue = JSON.parse(clipboardText);
          if (commonUtils.isNotEmptyArr(clipboardValue)) {
            clipboardValue.forEach((item, index) => {
              let data = props.onAdd({}); // 不要默认值。
              data.superiorId = propsRef.current.masterData.id;
              data.sortNum = syncDataOld.length + index + 1;
              data = { ...item, ...data };
              syncData.push(data);
            });
          } else {
            let data = props.onAdd({}); // 不要默认值。
            data.superiorId = propsRef.current.masterData.id;
            data.sortNum = syncDataOld.length + 1;
            data = { ...clipboardValue, ...data };
            syncData.push(data);
          }
          setTimeout(() => {
            scrollTo({ row: syncData.length, vid: props.tabId + 'sync' });
          }, 200);
        } else {
          props.gotoError(dispatch, {code: '5000', msg: '不能复制其他数据！'});
        }
      } else {
        props.gotoError(dispatch, {code: '5000', msg: '此浏览器不支持复制'});
      }

    }
  }

  const onLastColumnClick = (name, key, record, e, isWait = false) => {
    const { dispatch } = propsRef.current;
    if (key === 'copyToClipboardButton') {
      copy(JSON.stringify(record));
      props.gotoSuccess(dispatch, {code: '1', msg: '已复制到剪贴板'});
    } else if (props.onLastColumnClick) {
      props.onLastColumnClick(name, 'delButton', record, e, isWait);
    }
  };


  const tableParam: any = commonUtils.getTableProps(name, props);
  tableParam.isDragRow = true;
  tableParam.property.columns = commonUtils.isEmptyArr(tableParam.property.columns) ? columns : tableParam.property.columns;
  tableParam.width = 1200;
  tableParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, name, 'copyToClipboardButton', record)}>
      <Tooltip placement="top" title="复制到剪贴版"><CopyOutlined /></Tooltip></a>
      <a onClick={onLastColumnClick.bind(this, name, 'delButton', record)}>
      <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
    </div>
  }, width: 80, fixed: 'right' };
  tableParam.lastTitle = <div>
    <a onClick={onClick.bind(this, name + 'CopyToMultiButton')} > <Tooltip placement="top" title="复制到剪贴版"><CopyOutlined /> </Tooltip></a>
    { !props.enabled ? '' : <a onClick={onClick.bind(this, name + 'AddButton')}> <Tooltip placement="top" title="增加"><PlusOutlined /> </Tooltip></a> }
    { !props.enabled ? '' : <a onClick={onClick.bind(this, name + 'PasteButton')} > <Tooltip placement="top" title="粘贴增加行"><SnippetsOutlined /> </Tooltip></a> }
  </div>;

  return (
    <div>
      {props.syncContainer ? <TableComponent {...tableParam} /> : ''}
    </div>
  );
}
export default SyncContainer;