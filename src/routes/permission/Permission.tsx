import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "../../common/ButtonGroup";
import commonDocEvent from "../../common/commonDocEvent";
import { CommonExhibit } from "../../common/CommonExhibit";
import {TableComponent} from "../../components/TableComponent";
import * as application from "../../xwrManage/application";
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
      fetchData();
    }
  }, [props.userContainer]);

  const fetchData = async () => {
    const { dispatchModifyState } = props;

    let addState = {};
    // 权限分类
    addState = { ...addState, ... await getFetchData('user') };

    //系统权限
    const permission = await getAllPermission({ isWait: true });
    addState.permissionData = permission.treeData;

    dispatchModifyState({ ...addState });
  }

  const getAllPermission = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = `${application.urlPrefix}/permission/getAllPermission`;
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

  const getFetchData = async (name) => {
    const { [name + 'Container']: container } = props;
    const tableData: any = [];
    const tableSrcData: any = [];
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
          const children = getSlaveData(name, table, container, tableSrcData, dataRow[container.treeKey], container.slaveData[index].assignField);
          if (commonUtils.isNotEmptyArr(children)) {
            data.children = children;
          }
          tableSrcData.push(data);
          tableData.push(data);
        });
        addState[name + 'Data'] = tableData;
        addState[name + 'SrcData'] = tableSrcData;
      }
    }
    return addState;
  }

  const getSlaveData = (name, table, container, tableSrcData, masterKeyValue, assignField) => {
    const tableData: any = [];
    table.filter(item => item[container.treeSlaveKey] === masterKeyValue).forEach((dataRow, indexTable) => {
      const data = { ...props.onAdd(container), ...commonUtils.getAssignFieldValue(assignField, dataRow)};
      data[container.treeSlaveKey] = dataRow[container.treeSlaveKey];
      data.sortNum = indexTable;
      const children = getSlaveData(name, table, container, tableSrcData, dataRow.id, assignField);
      if (commonUtils.isNotEmptyArr(children)) {
        data.children = children;
      }
      tableSrcData.push(data);
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

    await props.onFinish(values, {childCallback});
    fetchData();
  }

  const getFinishData = (name) => {
    const newName = props[name + 'Container'].isTree ? name + 'Src' : name;
    const { [name + 'SelectedRowKeys']: tableSelectedRowKeysOld, [newName + 'Data']: tableDataOld, [name + 'DelData']: tableDelData } = props;
    const tableSelectedRowKeys = commonUtils.isEmptyArr(tableSelectedRowKeysOld) ? [] : tableSelectedRowKeysOld;
    const tableData: any = [];
    for(const dataRow of tableDataOld) {
      if (tableSelectedRowKeys.findIndex(item => item === dataRow[name + 'Id']) > -1) {
        tableData.push(dataRow);
      } else if (dataRow.handleType !== 'add') {
        tableData.push({...dataRow, handleType: 'del' });
      }
    }
    return commonUtils.mergeData(name, tableData.filter(item => commonUtils.isNotEmpty(item.handleType)), tableDelData, true);
  }

  const onButtonClick = async (key, config, e, childParamsOld: any = undefined) => {
    let childParams: any = {};
    if (key === 'addButton') {
      for(const container of props.containerData) {
        childParams[container.dataSetName + 'Data'] = [];
      }
      childParams = {...childParams, ...childParamsOld};
      props.onButtonClick(key, config, e, childParams);
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const { enabled, masterContainer } = props;
  const buttonGroup = { onClick: onButtonClick, enabled, container: masterContainer, buttonGroup: props.getButtonGroup() };

  const userParam: any = commonUtils.getTableProps('user', props);
  userParam.pagination = false;
  userParam.isLastColumn = false;
  userParam.enabled = false;
  userParam.property.rowSelection = null;

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