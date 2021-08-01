import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "../../common/ButtonGroup";
import commonDocEvent from "../../common/commonDocEvent";
import {TableComponent} from "../../components/TableComponent";
import * as application from "../../application";
import * as request from "../../utils/request";

const Permission = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.userContainer)) {
      getAllData();

    }
  }, [props.userContainer]);

  const getAllData = async (isWait) => {
    const { dispatchModifyState } = props;
    let addState = {};
    // 权限分类
    addState = { masterData: {id: props.tabId}, ...addState, ... await getFetchData('user') };

    //系统权限
    const permission = await getAllPermission({ isWait: true });
    addState.permissionData = permission.treeData;

    let userId;
    let isCategory;
    if (commonUtils.isNotEmptyArr(props.userSelectedRowKeys)) {
      const indexUser = props.userSrcData.findIndex(item => item.userId === props.userSelectedRowKeys.toString());
      userId = indexUser > -1 ? props.userSrcData[indexUser].userId : '';
      isCategory = indexUser > -1 ? props.userSrcData[indexUser].isCategory : false;
    } else {
      userId = commonUtils.isNotEmptyArr(addState.userData) ? addState.userData[0].userId : '';
      isCategory = commonUtils.isNotEmptyArr(addState.userData) ? addState.userData[0].isCategory : false;
    }

    if (commonUtils.isNotEmpty(userId)) {
      addState = { ...addState, ... await getUserPermission(userId, isCategory, true) };
      setPermissionDisabled(addState.userPermission, addState.permissionData, isCategory, false);
      const permissionSelectedRowKeys = [];
      addState.userPermission.forEach(item => {
        permissionSelectedRowKeys.push(item.permissionId);
      });
      addState.permissionSelectedRowKeys = permissionSelectedRowKeys;
      addState.userSelectedRowKeys = [addState.userData[0].userId];
    }
    if (isWait) {
      return addState;
    } else {
      dispatchModifyState(addState);
    }
  }

  const setPermissionDisabled = (userPermission, tableData, isCategory, enabled) => {
    for(const dataRow of tableData) {
      if (!enabled) {
        dataRow.disabled = true;
      } else if (isCategory) {
        dataRow.disabled = false;
      } else {
        const categoryIndex = userPermission.findIndex(item => item.permissionId === dataRow.id && item.isCategory === 1);
        dataRow.disabled = categoryIndex > -1;
      }
      if (commonUtils.isNotEmptyArr(dataRow.children)) {
        setPermissionDisabled(userPermission, dataRow.children, isCategory);
      }
    }
  }



  const getAllPermission = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = `${application.urlManage}/permission/getAllPermission`;
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      if (isWait) {
        return { treeData: interfaceReturn.data };
      } else {
        dispatchModifyState({ treeData: interfaceReturn.data });
      }
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const getUserPermission = async (userId, isCategory, isWait) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const url: string = isCategory ? `${application.urlPrefix}/userPermission/getUserPermission?routeId=` + props.routeId +
        '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&permissionCategoryId=' + userId :
      `${application.urlPrefix}/userPermission/getUserPermission?routeId=` + props.routeId +
        '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&userId=' + userId;
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      if (isWait) {
        return { userPermission: interfaceReturn.data };
      } else {
        dispatchModifyState({ userPermission: interfaceReturn.data });
      }
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const getFetchData = async (name) => {
    const { [name + 'Container']: container } = props;
    const tableData: any = [];
    let addState = { [name + 'Data']: [] };

    if (container.isTree) {
      const indexTree = container.slaveData.findIndex(item => item.fieldName === (name + 'Tree'));
      const index = container.slaveData.findIndex(item => item.fieldName === name);
      if (indexTree > -1 && commonUtils.isNotEmpty(container.slaveData[indexTree].viewDrop) &&
          index > -1 && commonUtils.isNotEmpty(container.slaveData[index].viewDrop)) {
        const tableTree = (await props.getSelectList({containerSlaveId: container.slaveData[indexTree].id, isWait: true })).list;
        const tableSlave = (await props.getSelectList({containerSlaveId: container.slaveData[index].id, isWait: true })).list;
        const table = [...tableTree, ...tableSlave];
        // 通过treeKey, treeSlaveKey 重新生成数据
        table.filter(item => commonUtils.isEmpty(item[container.treeSlaveKey])).forEach((dataRow, indexTable) => {
          const data = { ...props.onAdd(container), ...commonUtils.getAssignFieldValue(container.slaveData[index].assignField, dataRow)};
          data[container.treeSlaveKey] = dataRow[container.treeSlaveKey];
          data.sortNum = indexTable;
          const children = getSlaveData(name, table, container, dataRow[container.treeKey], container.slaveData[index].assignField);
          if (commonUtils.isNotEmptyArr(children)) {
            data.children = children;
          }
          tableData.push(data);
        });
        addState[name + 'SrcData'] = table;
        addState[name + 'Data'] = tableData;
      }
    }
    return addState;
  }

  const getSlaveData = (name, table, container, masterKeyValue, assignField) => {
    const tableData: any = [];
    table.filter(item => item[container.treeSlaveKey] === masterKeyValue).forEach((dataRow, indexTable) => {
      const data = { ...props.onAdd(container), ...commonUtils.getAssignFieldValue(assignField, dataRow)};
      data[container.treeSlaveKey] = dataRow[container.treeSlaveKey];
      data.sortNum = indexTable;
      const children = getSlaveData(name, table, container, dataRow.id, assignField);
      if (commonUtils.isNotEmptyArr(children)) {
        data.children = children;
      }
      tableData.push(data);
    });
    return tableData;
  }

  const onFinish = async (values: any) => {
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(getFinishData('permission'));
      return saveData;
    }

    await props.onFinish(values, {childCallback, getAllData});
  }

  const getFinishData = (name) => {
    const { [name + 'SelectedRowKeys']: tableSelectedRowKeysOld, [name + 'Data']: tableDataOld, [name + 'DelData']: tableDelData,
      userPermission, userSelectedRowKeys, userSrcData: userData } = props;
    const tableSelectedRowKeys = commonUtils.isEmptyArr(tableSelectedRowKeysOld) ? [] : tableSelectedRowKeysOld;
    const tableData: any = [];
    // 正向找，一次递归， 反向找，多次递归中断。决定正向找。
    const indexUser = userData.findIndex(item => item.userId === userSelectedRowKeys.toString());
    getFinishSlaveData(name, tableDataOld, tableSelectedRowKeys, tableData, userPermission, userData[indexUser]);
    return commonUtils.mergeData(name, tableData.filter(item => commonUtils.isNotEmpty(item.handleType)), tableDelData, true);
  }

  const getFinishSlaveData = (name, tableDataOld, tableSelectedRowKeys, tableData, userPermission, userInfo) => {
    for(const dataRow of tableDataOld) {
      const indexPermission = userPermission.findIndex(item => item.permissionId === dataRow.id);
      if (tableSelectedRowKeys.findIndex(item => item === dataRow.id) > -1) {
        if (!(indexPermission > -1)) {
          tableData.push({ ...props.onAdd(), sortNum: 0, permissionId: dataRow.id, permissionCategoryId: userInfo.isCategory ? userInfo.userId : '',
            userId: userInfo.isCategory ? '' : userInfo.userId, handleType: 'add' });
        }
      } else if (indexPermission > -1) {
        tableData.push({ id: userPermission[indexPermission].id, permissionId: dataRow.id, permissionCategoryId: userInfo.isCategory ? userInfo.userId : '',
          userId: userInfo.isCategory ? '' : userInfo.userId, handleType: 'del' });
      }
      if (commonUtils.isNotEmptyArr(dataRow.children)) {
        getFinishSlaveData(name, dataRow.children, tableSelectedRowKeys, tableData, userPermission, userInfo);
      }
    }
  }

  const onButtonClick = async (key, config, e, childParamsOld: any = undefined) => {
    let childParams: any = {};
    if (key === 'modifyButton') {
      const indexUser = props.userSrcData.findIndex(item => item.userId === props.userSelectedRowKeys.toString());
      const isCategory = indexUser > -1 ? props.userSrcData[indexUser].isCategory : false;
      setPermissionDisabled(props.userPermission, props.permissionData, isCategory, true);
      childParams.permissionData = props.permissionData;
      props.onButtonClick(key, config, e, childParams);
    } else if (key === 'cancelButton') {
      const indexUser = props.userSrcData.findIndex(item => item.userId === props.userSelectedRowKeys.toString());
      const isCategory = indexUser > -1 ? props.userSrcData[indexUser].isCategory : false;
      setPermissionDisabled(props.userPermission, props.permissionData, isCategory, false);
      childParams.permissionData = props.permissionData;
      props.onButtonClick(key, config, e, childParams);
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onRowClick = async (name, record, rowKey) => {
    const { dispatchModifyState } = props;
    const addState = await getUserPermission(record[rowKey], record.isCategory, true);
    setPermissionDisabled(addState.userPermission, props.permissionData, record.isCategory, props.enabled);
    addState.permissionData = props.permissionData;
    const permissionSelectedRowKeys = [];
    addState.userPermission.forEach(item => {
      permissionSelectedRowKeys.push(item.permissionId);
    });
    addState.permissionSelectedRowKeys = permissionSelectedRowKeys;
    dispatchModifyState({ [name + 'SelectedRowKeys']: [record[rowKey]], ...addState });
  }

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 20, disabled: props.enabled });
    buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 30, disabled: !props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 40, disabled: !props.enabled });
    return buttonGroup;
  }


  const { enabled, masterContainer } = props;
  const buttonGroup = { onClick: onButtonClick, enabled, container: masterContainer, buttonGroup: getButtonGroup() };

  const userParam: any = commonUtils.getTableProps('user', props);
  userParam.pagination = false;
  userParam.isLastColumn = false;
  userParam.enabled = false;
  userParam.property.rowSelection = null;
  userParam.eventOnRow.onRowClick = onRowClick;

  const permissionParam: any = commonUtils.getTableProps('permission', props);
  permissionParam.pagination = false;
  permissionParam.isLastColumn = false;
  permissionParam.enabled = false;

  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col span={8}>
          {commonUtils.isNotEmptyObj(props.userContainer) ? <TableComponent {...userParam} /> : '' }
        </Col>
        <Col span={8}>
          {commonUtils.isNotEmptyObj(props.permissionContainer) ? <TableComponent {...permissionParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Permission)));