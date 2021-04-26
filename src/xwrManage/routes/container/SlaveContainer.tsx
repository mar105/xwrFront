import {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import React from "react";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonComponent} from "../../../components/ButtonComponent";
import {componentType} from "../../../utils/commonTypes";
import * as application from "../../application";
import * as request from "../../../utils/request";

const SlaveContainer = (props) => {

  const { name, slaveData, enabled, slaveSelectedRowKeys } = props;
  const columns = [
    { title: '类型', dataIndex: 'containerType', fieldType: 'varchar', dropType: 'const', dropOptions: '{ "field": "字段", "relevance":"关联性字段", "control": "控件" }', defaultValue: 'field', width: 150 },
    { title: '字段名称', dataIndex: 'fieldName', fieldType: 'varchar', width: 150 },
    { title: '字段类型', dataIndex: 'fieldType', fieldType: 'varchar', width: 150 },
    { title: '中文名称', dataIndex: 'chineseName', fieldType: 'varchar', width: 150 },
    { title: '繁体名称', dataIndex: 'traditionalName', fieldType: 'varchar', width: 150 },
    { title: '英文名称', dataIndex: 'englishName', fieldType: 'varchar', width: 150 },
    { title: '排序号', dataIndex: 'sortNum', fieldType: 'decimal', width: 150 },
    { title: '是否必填', dataIndex: 'isRequired', fieldType: 'tinyint', width: 150 },
    { title: '是否显示', dataIndex: 'isVisible', fieldType: 'tinyint', width: 150 },
    { title: '是否求和', dataIndex: 'isSum', fieldType: 'tinyint', width: 150 },
    { title: '宽度', dataIndex: 'width', fieldType: 'decimal', width: 150 },
    { title: '弹出界面', dataIndex: 'activeName', fieldType: 'varchar', width: 150 },
    { title: '下拉类型', dataIndex: 'dropType', fieldType: 'varchar', width: 150 },
    { title: '中文下拉', dataIndex: 'chineseDrop', fieldType: 'varchar', width: 150 },
    { title: '繁体下拉', dataIndex: 'traditionalDrop', fieldType: 'varchar', width: 150 },
    { title: '英文下拉', dataIndex: 'englishDrop', fieldType: 'varchar', width: 150 },
    { title: '下拉条件', dataIndex: 'sqlCondition', fieldType: 'varchar', width: 150 },
    { title: '是否下拉选择空数据', dataIndex: 'isDropEmpty', fieldType: 'tinyint', width: 150 },
    { title: '下拉宽度', dataIndex: 'dropWidth', fieldType: 'decimal', width: 150 },
    { title: '赋值字段', dataIndex: 'assignField', fieldType: 'varchar', width: 150 },
    { title: '是否只读', dataIndex: 'isReadOnly', fieldType: 'tinyint', width: 150 },
    { title: '初始状态', dataIndex: 'tagType', fieldType: 'varchar', width: 150 },
    { title: '默认值', dataIndex: 'defaultValue', fieldType: 'varchar', width: 150 },
    { title: '是否搜索', dataIndex: 'isSearch', fieldType: 'tinyint', width: 150 },
    { title: '最大值', dataIndex: 'maxValue', fieldType: 'varchar', width: 150 },
    { title: '最小值', dataIndex: 'minValue', fieldType: 'varchar', width: 150 },
    { title: '日期格式', dataIndex: 'dateFormat', fieldType: 'varchar', width: 150 },
    { title: '是否合并展示', dataIndex: 'isMerge', fieldType: 'tinyint', width: 150 },
    { title: '是否数字不能为0', dataIndex: 'isNotZero', fieldType: 'tinyint', width: 150 },
    { title: '是否当前数据过滤', dataIndex: 'isFilter', fieldType: 'tinyint', width: 150 },
  ];

  const onClick = async (name, e) => {
    const { commonModel, dispatch, dispatchModifyState, masterData, slaveData: slaveDataOld, slaveDelData: slaveDelDataOld } = props;
    if (name === 'slaveAddBtn') {
      const data = props.onAdd();
      data.parentId = masterData.id;
      data.type = 'field';
      const slaveData = [...slaveDataOld];
      slaveData.push(data);
      dispatchModifyState({ slaveData, slaveSelectedRowKeys: [data.id] });
    } else if (name === 'slaveSyncDataBtn') {
      const url: string = `${application.urlPrefix}/container/getDBFields?tableName=` + masterData.containerName;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        const slaveData = [...slaveDataOld];
        const slaveDelData = commonUtils.isEmptyArr(slaveDelDataOld) ? [] : [...slaveDelDataOld];
        if (commonUtils.isNotEmptyArr(interfaceReturn.data)) {
          slaveData.filter(item => item.type === 'field').forEach((dataRow, rowIndex) => {
            const index = interfaceReturn.data.findIndex(item => item.columnName === dataRow.fieldName);
            if (!(index > -1)) {
              dataRow.handleType = 'del';
              slaveDelData.push(dataRow);
              slaveData.splice(rowIndex, 1);
            }
          });
          let sortNum = 1;
          if (commonUtils.isNotEmptyArr(slaveDataOld)) {
            slaveDataOld.sort((a, b) => (a.sortNum > b.sortNum) ? 1 : -1);
            sortNum = slaveDataOld[0].sortNum;
          }

          interfaceReturn.data.forEach((dataRow, rowIndex)  => {
            const index = slaveData.findIndex(item => item.type === 'field' && item.fieldName === dataRow.columnName);
            if (!(index > -1)) {
              const data = props.onAdd();
              data.superiorId = masterData.id;
              data.containerType = 'field';
              data.fieldName = dataRow.columnName;
              data.fieldType = dataRow.dataType;
              data.chineseName = dataRow.columnComment;
              data.sortNum = sortNum + rowIndex;
              data.assignField = '';
              slaveData.push(data);
            }
          });
          dispatchModifyState({ slaveData, slaveDelData, slaveSelectedRowKeys: [slaveData[0].id] });
        }

      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }

  const button = {
    caption: '增加',
    property: { name: name + 'AddBtn', htmlType: 'button', disabled: !enabled },
    event: { onClick: onClick.bind(this, name + 'AddBtn') },
    componentType: componentType.Soruce,
  };

  const syncDataButton = {
    caption: '同步字段',
    property: { name: name + 'SyncDataBtn', htmlType: 'button', disabled: !enabled },
    event: { onClick: onClick.bind(this, name + 'SyncDataBtn') },
    componentType: componentType.Soruce,
  };

  const tableParam: any = commonUtils.getTableProps(name, props);
  tableParam.property.columns = columns;
  const slaveTable = useMemo(()=>{
    return (<div>
      <ButtonComponent {...button} />
      <ButtonComponent {...syncDataButton} />
      <TableComponent {...tableParam} />
    </div>)}, [slaveData, enabled, slaveSelectedRowKeys]);
  return (slaveTable);
}
export default SlaveContainer;