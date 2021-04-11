// import React, { useState, useEffect, useRef } from 'react';
// import { VariableSizeGrid as Grid } from 'react-window';
// import ResizeObserver from 'rc-resize-observer';
// import classNames from 'classnames';
// import { Table } from 'antd';
// import * as commonUtils from "../utils/commonUtils";
//
// function VirtualTable(params) {
//   const { scroll } = params;
//   const { columns } = params.property;
//   const [tableWidth, setTableWidth] = useState(0);
//
//   const widthColumnCount = columns!.filter(({ width }) => !width).length;
//   const mergedColumns = columns!.map(column => {
//     if (column.width) {
//       return column;
//     }
//
//     return {
//       ...column,
//       width: Math.floor(tableWidth / widthColumnCount),
//     };
//   });
//
//   const gridRef = useRef<any>();
//   const [connectObject] = useState<any>(() => {
//     const obj = {};
//     Object.defineProperty(obj, 'scrollLeft', {
//       get: () => null,
//       set: (scrollLeft: number) => {
//         if (gridRef.current) {
//           gridRef.current.scrollTo({ scrollLeft });
//         }
//       },
//     });
//
//     return obj;
//   });
//
//   const resetVirtualGrid = () => {
//     gridRef.current.resetAfterIndices({
//       columnIndex: 0,
//       shouldForceUpdate: false,
//     });
//   };
//
//   useEffect(() => resetVirtualGrid, [tableWidth]);
//
//   const renderVirtualList = (rawData: object[], { scrollbarSize, ref, onScroll }: any) => {
//     ref.current = connectObject;
//     const totalHeight = rawData.length * 54;
//
//     return (
//       <Grid
//         ref={gridRef}
//         className="virtual-grid"
//         columnCount={mergedColumns.length}
//         columnWidth={(index: number) => {
//           const { width } = mergedColumns[index];
//           return totalHeight > scroll!.y! && index === mergedColumns.length - 1
//             ? (width as number) - scrollbarSize - 1
//             : (width as number);
//         }}
//         height={scroll!.y as number}
//         rowCount={rawData.length}
//         rowHeight={() => 54}
//         width={tableWidth}
//         onScroll={({ scrollLeft }: { scrollLeft: number }) => {
//           onScroll({ scrollLeft });
//         }}
//       >
//         {({
//             columnIndex,
//             rowIndex,
//             style,
//           }: {
//           columnIndex: number;
//           rowIndex: number;
//           style: React.CSSProperties;
//         }) => (
//           <div
//             className={classNames('virtual-table-cell', {
//               'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
//             })}
//             style={style}
//           >
//             {(rawData[rowIndex] as any)[(mergedColumns as any)[columnIndex].dataIndex]}
//           </div>
//         )}
//       </Grid>
//     );
//   };
//
//   const onRowClick = (name, record) => {
//     console.log('onRowClick');
//     if (params.eventOnRow) {
//       params.eventOnRow.onRowClick(params.name, record);
//     }
//   }
//
//   let rowKey = 'id';
//   if (commonUtils.isNotEmptyArr(params.property.dataSource)) {
//     rowKey = commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : rowKey;
//   }
//   return (
//     <ResizeObserver
//       onResize={({ width }) => {
//         setTableWidth(width);
//       }}
//     >
//       <Table
//         {...params.property}
//         scroll={scroll}
//         className="virtual-table"
//         columns={mergedColumns}
//         components={{
//           body: renderVirtualList,
//         }}
//         rowKey={rowKey}
//           rowSelection={{type: "radio", fixed: true, ...params.propertySelection,
//             onChange: (selectedRowKeys, selectedRows) => { params.eventSelection.onRowSelectChange(params.name, selectedRowKeys, selectedRows) } }}
//         pagination={true}
//         onRow={record => {
//           return {
//             onClick: () => { onRowClick(params.name, record) }, // 点击行
//             onDoubleClick: () => { params.eventOnRow.onRowDoubleClick(params.name, record) },
//             // onContextMenu: event => {},
//             // onMouseEnter: event => {}, // 鼠标移入行
//             // onMouseLeave: event => {},
//           };
//         }}
//       />
//     </ResizeObserver>
//   );
// }
// export function TableComponent(params) {
//   return <VirtualTable {...params} scroll={{ y: 300, x: '100vw' }} />
// }
import React from 'react';
import {Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";

export function TableComponent(params) {
  console.log('222222', params);
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
  />;
}