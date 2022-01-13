import {TableComponent} from "../../../components/TableComponent";
import React, {useEffect, useRef } from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import { PlusOutlined, CloudSyncOutlined, CopyOutlined, DeleteOutlined, SnippetsOutlined } from '@ant-design/icons';
import {Tooltip} from "antd";
import copy from "copy-to-clipboard";
import {isJson} from "../../../utils/commonUtils";


const SlaveContainer = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const { name } = props;
  const columns = [
    { title: '排序号', dataIndex: 'sortNum', fieldType: 'decimal', sortNum: 10, width: 100, fixed: 'left' },
    { title: '名称', dataIndex: 'fieldName', isRequired: true, fieldType: 'varchar', sortNum: 20, width: 300, fixed: 'left' },
    { title: '名称|中文', dataIndex: 'chineseName', isRequired: true, fieldType: 'varchar', sortNum: 31, width: 150 },
    { title: '名称|繁体', dataIndex: 'traditionalName', fieldType: 'varchar', sortNum: 32, width: 150 },
    { title: '名称|英文', dataIndex: 'englishName', fieldType: 'varchar', sortNum: 33, width: 150 },
    { title: '是否显示', dataIndex: 'isVisible', fieldType: 'tinyint', sortNum: 34, width: 150 },
    { title: '是否必填', dataIndex: 'isRequired', fieldType: 'tinyint', sortNum: 35, width: 150 },
    { title: '是否求和', dataIndex: 'isSum', fieldType: 'tinyint', sortNum: 36, width: 150 },
    { title: '宽度', dataIndex: 'width', fieldType: 'decimal', sortNum: 37, width: 150 },
    { title: '字段|类型', dataIndex: 'containerType', fieldType: 'varchar', dropType: 'const',
      viewDrop: '{ "field": "字段", "relevance": "关联性字段", "spare": "备用字段", "control": "控件", "cascader": "级联" }', defaultValue: 'field', sortNum: 38, width: 150 },
    { title: '字段|字段类型', dataIndex: 'fieldType', isRequired: true, fieldType: 'varchar', dropType: 'const', isDropEmpty: true, viewDrop: '{ "varchar": "字符型", "decimal": "数字型", "int": "整型", "smallint": "微整型", "datetime": "日期型", "tinyint": "布尔型", "text": "备注型" }', sortNum: 40, width: 150 },
    { title: '字段|关联性', dataIndex: 'fieldRelevance', fieldType: 'varchar', sortNum: 50, width: 150 },
    { title: '字段|关联性条件', dataIndex: 'conditionRelevance', fieldType: 'varchar', sortNum: 60, width: 150 },
    { title: '字段|关联性赋值', dataIndex: 'assignFieldRelevance', fieldType: 'varchar', sortNum: 70, width: 150 },
    { title: '字段|虚拟名称', dataIndex: 'virtualRelevance', fieldType: 'varchar', sortNum: 80, width: 150 },
    { title: '弹出界面', dataIndex: 'popupActiveName', fieldType: 'varchar', sortNum: 160, width: 150, dropType: 'sql', isDropEmpty: true, keyUpFieldDrop: 'viewName', assignField: 'popupActiveId=id' },
    { title: '弹出界面Key', dataIndex: 'popupActiveKey', fieldType: 'varchar', sortNum: 170, width: 150 },
    { title: '查询界面', dataIndex: 'popupSelectName', fieldType: 'varchar', sortNum: 180, width: 150, dropType: 'sql', isDropEmpty: true, keyUpFieldDrop: 'viewName', assignField: 'popupSelectId=id' },
    { title: '查询界面Key', dataIndex: 'popupSelectKey', fieldType: 'varchar', sortNum: 190, width: 150 },

    { title: '下拉|类型', dataIndex: 'dropType', fieldType: 'varchar', dropType: 'const', isDropEmpty: true, viewDrop: '{ "sql": "sql语句", "const": "常量", "popup": "选择框与定位" }', sortNum: 200, width: 150 },
    { title: '下拉|中文', dataIndex: 'chineseDrop', fieldType: 'varchar', sortNum: 210, width: 150 },
    { title: '下拉|繁体', dataIndex: 'traditionalDrop', fieldType: 'varchar', sortNum: 220, width: 150 },
    { title: '下拉|英文', dataIndex: 'englishDrop', fieldType: 'varchar', sortNum: 230, width: 150 },
    { title: '下拉|关键字', dataIndex: 'keyUpFieldDrop', fieldType: 'varchar', sortNum: 240, width: 150 },
    { title: '下拉|赋值字段', dataIndex: 'assignField', fieldType: 'varchar', sortNum: 241, width: 150 },
    { title: '下拉|虚拟方式', dataIndex: 'virtualDrop', fieldType: 'varchar', sortNum: 250, width: 150 },
    { title: '下拉|条件', dataIndex: 'sqlCondition', fieldType: 'varchar', sortNum: 260, width: 150 },
    { title: '下拉|是否新增', dataIndex: 'isDropAdd', fieldType: 'tinyint', sortNum: 261, width: 150 },
    { title: '下拉|是否空数据', dataIndex: 'isDropEmpty', fieldType: 'tinyint', sortNum: 270, width: 150 },
    { title: '下拉|是否多选', dataIndex: 'isMultiChoise', fieldType: 'tinyint', sortNum: 280, width: 150 },
    { title: '下拉|宽度', dataIndex: 'dropWidth', fieldType: 'decimal', sortNum: 290, width: 150 },

    { title: '下拉|是否树型', dataIndex: 'isTreeDrop', fieldType: 'tinyint', sortNum: 291, width: 150 },
    { title: '下拉|树型主Key', dataIndex: 'treeKeyDrop', fieldType: 'varchar', sortNum: 292, width: 150 },
    { title: '下拉|树型从Key', dataIndex: 'treeSlaveKeyDrop', fieldType: 'varchar', sortNum: 293, width: 150 },
    { title: '下拉|树型展示列', dataIndex: 'treeColumnNameDrop', fieldType: 'varchar', sortNum: 294, width: 150 },

    { title: '是否只读', dataIndex: 'isReadOnly', fieldType: 'tinyint', sortNum: 310, width: 150 },
    { title: '初始状态', dataIndex: 'tagType', fieldType: 'varchar', dropType: 'const', isDropEmpty: true, viewDrop: '{ "alwaysReadonly": "永久只读", "alwaysModify": "永久编辑" }', sortNum: 320, width: 150 },
    { title: '默认值', dataIndex: 'defaultValue', fieldType: 'varchar', sortNum: 330, width: 150 },
    { title: '是否搜索', dataIndex: 'isSearch', fieldType: 'tinyint', sortNum: 340, width: 150 },
    { title: '最大值', dataIndex: 'maxValue', fieldType: 'varchar', sortNum: 350, width: 150 },
    { title: '最小值', dataIndex: 'minValue', fieldType: 'varchar', sortNum: 360, width: 150 },
    { title: '日期格式', dataIndex: 'dateFormat', fieldType: 'varchar', sortNum: 370, width: 150 },
    { title: '是否合并展示', dataIndex: 'isMerge', fieldType: 'tinyint', sortNum: 380, width: 150 },
    { title: '是否数字不能为0', dataIndex: 'isNotZero', fieldType: 'tinyint', sortNum: 390, width: 150 },
    { title: '是否当前数据过滤', dataIndex: 'isFilter', fieldType: 'tinyint', sortNum: 400 },
  ];

  useEffect(() => {
    const { dispatchModifyState } = props;
    const slaveContainer: any = {};
    const slaveConfig: any = [];
    columns.forEach(item => {
      const config = {...item, viewName: item.title, fieldName: item.dataIndex };
      slaveConfig.push(config);
    });
    slaveContainer.isMultiChoise = true;
    slaveContainer.slaveData = slaveConfig;
    dispatchModifyState({slaveColumns: columns, slaveContainer, slaveIsLastPage: true });
  }, []);

  const onClick = async (name, e) => {
    const { commonModel, dispatch, dispatchModifyState, slaveContainer, slaveData: slaveDataOld, slaveDelData: slaveDelDataOld, slaveSelectedRows } = propsRef.current;
    if (name === 'slaveAddButton') {
      const data = props.onAdd(slaveContainer);
      data.superiorId = propsRef.current.masterData.id;
      data.containerType = 'field';
      data.sortNum = slaveDataOld.length + 1;
      data.assignField = '';
      data.fieldRelevance = '';
      data.assignFieldRelevance = '';
      data.virtualRelevance = '';
      data.virtualDrop = '';
      data.chineseDrop = '';
      data.traditionalDrop = '';
      data.englishDrop = '';
      const slaveData = [...slaveDataOld];
      slaveData.push(data);
      dispatchModifyState({ slaveData, slaveScrollToRow: slaveData.length });
    } else if (name === 'slaveSyncDataButton') {
      if (propsRef.current.masterData.containerName === 'noTable') { return };
      const url: string = application.urlPrefix + '/container/getDBFields?tableName=' + propsRef.current.masterData.containerName;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        const slaveData = [...slaveDataOld];
        const slaveDelData = commonUtils.isEmptyArr(slaveDelDataOld) ? [] : [...slaveDelDataOld];
        if (commonUtils.isNotEmptyArr(interfaceReturn.data)) {
          for(const dataRow of slaveData.filter(item => item.containerType === 'field')) {
            const index = interfaceReturn.data.findIndex(item => item.columnName === dataRow.fieldName);
            if (!(index > -1)) {
              dataRow.handleType = 'del';
              slaveDelData.push(dataRow);
              const rowIndex = slaveData.findIndex(item => item.fieldName === dataRow.fieldName);
              if (rowIndex > -1) {
                slaveData.splice(rowIndex, 1);
              }
            }
          }
          let sortNum = 1;
          if (commonUtils.isNotEmptyArr(slaveDataOld)) {
            slaveDataOld.sort((a, b) => (a.sortNum > b.sortNum) ? 1 : -1);
            sortNum = slaveDataOld[0].sortNum;
          }

          interfaceReturn.data.forEach((dataRow, rowIndex)  => {
            const index = slaveData.findIndex(item => item.containerType === 'field' && item.fieldName === dataRow.columnName);
            if (!(index > -1)) {
              const data = props.onAdd(slaveContainer);
              data.superiorId = propsRef.current.masterData.id;
              data.fieldName = dataRow.columnName;
              data.containerType = 'field';
              data.fieldType = dataRow.dataType;
              data.chineseName = dataRow.columnComment;
              data.sortNum = sortNum + rowIndex;
              data.assignField = '';
              data.fieldRelevance = '';
              data.assignFieldRelevance = '';
              data.virtualRelevance = '';
              data.virtualDrop = '';
              data.chineseDrop = '';
              data.traditionalDrop = '';
              data.englishDrop = '';
              slaveData.push(data);
            } else {
              const data = { ...props.onModify(), ...slaveData[index] };
              data.chineseName = dataRow.columnComment;
              data.containerType = 'field';
              slaveData[index] = data;
            }
          });
          dispatchModifyState({ slaveData, slaveDelData });
        }

      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else if (name === 'slaveCopyToMultiButton') {
      copy(JSON.stringify(slaveSelectedRows));
      props.gotoSuccess(dispatch, {code: '1', msg: '已复制到剪贴板'});
    } else if (name === 'slavePasteButton') {
      //本地127.0.0.1可以测试，其他不能测试，如 192.168.1.3 属于不安全访问
      if (navigator.clipboard) {
        const clipboardText: any = await navigator.clipboard.readText();
        if (isJson(clipboardText)) {
          const slaveData = [...slaveDataOld];
          const clipboardValue = JSON.parse(clipboardText);
          if (commonUtils.isNotEmptyArr(clipboardValue)) {
            clipboardValue.forEach((item, index) => {
              let data = props.onAdd({}); // 不要默认值。
              data.superiorId = propsRef.current.masterData.id;
              data.sortNum = slaveDataOld.length + index + 1;
              data = { ...item, ...data };
              slaveData.push(data);
            });
          } else {
            let data = props.onAdd({}); // 不要默认值。
            data.superiorId = propsRef.current.masterData.id;
            data.sortNum = slaveDataOld.length + 1;
            data = { ...clipboardValue, ...data };
            slaveData.push(data);
          }
          dispatchModifyState({ slaveData, slaveScrollToRow: slaveData.length });
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
  tableParam.width = 2200;
  tableParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, name, 'copyToClipboardButton', record)}>
      <Tooltip placement="top" title="复制到剪贴版"><CopyOutlined /></Tooltip></a>
      <a onClick={onLastColumnClick.bind(this, name, 'delButton', record)}>
      <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
    </div>
  }, width: 100, fixed: 'right' };
  tableParam.lastTitle = <div>
    <a onClick={onClick.bind(this, name + 'CopyToMultiButton')} > <Tooltip placement="top" title="复制到剪贴版"><CopyOutlined /> </Tooltip></a>
    { !props.enabled ? '' : <a onClick={onClick.bind(this, name + 'AddButton')}> <Tooltip placement="top" title="增加"><PlusOutlined /> </Tooltip></a> }
    { !props.enabled ? '' : <a onClick={onClick.bind(this, name + 'PasteButton')} > <Tooltip placement="top" title="粘贴增加行"><SnippetsOutlined /> </Tooltip></a> }
    { !props.enabled ? '' : <a onClick={onClick.bind(this, name + 'SyncDataButton')}> <Tooltip placement="top" title="同步字段"><CloudSyncOutlined /> </Tooltip></a> }
  </div>;

  return (
    <div>
      {props.slaveContainer ? <TableComponent {...tableParam} /> : ''}
    </div>
  );
}
export default SlaveContainer;