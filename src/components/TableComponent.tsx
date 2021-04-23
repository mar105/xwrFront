import React from 'react';
import {Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";
import {NumberComponent} from "./NumberComponent";
import {DatePickerComponent} from "./DatePickerComponent";
import {CheckboxComponent} from "./CheckboxComponent";
import {SelectComponent} from "./SelectComponent";

export function TableComponent(params) {

  const rowKey = commonUtils.isNotEmptyArr(params.property.dataSource) &&
    commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : 'id';

  const getColumn = (columnsOld: any) => {
    const columns: any = [];
    columns.push({ title: '#', render: (text,record,index)=>`${index + 1}`, width: commonUtils.isEmptyArr(params.property.dataSource) ? 30 :
        params.property.dataSource.length < 10 ? 30 :
          params.property.dataSource.length < 100 ? 40:
            params.property.dataSource.length < 1000 ? 50 :
              params.property.dataSource.length < 10000 ? 60 : 70 , fixed: 'left' });
    if (params.enabled) {
      columnsOld.forEach(columnOld => {
        const column = {...columnOld};
        column.render = (text, record, index) => {
          const property = {
            value: text,
          }
          if (column.fieldType === 'varchar') {
            if (column.dropType === 'sql' || column.dropType === 'const') {
              return (<SelectComponent {...property}  />);
            } else {
              return (<InputComponent {...property}  />);
            }
          } else if (column.fieldType === 'decimal'  || column.fieldType === 'smallint' || column.fieldType === 'int') {
            return (<NumberComponent {...property}  />);
          } else if (column.fieldType === 'tinyint') {
            return (<CheckboxComponent {...property}  />);
          } else if (column.fieldType === 'datetime') {
            return (<DatePickerComponent {...property}  />);
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
    pagination={false}
    size={'small'}
    {...params.property}
    columns={getColumn(params.property.columns)}
    onRow={record => {
      return {
        onClick: () => { params.eventOnRow && params.eventOnRow.onRowClick ? params.eventOnRow.onRowClick(params.name, record, rowKey) : null }, // 点击行
        onDoubleClick: () => { params.eventOnRow && params.eventOnRow.onRowDoubleClick ? params.eventOnRow.onRowDoubleClick(params.name, record) : null },
        // onContextMenu: event => {},
        // onMouseEnter: event => {}, // 鼠标移入行
        // onMouseLeave: event => {},
      };
    }}
    scroll={{
      y: 500 // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
    }}
    // 使用VList 即可有虚拟列表的效果
    components={VList({ height: 500 // 此值和scrollY值相同. 必传. (required).  same value for scrolly
    })}
    style={{width: 1000}}
  />;
}