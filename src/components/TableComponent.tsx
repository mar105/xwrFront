import React, {useEffect, useMemo, useState} from 'react';
import {Button, Input, Space, Table} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";
import {NumberComponent} from "./NumberComponent";
import {DatePickerComponent} from "./DatePickerComponent";
import {CheckboxComponent} from "./CheckboxComponent";
import {SelectComponent} from "./SelectComponent";
import {componentType} from "../utils/commonTypes";
import { Resizable } from 'react-resizable';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import "react-resizable/css/styles.css";
import { MenuOutlined } from '@ant-design/icons';
import arrayMove from 'array-move';
import ReactDragListView from 'react-drag-listview';
import { SearchOutlined, CheckSquareOutlined, BorderOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import {isNotEmptyObj} from "../utils/commonUtils";

// 数据行拖动
const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);
const SortableItem = SortableElement(props => <tr {...props} />);
const SortableContainerA = SortableContainer(props => <tbody {...props} />);

// 标题列宽度拖动
const ResizeableTitle = (props) => {
  const { onResize, width, ...restProps } = props;
  if (!width) {
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
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  let searchInput;
  useEffect(() => {
    setResizeColumn(getColumn(params.property.columns));
  }, [params.property.columns, params]);

  // 数据行拖动
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const { dispatchModifyState } = params;
    const { dataSource } = params.property;
    if (oldIndex !== newIndex) {
      const newData = arrayMove([].concat(dataSource), oldIndex, newIndex).filter(el => !!el);
      newData.forEach((item: any, index) => item.sortNum = index + 1);
      dispatchModifyState({[params.name + 'Data']: newData});
    }
  };

  const DraggableContainer = props => (
    <SortableContainerA
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = ({ className, style, ...restProps }) => {
    const { dataSource: dataSourceOld }: any = params.property;
    // function findIndex base on Table rowKey props and should always be a right array index
    const dataSource = commonUtils.isEmptyArr(dataSourceOld) ? [] : dataSourceOld;
    const index = dataSource.findIndex((x: any) => x[rowKey] === restProps['data-row-key']);
    return <SortableItem index={index} {...restProps} />;
  };

  //标题列拖拽
  const DragTitleColumn = {
    onDragEnd(fromIndex, toIndex) {
      const  selectionMinus = params.property.rowSelection === null ? 0 : 1;
      const columns = [...resizeColumn];
      const item = columns.splice(fromIndex - selectionMinus, 1)[0];
      columns.splice(toIndex - selectionMinus, 0, item);
      setResizeColumn(columns);
    },
    nodeSelector: "th"
  };


  const components = {
    ...VList({ height: 500 }),
    header: {
      cell: ResizeableTitle,
    }
  };
  if (params.isDragRow) {
    components.body = {
      wrapper: DraggableContainer,
      row: DraggableBodyRow,
    };
  }


  // 标题列宽度拖动
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

  //获取表格的rowKey
  const rowKey = commonUtils.isNotEmptyArr(params.property.dataSource) &&
    commonUtils.isNotEmpty(params.property.dataSource[0].slaveId) ? 'slaveId' : 'id';

  //搜索常量小面板
  /**   对象转数组 (过滤使用)  */
  const objectToArrFilter = (obj) => {
    const arr: any = [];
    if (isNotEmptyObj(obj)) {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        arr.push({ text: value, value: key });
      }
    }
    return arr;
  }
  const getColumnSearchConstProps = (column) => ({
    filters: objectToArrFilter(commonUtils.stringToObj(column.dropOptions)),
    // filteredValue: commonUtils.isEmpty(stateRef.current) ? '' : stateRef.current[column.dataIndex],
    // filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => record[column.dataIndex].includes(value),
  });

  //搜索小面板
  const getColumnSearchProps = column => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={column.title}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, column.dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, column.dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[column.dataIndex]
        ? record[column.dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100);
      }
    },
  });

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = clearFilters => {
    clearFilters();
    setSearchText('');
  };

  const getColumn = (resizeColumns: any) => {
    const firstColumn: any = { title: '#', render: (text,record,index)=>`${index + 1}`, width: commonUtils.isEmptyArr(params.property.dataSource) ? 30 :
        params.property.dataSource.length < 10 ? 30 :
          params.property.dataSource.length < 100 ? 40:
            params.property.dataSource.length < 1000 ? 50 :
              params.property.dataSource.length < 10000 ? 60 : 70 , fixed: 'left' };
    const columnsOld: any = [firstColumn, ...resizeColumns];
    const columns: any = [];
    columnsOld.forEach((columnOld, columnIndex) => {
      const column = columnOld.title === '#' ? {...columnOld} : columnOld.dropType === 'const' ?
        {...columnOld, ...getColumnSearchConstProps(columnOld)} : {...columnOld, ...getColumnSearchProps(columnOld)};

      column.onHeaderCell = columnHeader => ({
        width: columnHeader.width,
        onResize: handleResize(columnIndex),
      });
      column.ellipsis = {showTitle: true};
      if (params.enabled) {
        column.render = (text, record, index) => {
          const inputParams = {
            name: params.name,
            componentType: componentType.Soruce,
            fieldName: column.dataIndex,
            dropType: column.dropType,
            dropOptions: column.dropOptions,
            property: {value: text},
            event: {onChange: params.event.onInputChange}
          };
          const checkboxParams = {
            name: params.name,
            componentType: componentType.Soruce,
            fieldName: column.dataIndex,
            property: {checked: text},
            event: {onChange: params.event.onCheckboxChange}
          };
          if (column.dataIndex === 'sortNum' && params.isDragRow) {
            return <div><DragHandle/> {text}</div>;
          } else if (column.fieldType === 'varchar') {
            if (column.dropType === 'sql' || column.dropType === 'const') {
              const component = useMemo(() => {
                return (<SelectComponent {...inputParams}  />
                )
              }, [text]);
              return component;
            } else {
              const component = useMemo(() => {
                return (<InputComponent {...inputParams}  />
                )
              }, [text]);
              return component;
            }
          } else if (column.fieldType === 'decimal' || column.fieldType === 'smallint' || column.fieldType === 'int') {
            const component = useMemo(() => {
              return (<NumberComponent {...params}  />
              )
            }, [text]);
            return component;
          } else if (column.fieldType === 'tinyint') {
            const component = useMemo(() => {
              return (<CheckboxComponent {...checkboxParams}  />
              )
            }, [text]);
            return component;
          } else if (column.fieldType === 'datetime') {
            const component = useMemo(() => {
              return (<DatePickerComponent {...params}  />
              )
            }, [text]);
            return component;
          } else {
            return text;
          }
        }
      } else {
        column.render = (text, record, index) => {
          if (column.dataIndex === 'sortNum' && params.isDragRow) {
            return <div><DragHandle /> {text}</div>;
          } else if (column.dropType === 'const') {
            const dropObject: any = commonUtils.stringToObj(column.dropOptions);
            return dropObject[text];
          } else if (column.fieldType === 'tinyint') {
            return text ? <CheckSquareOutlined /> : <BorderOutlined />;
          } else {
            return searchedColumn === columnOld.dataIndex ? (
              <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
              />
            ) : text;
          }
        }
      }
      columns.push(column);
    });
    return columns;
  }

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', filters);
  }
  return <div>
    <ReactDragListView.DragColumn {...DragTitleColumn}>
      <Table
      rowKey={rowKey}
        // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
      scroll={{ y: 500 }}
        // 使用VList 即可有虚拟列表的效果
        // 此值和scrollY值相同. 必传. (required).  same value for scrolly
      components={ components }
      style={{width: 1000}}
      rowSelection={{type: 'checkbox', fixed: true, ...params.propertySelection,
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
        onChange: (selectedRowKeys, selectedRows) => { params.eventSelection.onRowSelectChange(params.name, selectedRowKeys, selectedRows) } }}
      pagination={false}
      size={'small'}
      {...params.property}
      columns={resizeColumn}
      sticky={true}
      onRow={record => {
        return {
          onClick: () => { params.eventOnRow && params.eventOnRow.onRowClick ? params.eventOnRow.onRowClick(params.name, record, rowKey) : null }, // 点击行
          onDoubleClick: () => { params.eventOnRow && params.eventOnRow.onRowDoubleClick ? params.eventOnRow.onRowDoubleClick(params.name, record) : null },
          // onContextMenu: event => {},
          // onMouseEnter: event => {}, // 鼠标移入行
          // onMouseLeave: event => {},
        };
      }}
      onChange={onChange}
      />
    </ReactDragListView.DragColumn>
  </div>;
}