import {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import React from "react";
import * as commonUtils from "../../../utils/commonUtils";

const SlaveContainer = (props) => {
  const {slaveData, enabled } = props;
  const columns = [
    { title: '类型', dataIndex: 'type', width: 150 },
    { title: '字段名称', dataIndex: 'fieldName', width: 150 },
    { title: '字段类型', dataIndex: 'fieldType', width: 150 },
    { title: '中文名称', dataIndex: 'chineseName', width: 150 },
    { title: '繁体名称', dataIndex: 'traditionalName', width: 150 },
    { title: '英文名称', dataIndex: 'englishName', width: 150 },
    { title: '排序号', dataIndex: 'sortNum', width: 150 },
    { title: '是否必填', dataIndex: 'isRequired', width: 150 },
    { title: '是否显示', dataIndex: 'isVisible', width: 150 },
    { title: '是否求和', dataIndex: 'isSum', width: 150 },
    { title: '宽度', dataIndex: 'width', width: 150 },
    { title: '弹出界面', dataIndex: 'activeName', width: 150 },
    { title: '下拉类型', dataIndex: 'dropType', width: 150 },
    { title: '中文下拉', dataIndex: 'chineseDrop', width: 150 },
    { title: '繁体下拉', dataIndex: 'traditionalDrop', width: 150 },
    { title: '英文下拉', dataIndex: 'englishDrop', width: 150 },
    { title: '下拉条件', dataIndex: 'sqlCondition', width: 150 },
    { title: '是否下拉选择空数据', dataIndex: 'isDropEmpty', width: 150 },
    { title: '下拉宽度', dataIndex: 'dropWidth', width: 150 },
    { title: '赋值字段', dataIndex: 'assignField', width: 150 },
    { title: '是否只读', dataIndex: 'isReadOnly', width: 150 },
    { title: '初始状态', dataIndex: 'tagType', width: 150 },
    { title: '默认值', dataIndex: 'defaultValue', width: 150 },
    { title: '是否搜索', dataIndex: 'isSearch', width: 150 },
    { title: '最大值', dataIndex: 'maxValue', width: 150 },
    { title: '最小值', dataIndex: 'minValue', width: 150 },
    { title: '日期格式', dataIndex: 'dateFormat', width: 150 },
    { title: '是否合并展示', dataIndex: 'isMerge', width: 150 },
    { title: '是否数字不能为0', dataIndex: 'isNotZero', width: 150 },
    { title: '是否当前数据过滤', dataIndex: 'isFilter', width: 150 },
  ];
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.property.columns = columns;
  const slaveTable = useMemo(()=>{
    return (<TableComponent {...tableParam} />)}, [slaveData, enabled]);
  return (slaveTable);
}
export default SlaveContainer;