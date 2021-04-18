import React from 'react';
import * as commonUtils from "../utils/commonUtils";

const commonManage = (WrapComponent) => {
  return function ChildComponent(props) {
    // 增加时，树节点增加空行数据
    // delId不为空时为删除树节点数据。
    let form;
    const setNewTreeNode = (treeData, allId, newTreeNode, delId = '') => {
      let treeNode: any = {};
      if (allId === '' && commonUtils.isEmpty(delId)) {
        treeData.push(newTreeNode);
      } else {
        allId.split(',').forEach((key, iAllIdIndex) => {
          if (iAllIdIndex === 0) {
            const iIndex = treeData.findIndex(item => item.key === key);
            if (iIndex > -1) {
              treeNode = treeData[iIndex];
            }
          } else if (commonUtils.isNotEmptyArr(treeNode.children)) {
            treeNode = getChildTreeNode(treeNode.children, key);
          }
        });
        if (commonUtils.isEmpty(delId)) {
          if (commonUtils.isNotEmptyArr(treeNode.children)) {
            treeNode.children.push(newTreeNode);
          } else {
            treeNode.children = [newTreeNode];
          }
        } else {
          if (commonUtils.isNotEmptyArr(treeNode.children)) {
            const iIndex = treeNode.children.findIndex(item => item.key === delId);
            if (iIndex > -1) {
              treeNode.children.splice(iIndex, 1);
            }
          } else {
            const iIndex = treeData.findIndex(item => item.key === delId);
            if (iIndex > -1) {
              treeData.splice(iIndex, 1);
            }
          }
        }
      }
      return treeData;
    }

    const getChildTreeNode = (treeNode, key) => {
      if (commonUtils.isNotEmptyArr(treeNode)) {
        const iIndex = treeNode.findIndex(item => item.key === key);
        if (iIndex > -1) {
          return treeNode[iIndex];
        }
      }
    }

    const getTreeNode = (treeData, allId) => {
      let treeNode: any = {};
      if (allId === '') {
        treeNode = treeData[0];
      } else {
        allId.split(',').forEach((key, iAllIdIndex) => {
          if (iAllIdIndex === 0) {
            const iIndex = treeData.findIndex(item => item.key === key);
            if (iIndex > -1) {
              treeNode = treeData[iIndex];
            }
          } else if (commonUtils.isNotEmptyArr(treeNode.children)) {
            treeNode = getChildTreeNode(treeNode.children, key);
          }
        });
      }
      return treeNode;
    }

    const onTreeSelect = (selectedKeys: React.Key[], e) => {
      const { dispatchModifyState, dispatch, enabled } = props;
      if (enabled) {
        props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
      } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(e.node));
        dispatchModifyState({treeSelectedKeys: selectedKeys, masterData: { ...e.node }, selectNode: e.node });
      }
    }

    const onSetForm = (formNew) => {
      form = formNew;
    }

    return <WrapComponent
      {...props}
      setNewTreeNode={setNewTreeNode}
      getTreeNode={getTreeNode}
      onTreeSelect={onTreeSelect}
      onSetForm={onSetForm}
    />
  };
};

export default commonManage;






