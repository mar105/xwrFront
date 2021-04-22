import React from 'react';
import {Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';

export function TableComponent(params) {
  let rowKey = 'id';
  if (commonUtils.isNotEmptyArr(params.property.dataSource)) {
    rowKey = commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : rowKey;
  }
  const onRowClick = (name, record) => {
    if (params.eventOnRow) {
      params.eventOnRow.onRowClick(params.name, record);
    }
  }

  return <Table
    rowKey={rowKey}
    rowSelection={{type: "radio", fixed: true, ...params.propertySelection,
      onChange: (selectedRowKeys, selectedRows) => { params.eventSelection.onRowSelectChange(params.name, selectedRowKeys, selectedRows) } }}
    pagination={true}
    size={'small'}
    {...params.property}
    onRow={record => {
      return {
        onClick: () => { onRowClick(params.name, record) }, // 点击行
        onDoubleClick: () => { params.eventOnRow.onRowDoubleClick(params.name, record) },
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