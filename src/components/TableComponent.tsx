import React, {useEffect, useReducer} from 'react';
import {Button, Input, Space, Table } from 'antd';
import * as commonUtils from "../utils/commonUtils";
import { VList } from 'virtuallist-antd';
import {InputComponent} from "./InputComponent";
import {NumberComponent} from "./NumberComponent";
import {DatePickerComponent} from "./DatePickerComponent";
import {CheckboxComponent} from "./CheckboxComponent";
import {SelectComponent} from "./SelectComponent";
import {componentType} from "../utils/commonTypes";
import { Resizable } from 'react-resizable';
import { SortableContainerProps, SortEnd } from 'react-sortable-hoc';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import "react-resizable/css/styles.css";
import { SearchOutlined, CheckSquareOutlined, BorderOutlined, MenuOutlined } from '@ant-design/icons';
import ReactDragListView from 'react-drag-listview';
import Highlighter from 'react-highlight-words';
import moment from 'moment';
import ProvinceCityArea from "../common/ProvinceCityArea";
import {TreeSelectComponent} from "./TreeSelectComponent";

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
  },{ columns: [], components: {}, sorterInfo: [], searchText: '', filteredInfo: [], searchedColumn: ''});

  let searchInput;
  const onReachEnd = () => {
    if (params.pagination) {
      params.onReachEnd(params.name);
    }
  }

  useEffect(() => {
    const addState: any = {};
    addState.enabled = params.enabled;
    const addComponents: any = { ...VList({ height: 500, vid: params.vid, onReachEnd: onReachEnd })};

    //-----增加行拖拽------------------------------
    const VRow: any = addComponents.body.row;
    const VWapper: any = addComponents.body.wrapper;
    const SortableItem = SortableElement((props: React.HTMLAttributes<HTMLTableRowElement>) => (
      <VRow {...props} />
    ));
    const SortableBody = SortableContainer((props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <VWapper {...props} />
    ));

    const DraggableContainer = (props: SortableContainerProps) => (
      <SortableBody
        useDragHandle
        disableAutoscroll
        helperClass="row-dragging"
        onSortEnd={onSortEnd}
        {...props}
      />
    );

    const DraggableBodyRow = ({ className, style, ...restProps }) => {
      return params.draggableBodyRow(params.name, rowKey, SortableItem, className, style, restProps);
    };

    //有行isDragRow 行拖拽功能时表格中组件显示正常，不然是缩小版，样式要调整。
    if (params.isDragRow) {
      addComponents.body = {
        wrapper: DraggableContainer,
        row: DraggableBodyRow,
      };
    }
    //-----行拖拽结束--------------------------------------


    //-----增加列宽拖拽------------------------------
    // params.config.isTree ? {} :
    const components = commonUtils.isNotEmptyObj(params.tableNestParam) ? {} : {
      header: {
        cell: ResizeableTitle,
      },
      ...addComponents
    }

    //-----列宽拖拽结束------------------------------
    dispatchModifySelfState({components, ...addState });
    //params.lastColumn.changeValue 判断是否需要重新渲染最后一列。
    //filteredInfo 用于包含搜索的变黄色
    //sortEnd 拖动行时数据要重新刷新，不然需要都是老序号，数据拖动位置不准
  }, [params.sortEnd]); //, modifySelfState.rowSort

  useEffect(() => {
    const addState: any = { columns: getColumn(params.property.columns) };
    // 树形通过配置展开列名找到展开列
    if (params.config.isTree && commonUtils.isNotEmpty(params.config.treeColumnName)) {
      let selectionMinus = params.property.rowSelection === null ? 0 : 2;  // 为2的原因 index从0开始，要多加1
      // selectionMinus = params.config.isRowNum ? selectionMinus + 1 : selectionMinus; // addState.columns已经包含了rowNum
      const index = addState.columns.findIndex(item => item.dataIndex === params.config.treeColumnName);
      addState.expandable = { expandIconColumnIndex: index + selectionMinus }
    }
    //-----列宽拖拽结束------------------------------
    dispatchModifySelfState({ ...addState });
  }, [params.lastColumn.changeValue, params.enabled, params.property.columns]);

  // 数据行拖动
  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    params.onSortEnd(params.name, oldIndex, newIndex);
    // dispatchModifySelfState({ rowSort: !modifySelfState.rowSort });
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
    const selectionMinus = params.config.isRowNum ? 1 : 0;
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
    //filteredValue不要用，直接用onFilter，不然不能多个字段筛选。
    // filteredValue: commonUtils.isEmpty(modifySelfState.filteredInfo) ? '' : modifySelfState.filteredInfo[column.dataIndex],
    // filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      return record[column.dataIndex].includes(value);
    }
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
    onFilter: (value, record) => record[column.dataIndex] ? record[column.dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : '',
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
    const firstColumn: any = { title: '#', render: (text,record,index)=> (index + 1), width: commonUtils.isEmptyArr(params.property.dataSource) ? 40 :
        params.property.dataSource.length < 10 ? 40 :
          params.property.dataSource.length < 100 ? 50:
            params.property.dataSource.length < 1000 ? 60 :
              params.property.dataSource.length < 10000 ? 70 : 80 , fixed: 'left' };
    const columnsOld: any = params.config.isRowNum ? [firstColumn, ...resizeColumns] : [ ...resizeColumns];
    if (params.isLastColumn) {
      columnsOld.push(params.lastColumn);
    }

    let columns: any = [];
    columnsOld.forEach((columnOld, columnIndex) => {
      if (columnOld.title === '#') {
        const column = {...columnOld};
        if (params.onFilter) {
          column.onFilter = params.onFilter.bind(this, params.name, column.dataIndex);
          column.filteredValue = ['#'];
        }
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

        //isRender 列单独不同展示，外放
        if (!column.isRender) {
          if (params.enabled && !config.isReadOnly && config.tagType !== 'alwaysReadonly') {
            column.render = (text, record, index) => {
              const selectParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text},
                record,
                event: {onChange: params.event.onDataChange, getSelectList: params.event.getSelectList, onDropPopup: params.event.onDropPopup }
              };
              const treeSelectParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text, dropdownMatchSelectWidth: config.dropdownMatchSelectWidth},
                record,
                event: {onChange: params.event.onDataChange, getSelectList: params.event.getSelectList, onDropPopup: params.event.onDropPopup }
              };
              const inputParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text},
                record,
                event: {onChange: params.event.onDataChange}
              };
              const checkboxParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {checked: text},
                record,
                event: {onChange: params.event.onDataChange}
              };
              const datePickerParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text},
                record,
                event: {onChange: params.event.onDataChange}
              };
              const numberParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text},
                record,
                event: {onChange: params.event.onDataChange}
              };
              const provinceCityAreaParams = {
                name: params.name,
                componentType: componentType.Soruce,
                config,
                property: {value: text },
                record,
                event: {onChange: params.event.onDataChange}
              };
              if (column.dataIndex === 'sortNum' && params.isDragRow) {
                const component = <div><DragHandle/> <NumberComponent {...numberParams} /></div>;
                return component;
              } else if (column.fieldType === 'varchar' || column.fieldType === 'text') {
                if (config.fieldName.lastIndexOf('ProvinceCityArea') > -1) {
                  return <ProvinceCityArea {...provinceCityAreaParams} />;
                } else if (config.dropType === 'sql' || config.dropType === 'current' || config.dropType === 'const' || config.dropType === 'popup') {
                  let component;
                  if (config.isTreeDrop) {
                    component = <TreeSelectComponent {...treeSelectParams} />;
                  } else {
                    component = <SelectComponent {...selectParams} />;
                  }
                  return component;
                } else {
                  const component = <InputComponent {...inputParams} />;
                  return component;
                }
              } else if (column.fieldType === 'decimal' || column.fieldType === 'smallint' || column.fieldType === 'int') {
                const component = <NumberComponent {...numberParams} />;
                return component;
              } else if (column.fieldType === 'tinyint') {
                const component = <CheckboxComponent {...checkboxParams} />;
                return component;
              } else if (column.fieldType === 'datetime') {
                const component = <DatePickerComponent {...datePickerParams} />;
                return component;
              } else {
                return text;
              }
            }
          } else {
            column.render = (text, record, index) => {
              if (config.dropType === 'const') {
                const dropObject: any = commonUtils.stringToObj(config.viewDrop);
                return dropObject[text];
              }
              else if (config.fieldType === 'tinyint') {
                return text ? <CheckSquareOutlined /> : <BorderOutlined />;
              }
              else if (commonUtils.isNotEmpty(config.popupSelectId) && commonUtils.isNotEmpty(text)) {
                return <div style={{ color:'blue', width: '100%' }} onClick={params.onCellClick.bind(this, params.name, config, record)}>{text}</div>
              }
              else {
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
        const columnIndex = columns.findIndex(item => item.title === title && commonUtils.isEmpty(item.dataIndex));
        if (columnIndex > -1) {
          column = columns[columnIndex];
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
        const columnIndex = column.children.findIndex(item => item.title === title && commonUtils.isEmpty(item.dataIndex));
        if (columnIndex > -1) {
          column = column.children[columnIndex];
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

    if (params.onTableChange && commonUtils.isEmpty(params.config.superiorContainerId) && !params.config.isTree && !params.enabled) {
      params.onTableChange(params.name, pagination, filters, sorterInfo, extra);
    }
  }

  const summary = () => {
    const div = commonUtils.isEmptyObj(params.sum) ? undefined : (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <TableSummaryCell index={0}>Total: {params.sum.total}</TableSummaryCell>
          {modifySelfState.columns.map((item, index) => {
            return <TableSummaryCell index={index + 1}>{params.sum[item.dataIndex]}</TableSummaryCell>
          })}
        </Table.Summary.Row>
      </Table.Summary>
    );
    return div;
  }

  const tableParams = {
    width:'100%',
    bordered: true,
    rowKey,
    // 滚动的高度, 可以是受控属性。 (number | string) be controlled.
    scroll: { x: "100%", y: 500 },
    // 使用VList 即可有虚拟列表的效果
    // 此值和scrollY值相同. 必传. (required).  same value for scrolly
    components: modifySelfState.components,
    // checkStrictly 为false 勾选主数据从数据连动勾选。去除，要用到连动的各自界面上加入
    rowSelection: { type: params.config.isMultiChoise ? 'checkbox' : 'radio', fixed: true, ...params.rowSelection,
      selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE, ...params.selections],
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
    tableParams.expandable = { ...modifySelfState.expandable, ...params.expandable,
      onExpand: (expanded, record) => { params.expandable.onExpand(params.name, expanded, record) } };
  }
  if (commonUtils.isNotEmptyObj(params.tableNestParam)) {
    tableParams.expandable = { ...tableParams.expandable,
      expandedRowRender: (record) => {
        params.tableNestParam.onFilter = (name, fieldName, value, recordNest) => {
          return recordNest[params.tableNestParam.config.treeSlaveKey] === record[params.tableNestParam.config.treeKey];
        };
        return <TableComponent {...params.tableNestParam} />;
    }
    };
  }

  return <div style={{width: params.width ? params.width: 1000}}  className='xwr-table'>
    <ReactDragListView.DragColumn {...DragTitleColumn}>
      <Table {...tableParams} />
    </ReactDragListView.DragColumn>
  </div>;
}