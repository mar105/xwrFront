import React, {useEffect, useMemo, useState} from 'react';
import {Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";
import {NumberComponent} from "./NumberComponent";
import {DatePickerComponent} from "./DatePickerComponent";
import {CheckboxComponent} from "./CheckboxComponent";
import {SelectComponent} from "./SelectComponent";
import {componentType} from "../utils/commonTypes";
import { Resizable } from 'react-resizable';
import "react-resizable/css/styles.css";


const ResizeableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if ( !width ) {
    return <th {...restProps} />
  }
  return (
    <Resizable width={width} height={0} onResize={onResize}>
      <th {...restProps} />
    </ Resizable >
  )
}

export function TableComponent(params: any) {

  const [resizeColumn, setResizeColumn] = useState([]);
  useEffect(() => {
    setResizeColumn(getColumn(params.property.columns));
  }, [params.property.columns]);
  const components = {
    ...VList({ height: 500 }),
    header: {
      cell: ResizeableTitle,
    },
  };

  const handleResize = index => (e, { size }) => {
    const nextColumns: any = [...resizeColumn];
    nextColumns[index] = {
      ...nextColumns[index],
      width: size.width,
    };
    setResizeColumn((resizeColumn: any) => {
      const nextColumns: any = [...resizeColumn];
      nextColumns[index] = {
        ...nextColumns[index],
        width: size.width,
      };
      return nextColumns;
    });
  };

  const rowKey = commonUtils.isNotEmptyArr(params.property.dataSource) &&
    commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : 'id';

  const getColumn = (resizeColumns: any) => {
    const firstColumn: any = { title: '#', render: (text,record,index)=>`${index + 1}`, width: commonUtils.isEmptyArr(params.property.dataSource) ? 30 :
        params.property.dataSource.length < 10 ? 30 :
          params.property.dataSource.length < 100 ? 40:
            params.property.dataSource.length < 1000 ? 50 :
              params.property.dataSource.length < 10000 ? 60 : 70 , fixed: 'left' };
    const columnsOld: any = [firstColumn, ...resizeColumns];
    const columns: any = [];
    if (params.enabled) {
      columnsOld.forEach((columnOld, columnIndex) => {
        const column = {...columnOld};
        column.onHeaderCell = columnHeader => ({
          width: columnHeader.width, // 100 没有设置宽度可以在此写死 例如100试下
          onResize: handleResize(columnIndex),
        }),
        column.render = (text, record, index) => {
          const inputParams = {
            name: params.name,
            componentType: componentType.Soruce,
            fieldName: column.dataIndex,
            dropType: column.dropType,
            dropOptions: column.dropOptions,
            property: {value: text},
            event: { onChange: params.event.onInputChange }
          };
          if (column.fieldType === 'varchar') {
            if (column.dropType === 'sql' || column.dropType === 'const') {
              const component = useMemo(()=>{ return (<SelectComponent {...inputParams}  />
              )}, [text]);
              return component;
            } else {
              const component = useMemo(()=>{ return (<InputComponent {...inputParams}  />
              )}, [text]);
              return component;
            }
          } else if (column.fieldType === 'decimal'  || column.fieldType === 'smallint' || column.fieldType === 'int') {
            const component = useMemo(()=>{ return (<NumberComponent {...params}  />
            )}, [text]);
            return component;
          } else if (column.fieldType === 'tinyint') {
            const component = useMemo(()=>{ return (<CheckboxComponent {...params}  />
            )}, [text]);
            return component;
          } else if (column.fieldType === 'datetime') {
            const component = useMemo(()=>{ return (<DatePickerComponent {...params}  />
            )}, [text]);
            return component;
          } else {
            return text;
          }
        }
        columns.push(column);
      });
    } else {
      columnsOld.forEach((columnOld, columnIndex) => {
        const column = {...columnOld};
        column.onHeaderCell = columnHeader => ({
          width: columnHeader.width, // 100 没有设置宽度可以在此写死 例如100试下
          onResize: handleResize(columnIndex),
        }),
        column.render = (text, record, index) => {
          if (column.dropType === 'const') {
            const dropObject: any = commonUtils.stringToObj(column.dropOptions);
            return dropObject[text];
          } else {
            return text;
          }
        }
        columns.push(column);
      });
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
    columns={resizeColumn}
    onRow={record => {
      return {
        onClick: () => { params.eventOnRow && params.eventOnRow.onRowClick ? params.eventOnRow.onRowClick(params.name, record, rowKey) : null }, // 点击行
        onDoubleClick: () => { params.eventOnRow && params.eventOnRow.onRowDoubleClick ? params.eventOnRow.onRowDoubleClick(params.name, record) : null },
        // onContextMenu: event => {},
        // onMouseEnter: event => {}, // 鼠标移入行
        // onMouseLeave: event => {},
      };
    }}
    // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
    scroll={{ y: 500 }}
    // 使用VList 即可有虚拟列表的效果
    // 此值和scrollY值相同. 必传. (required).  same value for scrolly
    components={ components }
    style={{width: 1000}}
  />;
}