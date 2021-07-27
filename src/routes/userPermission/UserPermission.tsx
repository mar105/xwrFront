import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "../../common/ButtonGroup";
import commonDocEvent from "../../common/commonDocEvent";
import { CommonExhibit } from "../../common/CommonExhibit";
import {TableComponent} from "../../components/TableComponent";

const UserPermission = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      const fetchData = async () => {
        const { dispatchModifyState } = props;

        let addState = {};
        // 权限分类
        addState = { ...addState, ... await getFetchData('permissionCategory') };

        // 客户权限
        addState = { ...addState, ... await getFetchData('customer') };

        // 供应商权限
        addState = { ...addState, ... await getFetchData('supply') };

        // 工序权限
        addState = { ...addState, ... await getFetchData('process') };

        // 人员权限
        addState = { ...addState, ... await getFetchData('userBusiness') };

        dispatchModifyState({ ...addState });
      }
      fetchData();

    }
  }, [props.masterContainer.dataSetName]);


  const getSlaveData = (name, table, container, tableDataOld, masterKeyValue, assignField) => {
    const tableData: any = [];
    table.filter(item => item[container.treeSlaveKey] === masterKeyValue).forEach((dataRow, indexTable) => {
      const indexCategory = tableDataOld.findIndex(item => item[name + 'Id'] === dataRow.id);
      let data: any = !(indexCategory > -1) ? props.onAdd(container) : tableDataOld[indexCategory];
      data = { ...data, ...commonUtils.getAssignFieldValue(assignField, dataRow)};
      data.userId = masterData.userId;
      data[container.treeSlaveKey] = dataRow[container.treeSlaveKey];
      data.sortNum = indexTable;
      const children = getSlaveData(name, table, container, tableDataOld, dataRow[container.treeKey], assignField);
      if (commonUtils.isNotEmptyArr(children)) {
        data.children = children;
      }
      tableData.push(data);
    });
    return tableData;
  }

  const getFetchData = async (name) => {
    const { [name + 'Container']: container, [name + 'DelData']: delDataOld, masterData } = props;
    let returnData = await props.getDataList({ name, containerId: container.id, condition: { dataId: props.dataId }, isWait: true });
    let addState = {...returnData};
    const tableData: any = [];
    const tableDataOld: any = [...addState[name + 'Data']];
    const tableSelectedRowKeys: any = [];
    addState[name + 'Data'].forEach(item => {
      tableSelectedRowKeys.push(item[container.tableKey]);
    });
    const tableDelData: any = commonUtils.isEmptyArr(delDataOld) ? [] : [...delDataOld];
    if (container.isTree) {
      const indexTree = container.slaveData.findIndex(item => item.fieldName === (name + 'Tree'));
      const index = container.slaveData.findIndex(item => item.fieldName === name);
      if (indexTree > -1 && commonUtils.isNotEmpty(container.slaveData[indexTree].viewDrop) &&
          index > -1 && commonUtils.isNotEmpty(container.slaveData[index].viewDrop)) {
        const tableTree = (await props.getSelectList({containerSlaveId: container.slaveData[indexTree].id, isWait: true })).list;
        const tableSlave = (await props.getSelectList({containerSlaveId: container.slaveData[index].id, isWait: true })).list;
        const table = [...tableTree, ...tableSlave];
        let rowIndex = 0;
        // 判断已存数据库的数据集中有没有已经不存在的数据，有的话标记删除
        for(const dataRow of tableDataOld) {
          const indexTableData = table.findIndex(item => item.id === dataRow[name + 'Id']);
          if (!(indexTableData > -1)) {
            dataRow.handleType = 'del';
            tableDelData.push(dataRow);
            tableDataOld.splice(rowIndex, 1);
          }
          rowIndex += 1;
        }
        // 通过treeKey, treeSlaveKey 重新生成数据
        table.filter(item => commonUtils.isEmpty(item[container.treeSlaveKey])).forEach((dataRow, indexTable) => {
          const indexCategory = tableDataOld.findIndex(item => item[name + 'Id'] === dataRow.id);
          let data: any = !(indexCategory > -1) ? props.onAdd(container) : tableDataOld[indexCategory];
          data = { ...data, ...commonUtils.getAssignFieldValue(container.slaveData[index].assignField, dataRow)};
          data.userId = masterData.userId;
          data[container.treeSlaveKey] = dataRow[container.treeSlaveKey];
          data.sortNum = indexTable;
          const children = getSlaveData(name, table, container, tableDataOld, dataRow[container.treeKey], container.slaveData[index].assignField);
          if (commonUtils.isNotEmptyArr(children)) {
            data.children = children;
          }
          tableData.push(data);
        });
        addState[name + 'Data'] = tableData;
      }

    } else {
      const index = container.slaveData.findIndex(item => item.fieldName === name);
      if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].viewDrop)) {
        const table = (await props.getSelectList({containerSlaveId: container.slaveData[index].id, isWait: true })).list;
        let rowIndex = 0;
        for(const dataRow of tableDataOld) {
          const indexTableData = table.findIndex(item => item.id === dataRow[name + 'Id']);
          if (!(indexTableData > -1)) {
            dataRow.handleType = 'del';
            tableDelData.push(dataRow);
            tableDataOld.splice(rowIndex, 1);
          }
          rowIndex += 1;
        }

        table.forEach((dataRow, indexTable)  => {
          const indexCategory = tableDataOld.findIndex(item => item[name + 'Id'] === dataRow.id);
          let data: any = !(indexCategory > -1) ? props.onAdd(container) : tableDataOld[indexCategory];
          data = { ...data, ...commonUtils.getAssignFieldValue(container.slaveData[index].assignField, dataRow)};
          data.userId = masterData.userId;
          data.sortNum = indexTable;
          tableData.push(data);
        });
        addState[name + 'Data'] = tableData;
      }
    }

    return addState;
  }

  const onFinish = async (values: any) => {
    const { permissionData, permissionDelData, customerData, customerDelData } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('permission', permissionData, permissionDelData, false));
    saveData.push(commonUtils.mergeData('customer', customerData, customerDelData, false));
    const childParams = { saveData };
    props.onFinish(values, childParams);
  }

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        const childParams = {};
        if (props.copyToData) {
          const masterData = {...commonUtils.getAssignFieldValue(props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
          childParams['masterData'] = masterData;
          for(const config of props.copyToData.config.children) {
            const fieldNameSplit = config.fieldName.split('.');
            const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
            if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
              const copyData: any = [];
              for(const data of props.copyToData[dataSetName + 'Data']) {
                copyData.push({...commonUtils.getAssignFieldValue(config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
              }
              childParams[dataSetName + 'Data'] = copyData;
            }
          }
        }
        onButtonClick('addButton', null, null, childParams);
      }
      else if (props.handleType === 'modify') {
        onButtonClick('modifyButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);

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

  const { enabled, masterContainer, masterData } = props;
  const buttonGroup = { onClick: onButtonClick, enabled, container: masterContainer, buttonGroup: props.getButtonGroup() };
  const permissionCategoryParam: any = commonUtils.getTableProps('permissionCategory', props);
  permissionCategoryParam.pagination = false;
  permissionCategoryParam.isLastColumn = false;

  const customerParam: any = commonUtils.getTableProps('customer', props);
  customerParam.pagination = false;
  customerParam.isLastColumn = false;

  const supplyParam: any = commonUtils.getTableProps('supply', props);
  supplyParam.pagination = false;
  supplyParam.isLastColumn = false;

  const userParam: any = commonUtils.getTableProps('user', props);
  userParam.pagination = false;
  userParam.isLastColumn = false;

  const processParam: any = commonUtils.getTableProps('process', props);
  processParam.pagination = false;
  processParam.isLastColumn = false;

  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.permissionCategoryContainer) ? <TableComponent {...permissionCategoryParam} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.customerContainer) ? <TableComponent {...customerParam} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.supplyContainer) ? <TableComponent {...supplyParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.userContainer) ? <TableComponent {...userParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.processContainer) ? <TableComponent {...processParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(UserPermission)));