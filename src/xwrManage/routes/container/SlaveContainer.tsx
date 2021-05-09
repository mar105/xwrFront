import {TableComponent} from "../../../components/TableComponent";
import React, {useEffect} from "react";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonComponent} from "../../../components/ButtonComponent";
import {componentType} from "../../../utils/commonTypes";
import * as application from "../../application";
import * as request from "../../../utils/request";

const SlaveContainer = (props) => {

  const { name, enabled } = props;
  const columns = [
    { title: '排序号', dataIndex: 'sortNum', fieldType: 'decimal', sortNum: 1, width: 80, fixed: 'left' },
    { title: '名称', dataIndex: 'fieldName', fieldType: 'varchar', sortNum: 3, width: 150, fixed: 'left' },
    { title: '字段|类型', dataIndex: 'containerType', fieldType: 'varchar', dropType: 'const', viewDrop: '{ "field": "字段", "relevance": "关联性字段", "control": "控件" }', defaultValue: 'field', sortNum: 2, width: 150 },
    { title: '字段|类型', dataIndex: 'fieldType', fieldType: 'varchar', dropType: 'const', viewDrop: '{ "varchar": "字符型", "decimal": "数字型", "int": "整型", "smallint": "微整型", "datetime": "日期型", "tinyint": "布尔型", "text": "备注型" }', sortNum: 4, width: 150 },
    { title: '名称|中文', dataIndex: 'chineseName', fieldType: 'varchar', sortNum: 5, width: 150 },
    { title: '名称|繁体', dataIndex: 'traditionalName', fieldType: 'varchar', sortNum: 6, width: 150 },
    { title: '名称|英文', dataIndex: 'englishName', fieldType: 'varchar', sortNum: 7, width: 150 },
    { title: '是否必填', dataIndex: 'isRequired', fieldType: 'tinyint', sortNum: 8, width: 150 },
    { title: '是否显示', dataIndex: 'isVisible', fieldType: 'tinyint', sortNum: 9, width: 150 },
    { title: '是否求和', dataIndex: 'isSum', fieldType: 'tinyint', sortNum: 10, width: 150 },
    { title: '宽度', dataIndex: 'width', fieldType: 'decimal', sortNum: 11, width: 150 },
    { title: '弹出界面', dataIndex: 'popupActiveName', fieldType: 'varchar', sortNum: 12, width: 150, dropType: 'sql',
      viewDrop: 'Select routeName, id From manRoute Where isDel = 0 and (char_length(routeName) - char_length(REPLACE(routeName, \'/\', \'\'))) >= 2 Order By sortNum ' },
    { title: '查询界面', dataIndex: 'popupSelectName', fieldType: 'varchar', sortNum: 12, width: 150, dropType: 'sql',
      viewDrop: 'Select routeName, id From manRoute Where isDel = 0 and (char_length(routeName) - char_length(REPLACE(routeName, \'/\', \'\'))) >= 2 Order By sortNum ' },
    { title: '下拉类型', dataIndex: 'dropType', fieldType: 'varchar', dropType: 'const', viewDrop: '{ "sql": "sql语句", "const": "常量", "popupActive": "选择框", "popupSelect": "定位", "popupActiveSelect": "选择框与定位" }', sortNum: 13, width: 150 },
    { title: '中文下拉', dataIndex: 'chineseDrop', fieldType: 'varchar', sortNum: 14, width: 150 },
    { title: '繁体下拉', dataIndex: 'traditionalDrop', fieldType: 'varchar', sortNum: 15, width: 150 },
    { title: '英文下拉', dataIndex: 'englishDrop', fieldType: 'varchar', sortNum: 16, width: 150 },
    { title: '下拉条件', dataIndex: 'sqlCondition', fieldType: 'varchar', sortNum: 17, width: 150 },
    { title: '是否下拉选择空数据', dataIndex: 'isDropEmpty', fieldType: 'tinyint', sortNum: 1, width: 150 },
    { title: '下拉宽度', dataIndex: 'dropWidth', fieldType: 'decimal', sortNum: 18, width: 150 },
    { title: '赋值字段', dataIndex: 'assignField', fieldType: 'varchar', sortNum: 19, width: 150 },
    { title: '是否只读', dataIndex: 'isReadOnly', fieldType: 'tinyint', sortNum: 20, width: 150 },
    { title: '初始状态', dataIndex: 'tagType', fieldType: 'varchar', sortNum: 21, width: 150 },
    { title: '默认值', dataIndex: 'defaultValue', fieldType: 'varchar', sortNum: 22, width: 150 },
    { title: '是否搜索', dataIndex: 'isSearch', fieldType: 'tinyint', sortNum: 23, width: 150 },
    { title: '最大值', dataIndex: 'maxValue', fieldType: 'varchar', sortNum: 24, width: 150 },
    { title: '最小值', dataIndex: 'minValue', fieldType: 'varchar', sortNum: 25, width: 150 },
    { title: '日期格式', dataIndex: 'dateFormat', fieldType: 'varchar', sortNum: 26, width: 150 },
    { title: '是否合并展示', dataIndex: 'isMerge', fieldType: 'tinyint', sortNum: 27, width: 150 },
    { title: '是否数字不能为0', dataIndex: 'isNotZero', fieldType: 'tinyint', sortNum: 28, width: 150 },
    { title: '是否当前数据过滤', dataIndex: 'isFilter', fieldType: 'tinyint', sortNum: 29, width: 150 },
  ];

  useEffect(() => {
    const { dispatchModifyState } = props;
    dispatchModifyState({slaveColumns: columns});
  }, []);


  const onClick = async (name, e) => {
    const { commonModel, dispatch, dispatchModifyState, masterData, slaveData: slaveDataOld, slaveDelData: slaveDelDataOld } = props;
    if (name === 'slaveAddBtn') {
      const data = props.onAdd();
      data.superiorId = masterData.id;
      data.type = 'field';
      data.sortNum = slaveDataOld.length;
      data.assignField = '';
      const slaveData = [...slaveDataOld];
      slaveData.push(data);
      dispatchModifyState({ slaveData, slaveScrollToRow: slaveData.length });
    } else if (name === 'slaveSyncDataBtn') {
      const url: string = `${application.urlPrefix}/container/getDBFields?tableName=` + masterData.containerName;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        const slaveData = [...slaveDataOld];
        const slaveDelData = commonUtils.isEmptyArr(slaveDelDataOld) ? [] : [...slaveDelDataOld];
        if (commonUtils.isNotEmptyArr(interfaceReturn.data)) {
          slaveData.filter(item => item.containerType === 'field').forEach((dataRow, rowIndex) => {
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
            const index = slaveData.findIndex(item => item.containerType === 'field' && item.fieldName === dataRow.columnName);
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
          dispatchModifyState({ slaveData, slaveDelData });
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
  tableParam.isDragRow = true;
  tableParam.property.columns = commonUtils.isEmptyArr(tableParam.property.columns) ? columns : tableParam.property.columns;
  return (
    <div>
      <ButtonComponent {...button} />
      <ButtonComponent {...syncDataButton} />
      <TableComponent {...tableParam} />
    </div>
  );
}
export default SlaveContainer;