import {InputComponent} from "../../../components/InputComponent";
import {TreeComponent} from "../../../components/TreeComponent";
import React, {useMemo} from "react";
import {Modal} from "antd";
import {TableComponent} from "../../../components/TableComponent";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";

const TreeModule = (props) => {
  const onExpand= (expandedKeys) => {
    const { dispatchModifyState } = props;
    dispatchModifyState({treeExpandedKeys: expandedKeys });
  }

  const onChange= (e) => {
    const { dispatchModifyState } = props;
    const { value } = e.target;
    dispatchModifyState({ treeSearchValue: value });
  }

  const onSearch= async (e) => {
    const { commonModel, dispatch, dispatchModifyState, treeSearchValue } = props;
    if (commonUtils.isNotEmpty(treeSearchValue)) {
      const url: string = `${application.urlPrefix}/module/getSearchRoute?searchValue=` + treeSearchValue;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ treeSearchData: interfaceReturn.data, treeSearchIsVisible: true });
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

  const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
    const { dispatchModifyState } = props;
    if (commonUtils.isNotEmptyArr(selectedRows)) {
      dispatchModifyState({ treeSearchSelectedRowKeys: selectedRowKeys });
    }
  }


  const { form, treeSelectedKeys, treeData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchSelectedKeys, treeSearchSelectedRowKeys, enabled, treeSearchValue } = props;
  const searchValue = {
    form,
    search: true,
    fieldName: 'searchValue',
    property: { placeholder: '请输入查找内容' },
    event: { onChange, onSearch }
  };
  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, expandedKeys: treeExpandedKeys, height: 500 },
    event: { onSelect: props.onSelect, onExpand },
  };
  const columns = [
    { title: '中文名称', dataIndex: 'chineseName', width: 150 },
    { title: '路由名称', dataIndex: 'routeName' },
  ];
  const tableParam ={
    name: 'treeSearch',
    property: { columns, dataSource: treeSearchData, selectedKeys: treeSearchSelectedKeys },
    eventOnRow: { onRowClick: props.onRowClick, onRowDoubleClick },
    propertySelection: { selectedRowKeys: treeSearchSelectedRowKeys },
    eventSelection: { onRowSelectChange }
  }
  const inputComponent =  useMemo(()=>{ return (<InputComponent {...searchValue} />
  )}, [treeSearchValue]);
  const treeComponent =  useMemo(()=>{ return (<TreeComponent {...treeParam} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled]);
  const modal =  useMemo(()=>{ return (
    <Modal width={800} visible={treeSearchIsVisible} footer={null}>
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