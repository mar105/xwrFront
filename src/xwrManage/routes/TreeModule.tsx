import {InputComponent} from "../../components/InputComponent";
import {TreeComponent} from "../../components/TreeComponent";
import React, {useEffect, useMemo} from "react";
import {Modal} from "antd";
import {TableComponent} from "../../components/TableComponent";
import * as commonUtils from "../../utils/commonUtils";
import * as application from "../application";
import * as request from "../../utils/request";

const TreeModule = (props) => {
  useEffect(() => {
    const { dispatchModifyState } = props;
    const treeSearchContainer: any = {};
    const treeSearchConfig: any = [];
    columns.forEach(item => {
      const config = {...item, viewName: item.title, fieldName: item.dataIndex };
      treeSearchConfig.push(config);
    });
    treeSearchContainer.slaveData = treeSearchConfig;
    dispatchModifyState({treeSearchColumns: columns, treeSearchContainer});
  }, []);

  const onExpand= (expandedKeys) => {
    const { dispatchModifyState } = props;
    dispatchModifyState({treeExpandedKeys: expandedKeys });
  }

  const onChange= (e) => {
    const { dispatchModifyState } = props;
    const { value } = e.target;
    dispatchModifyState({ treeSearchValue: value });
  }

  const onModalCancel= (e) => {
    const { dispatchModifyState } = props;
    dispatchModifyState({ treeSearchIsVisible: false });
  }

  const onSearch= async (e) => {
    const { commonModel, dispatch, dispatchModifyState, treeSearchValue } = props;
    if (commonUtils.isNotEmpty(treeSearchValue)) {
      const url: string = `${application.urlPrefix}/route/getSearchRoute?searchValue=` + treeSearchValue;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ treeSearchData: interfaceReturn.data.data.list, treeSearchIsVisible: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }
  }

  const onRowDoubleClick = (name, record) => {
    const { dispatchModifyState, treeExpandedKeys: treeExpandedKeysOld } = props;
    const expandedKeys = commonUtils.isEmptyArr(treeExpandedKeysOld) ? [...record.allId.split(',')] : [...record.allId.split(','), ...treeExpandedKeysOld];
    dispatchModifyState({ treeSelectedKeys: [record.id], treeExpandedKeys: expandedKeys, masterData: {...record}, treeSearchIsVisible: false });
  }


  const { treeSelectedKeys, treeData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchSelectedRowKeys, enabled, treeSearchValue } = props;
  const searchValue = {
    name: 'master',
    config: { fieldName: 'searchValue' },
    search: true,
    property: { placeholder: '请输入查找内容' },
    event: { onChange, onSearch }
  };
  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, expandedKeys: treeExpandedKeys, height: 500 },
    event: { onSelect: props.onSelect, onExpand },
  };
  const columns = [
    { title: '名称', dataIndex: 'viewName', width: 150 },
    { title: '路由名称', dataIndex: 'routeName' },
  ];
  const tableParam: any = commonUtils.getTableProps('treeSearch', props);
  tableParam.property.columns = columns;
  tableParam.rowSelection.type = "radio";
  tableParam.eventOnRow.onRowDoubleClick = onRowDoubleClick;
  const inputComponent =  useMemo(()=>{ return (<InputComponent {...searchValue} />
  )}, [treeSearchValue]);
  const treeComponent =  useMemo(()=>{ return (<TreeComponent {...treeParam} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled]);
  const modal =  useMemo(()=>{
    return (
      <Modal width={800} visible={treeSearchIsVisible} maskClosable={false} footer={null} onCancel={onModalCancel}>
        <TableComponent {...tableParam} />
      </Modal>
  )}, [treeSearchData, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  return(
    <div>
      {inputComponent}
      {treeComponent}
      {modal}
    </div>);

}
export default TreeModule;