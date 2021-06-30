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

  const onDrop = async (info) => {
    const { dispatchModifyState, treeData: treeDataOld, commonModel, tabId, dispatch, form } = props;

    // antd官网代码 修改
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    let dragParent; //拖拽到的地方父级节点

    const loop = (data, key, parent, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          dragParent = parent;
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          loop(data[i].children, key, data[i], callback);
        }
      }
    };
    const data = [...treeDataOld];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, null,(item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, null,item => {
        if (item.routeName.split('/').length > 2) {
          props.gotoError(dispatch, { code: '6004', msg: '不能移动到此节点' });
          return;
        }
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
        dragParent = item;
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, null,item => {
        if (item.routeName.split('/').length > 2) {
          props.gotoError(dispatch, { code: '6004', msg: '不能移动到此节点' });
          return;
        }
        item.children = item.children || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.children.unshift(dragObj);
        // in previous version, we use item.children.push(dragObj) to insert the
        // item to the tail of the children

        dragParent = item;
      });
    } else {
      let ar;
      let i;
      loop(data, dropKey, null,(item, index, arr) => {
        if (dragParent !== null && dragParent.routeName.split('/').length > 2) {
          props.gotoError(dispatch, { code: '6004', msg: '不能移动到此节点' });
          return;
        }
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    //// 拖动完成后，修改superiorId, allId;
    const saveChangeData: any = [];
    let parentAllId;
    if (dragParent === null) {
      data.forEach((item, index) => {
        item.handleType = 'modify';
        item.superiorId = '';
        item.sortNum = index + 1;
        if (dragKey === item.key) {
          item.allId = item.key;
          parentAllId = item.allId;
        }
        saveChangeData.push(item);
      });
    } else {
      dragParent.children.forEach((item, index) => {
        item.handleType = 'modify';
        item.superiorId = dragParent.id;
        item.sortNum = index + 1;
        if (dragKey === item.key) {
          item.allId = dragParent.allId + ',' + item.key;
          parentAllId = item.allId;
        }
        saveChangeData.push(item);
      });
    }

    const loopDragNode = (child, parentId, parentAllId) => {
      child.forEach((item) => {
        item.handleType = 'modify';
        item.superiorId = parentId;
        item.allId = parentAllId + ',' + item.key;
        saveChangeData.push(item);
        if (commonUtils.isNotEmptyArr(item.children)) {
          loopDragNode(item.children, item.id, item.allId);
        }
      });
    };

    if (commonUtils.isNotEmptyArr(info.dragNode.children)) {
      info.dragNode.children.forEach((item) => {
        item.handleType = 'modify';
        item.superiorId = info.dragNode.id;
        item.allId = parentAllId + ',' + item.key;
        saveChangeData.push(item);
        if (commonUtils.isNotEmptyArr(item.children)) {
          loopDragNode(item.children, item.id, item.allId);
        }
      });
    }

    if (commonUtils.isNotEmptyArr(saveChangeData)) {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', saveChangeData, [], true));
      const params = { id: info.dragNode.id, tabId, saveData, isSync: true };
      const url: string = `${application.urlPrefix}/route/saveRoute`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await props.getAllRoute({isWait: true});
        const addState: any = {};
        addState.masterData = {...props.getTreeNode(returnRoute.treeData, parentAllId + ',' + info.dragNode.id) };
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
        dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [info.dragNode.id], ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }
    // dispatchModifyState({treeData: data});
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
    property: { treeData, selectedKeys: treeSelectedKeys, expandedKeys: treeExpandedKeys, height: 500, draggable: !enabled, blockNode: true },
    event: { onSelect: props.onSelect, onExpand, onDrop: onDrop },
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