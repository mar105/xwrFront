import React, {useEffect, useMemo, useReducer} from 'react';
import {Button, Input, Space, Table } from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList, scrollTo } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";
import {NumberComponent} from "./NumberComponent";
import {DatePickerComponent} from "./DatePickerComponent";
import {CheckboxComponent} from "./CheckboxComponent";
import {SelectComponent} from "./SelectComponent";
import {componentType} from "../utils/commonTypes";
import { Resizable } from 'react-resizable';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import "react-resizable/css/styles.css";
import { SearchOutlined, CheckSquareOutlined, BorderOutlined, MenuOutlined } from '@ant-design/icons';
import ReactDragListView from 'react-drag-listview';
import Highlighter from 'react-highlight-words';
import moment from 'moment';
import ProvinceCityArea from "../common/ProvinceCityArea";

const TableSummaryCell: any = Table.Summary.Cell;

// 数据行拖动
const DragHandle = SortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

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
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{ vid: commonUtils.newId(), columns: [], components: {}, sorterInfo: [], searchText: '', filteredInfo: [], searchedColumn: ''});

  let searchInput;
  const onReachEnd = () => {
    if (params.pagination) {
      params.onReachEnd(params.name);
    }
  }
  useEffect(() => {
    const addState: any = { columns: getColumn(params.property.columns) };
    addState.enabled = params.enabled;
    const addComponents: any = { ...VList({ height: 500, vid: modifySelfState.vid, onReachEnd: onReachEnd })};

    // 树形通过配置展开列名找到展开列
    if (params.config.isTree && commonUtils.isNotEmpty(params.config.treeColumnName)) {
      let selectionMinus = params.property.rowSelection === null ? 0 : 2;
      selectionMinus = params.config.isRowNum ? selectionMinus + 1 : selectionMinus;
      const index = addState.columns.findIndex(item => item.dataIndex === params.config.treeColumnName);
      addState.expandable = { expandIconColumnIndex: index + selectionMinus }
    }

    //-----增加行拖拽------------------------------
    const VRow: any = addComponents.body.row;
    const VWapper: any = addComponents.body.wrapper;
    const SortableItem = SortableElement(props => <VRow {...props} />);
    const SortableContainerA = SortableContainer(props => <VWapper {...props} />);

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
      return params.draggableBodyRow(params.name, rowKey, SortableItem, className, style, restProps);
      // const { dataSource: dataSourceOld }: any = params.property;
      // // function findIndex base on Table rowKey props and should always be a right array index
      // const dataSource = commonUtils.isEmptyArr(dataSourceOld) ? [] : dataSourceOld;
      // const index = dataSource.findIndex((x: any) => x[rowKey] === restProps['data-row-key']);
      // return <SortableItem index={index} {...restProps} />;
    };

    if (params.isDragRow) {
      addComponents.body = {
        wrapper: DraggableContainer,
        row: DraggableBodyRow,
      };
    }
    //-----行拖拽结束--------------------------------------


    //-----增加列宽拖拽------------------------------
    // params.config.isTree ? {} :
    const components = {
      header: {
        cell: ResizeableTitle,
      },
      ...addComponents
    }



    if (params.scrollToRow) {
      setTimeout(() => {
        scrollTo({row: params.scrollToRow, vid: modifySelfState.vid });
      });
    }

    //-----列宽拖拽结束------------------------------
    dispatchModifySelfState({components, ...addState });
    //params.lastColumn.changeValue 判断是否需要重新渲染最后一列。
  }, [params.lastColumn.changeValue, params.property.columns, params.enabled, params.scrollToRow, modifySelfState.filteredInfo]); //, modifySelfState.rowSort

  // useEffect(() => {
  //   //试过按钮放在render里可以滚动，外面滚动不了。此功能未成功
  //   if (params.scrollToRow) {
  //     scrollTo({row: params.scrollToRow });
  //   }
  // }, [params.scrollToRow]);
  // 数据行拖动
  const onSortEnd = ({ oldIndex, newIndex }) => {
    params.onSortEnd(params.name, oldIndex, newIndex);
    dispatchModifySelfState({ rowSort: !modifySelfState.rowSort });
  };


  //标题列拖拽
  const DragTitleColumn = {
    onDragEnd(fromIndex, toIndex) {
      // fromIndex 取值包含 选择行列，行号列，列拖拽要减掉
      const { dispatchModifyState } = params;
      let selectionMinus = params.property.rowSelection === null ? 0 : 1;
      selectionMinus = params.config.isRowNum ? selectionMinus + 1 : selectionMinus;
      const columns = [...params.property.columns];
      const item = columns.splice(fromIndex - selectionMinus, 1)[0];
      columns.splice(toIndex - selectionMinus, 0, item);
      dispatchModifyState({[params.name + 'Columns']: columns});
    },
    nodeSelector: "th"
  };


  // 标题列宽度拖动
  const handleResize = index => (e, { size }) => {
    // index 取值包含 行号列，列拖动要减掉
    const  selectionMinus = params.config.isRowNum === null ? 0 : 1;
    const columns: any = [...params.property.columns];
    columns[index - selectionMinus] = {
      ...columns[index - selectionMinus],
      width: size.width,
    };
    const { dispatchModifyState } = params;
    dispatchModifyState({[params.name + 'Columns']: columns});
  };

  //获取表格的rowKey
  const rowKey = commonUtils.isNotEmpty(params.config.tableKey) ? params.config.tableKey : 'id';

  //搜索常量小面板
  /**   对象转数组 (过滤使用)  */
  const objectToArrFilter = (obj) => {
    const arr: any = [];
    if (commonUtils.isNotEmptyObj(obj)) {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        arr.push({ text: value, value: key });
      }
    }
    return arr;
  }
  const getColumnSearchConstProps = (column, config) => ({
    filters: objectToArrFilter(commonUtils.stringToObj(config.viewDrop)),
    filteredValue: commonUtils.isEmpty(modifySelfState.filteredInfo) ? '' : modifySelfState.filteredInfo[column.dataIndex],
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
    dispatchModifySelfState({searchText: selectedKeys[0], searchedColumn: dataIndex});
  };

  const handleReset = clearFilters => {
    clearFilters();
    dispatchModifySelfState({searchText: ''});
  };

  const getColumn = (resizeColumns: any) => {
    const firstColumn: any = { title: '#', render: (text,record,index)=>`${index + 1}`, width: commonUtils.isEmptyArr(params.property.dataSource) ? 40 :
        params.property.dataSource.length < 10 ? 40 :
          params.property.dataSource.length < 100 ? 50:
            params.property.dataSource.length < 1000 ? 60 :
              params.property.dataSource.length < 10000 ? 70 : 80 , fixed: 'left' };
    const columnsOld: any = params.config.isRowNum ? [firstColumn, ...resizeColumns] : [ ...resizeColumns];
    if (params.isLastColumn && params.enabled) {
      columnsOld.push(params.lastColumn);
    }

    let columns: any = [];
    columnsOld.forEach((columnOld, columnIndex) => {
      if (columnOld.title === '#') {
        const column = {...columnOld};
        columns.push(column);
      } else if (columnOld.title === 'o') {
        const column = {...columnOld};
        column.title = params.lastTitle ? params.lastTitle : column.title;
        columns.push(column);
      } else {
        const index = params.config.slaveData.findIndex(item => item.fieldName === columnOld.dataIndex);
        const config = index > -1 ? params.config.slaveData[index] : {};
        const column = config.dropType === 'const' ? {...columnOld, ...getColumnSearchConstProps(columnOld, config)} : {...columnOld, ...getColumnSearchProps(columnOld)};

        column.onHeaderCell = columnHeader => ({
          width: columnHeader.width,
          onResize: handleResize(columnIndex),
        });
        column.shouldCellUpdate = (record, prevRecord) => {
          //这一段与 组件使用useMemo，不知道是否多余，暂时两个都放，我的个人想法是可以把useMemo这个去除。
          return record[column.dataIndex] !== prevRecord[column.dataIndex] || modifySelfState.enabled !== params.enabled;
        }

        column.ellipsis = {showTitle: true};
        // 多列排序
        column.sorter = {
          compare: (a, b) => {
            if (column.fieldType === 'decimal' || column.fieldType === 'int' || column.fieldType === 'smallint' || column.fieldType === 'tinyint') {
              return ((commonUtils.isEmpty(a[column.dataIndex]) ? 0 : a[column.dataIndex]) - (commonUtils.isEmpty(b[column.dataIndex]) ? 0 : b[column.dataIndex]));
            } else if (column.fieldType === 'datetime') {
              return (moment(commonUtils.isEmpty(a[column.dataIndex]) ? '2000-01-01' : a[column.dataIndex]).diff(moment(commonUtils.isEmpty(b[column.dataIndex]) ? '2000-01-01' : b[column.dataIndex])));
            } else {
              return ((commonUtils.isEmpty(a[column.dataIndex]) ? '0' : a[column.dataIndex]).localeCompare((commonUtils.isEmpty(b[column.dataIndex]) ? '1' : b[column.dataIndex])));
            }
          },
          multiple: modifySelfState.sorterInfo ? modifySelfState.sorterInfo.findIndex((item: any) => item.field === column.dataIndex) : -1,
        }

        //金额靠右显示
        if (column.fieldType === 'decimal' && column.dataIndex.indexOf('Money')) {
          column.className = 'column-money';
          column.align = 'align';
        }
        if (params.enabled && !config.isReadOnly && config.tagType !== 'alwaysReadonly') {
          column.render = (text, record, index) => {
            const selectParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {value: text},
              record,
              event: {onChange: params.event.onSelectChange, getSelectList: params.event.getSelectList }
            };
            const inputParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {value: text},
              record,
              event: {onChange: params.event.onInputChange}
            };
            const checkboxParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {checked: text},
              record,
              event: {onChange: params.event.onCheckboxChange}
            };
            const datePickerParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {value: text},
              record,
              event: {onChange: params.event.onDatePickerChange}
            };
            const numberParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {value: text},
              record,
              event: {onChange: params.event.onNumberChange}
            };
            const provinceCityAreaParams = {
              name: params.name,
              componentType: componentType.Soruce,
              config,
              property: {value: text },
              record,
              event: {onChange: params.event.onCascaderChange}
            };
            if (column.dataIndex === 'sortNum' && params.isDragRow) {
              return <div><DragHandle/> {text}</div>;
            } else if (column.fieldType === 'varchar' || column.fieldType === 'text') {
              if (config.fieldName.lastIndexOf('ProvinceCityArea') > -1) {
                return <ProvinceCityArea {...provinceCityAreaParams}  />;
              } else if (config.dropType === 'sql' || config.dropType === 'const') {
                const component = useMemo(() => {
                  return <SelectComponent {...selectParams}  />
                }, [text]);
                return component;
              } else {
                const component = useMemo(() => {
                  return <InputComponent {...inputParams}  />
                }, [text]);
                return component;
              }
            } else if (column.fieldType === 'decimal' || column.fieldType === 'smallint' || column.fieldType === 'int') {
              const component = useMemo(() => {
                return <NumberComponent {...numberParams}  />
              }, [text]);
              return component;
            } else if (column.fieldType === 'tinyint') {
              const component = useMemo(() => {
                return <CheckboxComponent {...checkboxParams}  />
              }, [text]);
              return component;
            } else if (column.fieldType === 'datetime') {
              const component = useMemo(() => {
                return <DatePickerComponent {...datePickerParams}  />
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
            } else if (config.dropType === 'const') {
              const dropObject: any = commonUtils.stringToObj(config.viewDrop);
              return dropObject[text];
            } else if (config.fieldType === 'tinyint') {
              return text ? <CheckSquareOutlined /> : <BorderOutlined />;
            } else {
              return modifySelfState.searchedColumn === columnOld.dataIndex ? (
                <Highlighter
                  highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                  searchWords={[modifySelfState.searchText]}
                  autoEscape
                  textToHighlight={text ? text.toString() : ''}
                />
              ) : text;
            }
          }
        }

        if (column.title.indexOf('|') > -1) {
          //合并列头
          setNewColumn(columns, column);
        } else {
          columns.push(column);
        }
      }
    });
    return columns;
  }

  const setNewColumn = (columns, newColumn) => {
    let column: any = {};
    const splitTitle = newColumn.title.split('|');
    splitTitle.forEach((title, index) => {
      if (index === 0) {
        const iIndex = columns.findIndex(item => item.title === title && commonUtils.isEmpty(item.dataIndex));
        if (iIndex > -1) {
          column = columns[iIndex];
        } else {
          column = {title, children: []};
          columns.push(column);
        }
      } else if (index === splitTitle.length - 1) {
        newColumn.title = title;
        if (commonUtils.isEmptyArr(column.children)) {
          column.children = [newColumn];
        } else {
          column.children.push(newColumn);
        }
      } else {
        const iIndex = column.children.findIndex(item => item.title === title && commonUtils.isEmpty(item.dataIndex));
        if (iIndex > -1) {
          column = column.children[iIndex];
        } else {
          const columnTitle = {title, children: []};
          column.children.push(columnTitle);
          column = column.children[column.children.length - 1];
        }
      }

    });
    return columns;
  }


  const onChange = (pagination, filters, sorter, extra) => {
    // const sorterInfo: any = [...modifySelfState.sorterInfo];
    // const index = sorterInfo.findIndex(item => item.field === sorter.field);
    // if (index > -1) {
    //   if (commonUtils.isEmpty(sorter.column)) {
    //     sorterInfo.splice(index, 1);
    //   } else {
    //     sorterInfo.push(sorter);
    //   }
    // } else {
    //   sorterInfo.push(sorter)
    // }
    const sorterInfo: any = [];
    if (Array.isArray(sorter)) {
      sorter.forEach(item => {
        if (item.column) {
          sorterInfo.push({field: item.field, order: item.order});
        }
      });
    } else if (sorter.column) {
      sorterInfo.push({field: sorter.field, order: sorter.order});
    }
    dispatchModifySelfState({filteredInfo: filters, sorterInfo});

    if (params.onTableChange && !params.config.isTree && !params.enabled) {
      params.onTableChange(params.name, pagination, filters, sorterInfo, extra);
    }
  }

  const summary = () => {
    const div = commonUtils.isEmptyObj(params.sum) ? undefined : (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <TableSummaryCell>Total: {params.sum.total}</TableSummaryCell>
          {modifySelfState.columns.map(item => {
            return <TableSummaryCell>{params.sum[item.dataIndex]}</TableSummaryCell>
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
    return div;
  }

  const tableParams = {
    bordered: true,
    rowKey,
    // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
    scroll: { x: "100%", y: 500 },
  // 使用VList 即可有虚拟列表的效果
  // 此值和scrollY值相同. 必传. (required).  same value for scrolly
    components: modifySelfState.components,
    rowSelection: { checkStrictly: false, type: params.config.isMultiChoise ? 'checkbox' : 'radio', fixed: true, ...params.rowSelection,
      selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
      getCheckboxProps: (record) => ({ disabled: record.disabled }),
      onChange: (selectedRowKeys, selectedRows) => { params.eventSelection.onRowSelectChange(params.name, selectedRowKeys, selectedRows) } },
    pagination: false,
    summary,
    size: 'small',
    ...params.property,
    columns: modifySelfState.columns,
    sticky: true,
    onRow: record => {
      return {
        onClick: () => { params.eventOnRow && params.eventOnRow.onRowClick ? params.eventOnRow.onRowClick(params.name, record, rowKey) : null }, // 点击行
        onDoubleClick: () => { params.eventOnRow && params.eventOnRow.onRowDoubleClick ? params.eventOnRow.onRowDoubleClick(params.name, record) : null },
        // onContextMenu: event => {},
        // onMouseEnter: event => {}, // 鼠标移入行
        // onMouseLeave: event => {},
      };
    },
    onChange
  }
  if (commonUtils.isNotEmptyObj(modifySelfState.expandable)) {
    tableParams.expandable = modifySelfState.expandable;
  }

  return <div style={{width: params.width ? params.width: 1000}}>
    <ReactDragListView.DragColumn {...DragTitleColumn}>
      <Table
        {...tableParams}
      />
    </ReactDragListView.DragColumn>
  </div>;
}