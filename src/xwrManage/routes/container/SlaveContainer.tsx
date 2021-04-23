import {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import React from "react";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonComponent} from "../../../components/ButtonComponent";
import {componentType} from "../../../utils/commonTypes";

const SlaveContainer = (props) => {

  const { name, slaveData, enabled, slaveSelectedRowKeys } = props;
  const columns = [
    { title: '类型', dataIndex: 'type', fieldType: 'varchar', dropType: 'const', width: 150 },
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

  const onClick = (e) => {
    const { dispatchModifyState, masterData, slaveData: slaveDataOld } = props;
    const data = props.onAdd();
    data.parentId = masterData.id;
    data.type = 'field';
    const slaveData = [...slaveDataOld];
    slaveData.push(data);
    dispatchModifyState({ slaveData });
  }

  const button = {
    caption: '增加',
    property: { name: name + 'Add', htmlType: 'button', disabled: !enabled },
    event: { onClick },
    componentType: componentType.Soruce,
  };

  const tableParam: any = commonUtils.getTableProps(name, props);
  tableParam.property.columns = columns;
  const slaveTable = useMemo(()=>{
    return (<div>
      <ButtonComponent {...button} />
      <TableComponent {...tableParam} />
    </div>)}, [slaveData, enabled, slaveSelectedRowKeys]);
  return (slaveTable);
}
export default SlaveContainer;