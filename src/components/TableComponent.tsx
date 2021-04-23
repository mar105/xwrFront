import React from 'react';
import {Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";

export function TableComponent(params) {

  const rowKey = commonUtils.isNotEmptyArr(params.property.dataSource) &&
    commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : 'id';


  const getColumn = (columnsOld: any) => {
    const columns: any = [];
    columns.push({ title: '#', render: (text,record,index)=>`${index + 1}`, width: 30, fixed: 'left' });
    if (params.enabled) {
      columnsOld.forEach(columnOld => {
        const column = {...columnOld};
        column.render = (text, record, index) => {
          const property = {
            value: text,
          }
          if (column.fieldType === 'varchar') {
            return (<InputComponent {...property}  />);
          } else {
            return text;
          }
        }
        columns.push(column);
      });
    } else {
      columns.push(...columnsOld);
    }
    return columns;
  }



  return <Table
    rowKey={rowKey}
    rowSelection={{type: "radio", fixed: true, ...params.propertySelection,
      onChange: (selectedRowKeys, selectedRows) => { params.eventSelection.onRowSelectChange(params.name, selectedRowKeys, selectedRows) } }}
    pagination={true}
    size={'small'}
    {...params.property}
    columns={getColumn(params.property.columns)}
    onRow={record => {
      return {
        onClick: () => { params.eventOnRow && params.eventOnRow.onRowClick ? params.eventOnRow.onRowClick(params.name, record) : null }, // 点击行
        onDoubleClick: () => { params.eventOnRow && params.eventOnRow.onRowDoubleClick ? params.eventOnRow.onRowDoubleClick(params.name, record) : null },
        // onContextMenu: event => {},
        // onMouseEnter: event => {}, // 鼠标移入行
        // onMouseLeave: event => {},
      };
    }}
    scroll={{
      y: 1000 // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
    }}
    // 使用VList 即可有虚拟列表的效果
    components={VList({ height: 1000 // 此值和scrollY值相同. 必传. (required).  same value for scrolly
    })}
    style={{width: 1000}}
  />;
}