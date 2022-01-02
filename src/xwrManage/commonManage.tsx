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
        allId.split(',').forEach((key, allIdIndex) => {
          if (allIdIndex === 0) {
            const index = treeData.findIndex(item => item.key === key);
            if (index > -1) {
              treeNode = treeData[index];
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
            const index = treeNode.children.findIndex(item => item.key === delId);
            if (index > -1) {
              treeNode.children.splice(index, 1);
            }
          } else {
            const index = treeData.findIndex(item => item.key === delId);
            if (index > -1) {
              treeData.splice(index, 1);
            }
          }
        }
      }
      return treeData;
    }

    const getChildTreeNode = (treeNode, key) => {
      if (commonUtils.isNotEmptyArr(treeNode)) {
        const index = treeNode.findIndex(item => item.key === key);
        if (index > -1) {
          return treeNode[index];
        }
      }
    }

    const getTreeNode = (treeData, allId) => {
      let treeNode: any = {};
      if (allId === '') {
        treeNode = treeData[0];
      } else {
        allId.split(',').forEach((key, allIdIndex) => {
          if (allIdIndex === 0) {
            const index = treeData.findIndex(item => item.key === key);
            if (index > -1) {
              treeNode = treeData[index];
            }
          } else if (commonUtils.isNotEmptyArr(treeNode.children)) {
            treeNode = getChildTreeNode(treeNode.children, key);
          }
        });
      }
      return treeNode;
    }

    const onTreeSelect = (selectedKeys: React.Key[], e, isWait) => {
      const { dispatchModifyState, dispatch, enabled } = props;
      if (enabled) {
        props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
      } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
        const addState = {treeSelectedKeys: selectedKeys, masterData: { ...e.node } };
        if (isWait) {
          return addState;
        } else {
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(e.node));
          dispatchModifyState(addState);
        }
      }
    }

    const onSetForm = (formNew) => {
      form = formNew;
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'addChildButton', caption: '增加子级', htmlType: 'button', sortNum: 20, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      return buttonGroup;
    }

    return <WrapComponent
      {...props}
      setNewTreeNode={setNewTreeNode}
      getTreeNode={getTreeNode}
      onTreeSelect={onTreeSelect}
      onSetForm={onSetForm}
      getButtonGroup={getButtonGroup}
    />
  };
};

export default commonManage;






