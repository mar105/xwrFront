import {connect} from "react-redux";
import commonBase from "../../../common/commonBase";
import {Col, Form, Row} from "antd";
import {ButtonGroup} from "../ButtonGroup";
import React, {useEffect, useMemo} from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import TreeModule from "../TreeModule";
import commonManage from "../../commonManage";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";
import {SwitchComponent} from "../../../components/SwitchComponent";
import SlaveContainer from "./SlaveContainer";

const Container = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    const fetchData = async () => {
      const {dispatchModifyState} = props;
      const returnRoute: any = await getAllContainer({isWait: true});
      if (commonUtils.isNotEmptyObj(returnRoute) && commonUtils.isNotEmptyArr(returnRoute.treeData)) {
        const {treeData} = returnRoute;
        const selectedKeys = [treeData[0].id];
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(treeData[0]));
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], enabled: false});
      }
    }
    fetchData();
  }, []);

  const getAllContainer = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = `${application.urlPrefix}/container/getAllContainer`;
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

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    const { commonModel, dispatch, masterData, slaveData, slaveDelData, dispatchModifyState, tabId } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('master', [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType }], [], false));
    saveData.push(commonUtils.mergeData('slave', slaveData, slaveDelData, false));
    const params = { id: masterData.id, tabId, saveData };
    const url: string = `${application.urlPrefix}/container/saveContainer`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute: any = await getAllContainer({isWait: true});
      const addState: any = {};
      const url: string = `${application.urlPrefix}/container/getContainerSlaveList?id=` + masterData.id;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        addState.slaveData = interfaceReturn.data;
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
      addState.masterData = {...props.getTreeNode(returnRoute.treeData, masterData.allId) };
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id], ...addState });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  };
  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    if (key === 'addButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6002', msg: '同级容器界面，才可增加同级' });
        return;
      }
      const data = props.onAdd();
      const allList = commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId.split(',') : [''];
      allList.splice(allList.length - 1, 1);
      const masterData = { ...data, key: data.id, superiorId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.superiorId : '',
        allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? allList.join() === '' ? data.id : allList.join() + ',' + data.id : data.id, isVisible: true };
      let treeData = commonUtils.isNotEmptyArr(treeSelectedKeys) ? [...treeDataOld] : [];
      treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
      const addState: any = {};
      addState.slaveData = [];
      addState.slaveSelectedRowKeys = [];
      addState.slaveDelData = [];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true, ...addState });
    } else if (key === 'addChildButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.routeName) || masterDataOld.routeName.split('/').length < 2) {
        props.gotoError(dispatch, { code: '6003', msg: '请选择路由子节点' });
        return;
      }
      const data = props.onAdd();
      const masterData = { ...data, key: data.id, superiorId: masterDataOld.id, allId: masterDataOld.allId + ',' + data.id, isVisible: 1 };
      let treeData = [...treeDataOld];
      let treeExpandedKeys;
      treeData = props.setNewTreeNode(treeData, masterDataOld.allId, masterData);
      if (commonUtils.isNotEmptyArr(treeExpandedKeysOld)) {
        treeExpandedKeys = [...treeExpandedKeysOld];
        treeExpandedKeys.push(masterDataOld.id);
      } else {
        treeExpandedKeys = [masterDataOld.id];
      }
      const addState: any = {};
      addState.slaveData = [];
      addState.slaveSelectedRowKeys = [];
      addState.slaveDelData = [];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.key], treeSelectedOldKeys: treeSelectedKeys, enabled: true, treeExpandedKeys, ...addState });

    } else if (key === 'modifyButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6003', msg: '容器界面才可修改' });
        return;
      }
      const data = props.onModify();
      const masterData = {...masterDataOld, ...data };
      const url: string = `${application.urlCommon}/verify/isExistModifying`;
      const params = {id: masterData.id, tabId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ masterData, enabled: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

    } else if (key === 'cancelButton') {
      let treeData = [...treeDataOld];
      const addState: any = {};
      if (masterData.handleType === 'add') {
        const allList = masterDataOld.allId.split(',');
        allList.splice(allList.length - 1, 1);
        treeData = props.setNewTreeNode(treeData, allList.join(), masterData, masterData.id);
        addState.masterData = {...props.getTreeNode(treeData, allList.join()) };
        addState.treeSelectedKeys = [addState.masterData.id];
        addState.slaveData = [];
        addState.slaveSelectedRowKeys = [];
        addState.slaveDelData = [];
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
      } else if (masterData.handleType === 'modify' || masterData.handleType === 'copyToAdd') {
        const {dispatch, commonModel, tabId, masterData} = props;
        let url: string = `${application.urlCommon}/verify/removeModifying`;
        const params = {id: masterData.id, tabId};
        let interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
        url = `${application.urlPrefix}/container/getContainerSlaveList?id=` + masterData.id;
        interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceReturn.code === 1) {
          addState.slaveData = interfaceReturn.data;
          addState.slaveSelectedRowKeys = [];
          addState.slaveDelData = [];
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
      dispatchModifyState({...addState, treeData, enabled: false});

    } else if (key === 'delButton') {
      const { commonModel, dispatch, masterData, slaveData, slaveDelData, dispatchModifyState } = props;
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isNotEmptyArr(masterData.children)) {
        props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6003', msg: '容器界面才可删除' });
        return;
      }
      const url: string = `${application.urlPrefix}/container/saveContainer`;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [masterData], [], true));
      saveData.push(commonUtils.mergeData('slave', slaveData, slaveDelData, true));
      const params = { id: masterData.id, tabId, saveData, handleType: 'del' };
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllContainer({isWait: true});
        const addState: any = {};
        if (commonUtils.isNotEmpty(returnRoute.treeData)) {
          addState.treeSelectedKeys = [returnRoute.treeData[0].id];
          addState.masterData = {...returnRoute.treeData[0]};
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(returnRoute.treeData[0]));
        }
        addState.slaveData = [];
        addState.slaveSelectedRowKeys = [];
        addState.slaveDelData = [];
        dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }

  const onTreeSelect = async (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState, dispatch, enabled, commonModel } = props;
    if (enabled) {
      props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
    } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
      const addState = props.onTreeSelect(selectedKeys, e, true);
      if (commonUtils.isNotEmpty(e.node.containerName)) {
        const url: string = `${application.urlPrefix}/container/getContainerSlaveList?id=` + e.node.id;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceReturn.code === 1) {
          addState.slaveData = interfaceReturn.data;
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      } else {
        addState.slaveData = [];
      }
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(e.node));
      dispatchModifyState(addState);
    }
  }

  const getSelectList = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    if (params.fieldName === 'popupActiveName' || params.fieldName === 'popupSelectName') {
      const requestParam = {
        routeId: props.routeId,
        pageNum: params.pageNum,
        pageSize: application.pageSize,
        searchValue: params.condition ? params.condition.searchValue : '',
      }
      const url: string = `${application.urlPrefix}/route/getSelectRoute` + commonUtils.paramGet(requestParam);

      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data.data };
        } else {
          dispatchModifyState({ ...interfaceReturn.data.data });
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return {};
      }
    }
    return {};
  }

  const { enabled, masterData, slaveData, slaveColumns, slaveSelectedRowKeys,
    treeSelectedKeys, treeData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys } = props;

  const createDate = {
    name: 'master',
    config: { fieldName: 'createDate', viewName: '创建日期' },
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  };
  const containerName = {
    name: 'master',
    config: { fieldName: 'containerName', isRequired: true, viewName: '容器名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange }
  };
  const dataSetName = {
    name: 'master',
    config: { fieldName: 'dataSetName', isRequired: true, viewName: '数据集名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange }
  };
  const sortNum = {
    name: 'master',
    config: { fieldName: 'sortNum', isRequired: true, viewName: '排序号' },
    property: { disabled: !enabled },
  };
  const chineseName = {
    name: 'master',
    form,
    config: { fieldName: 'chineseName', isRequired: true, viewName: '中文名称' },
    property: { disabled: !enabled },
  };
  const traditionalName = {
    name: 'master',
    config: { fieldName: 'traditionalName', viewName: '繁体名称' },
    property: { disabled: !enabled },
  };
  const englishName = {
    name: 'master',
    config: { fieldName: 'englishName', viewName: '英文名称' },
    property: { disabled: !enabled },
  };
  const entitySelect = {
    name: 'master',
    config: { fieldName: 'englishName', viewName: '实体查询' },
    property: { disabled: !enabled },
  };
  const entityWhere = {
    name: 'master',
    config: { fieldName: 'entityWhere', viewName: '实体条件' },
    property: { disabled: !enabled },
  };
  const entitySort = {
    name: 'master',
    config: { fieldName: 'entitySort', viewName: '实体排序' },
    property: { disabled: !enabled },
  };
  const isVisible = {
    name: 'master',
    config: { fieldName: 'isVisible', viewName: '是否显示' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };
  const fixColumnCount = {
    name: 'master',
    config: { fieldName: 'fixColumnCount', viewName: '固定列数' },
    property: { disabled: !enabled },
  };

  const isTable = {
    name: 'master',
    config: { fieldName: 'isTable', viewName: '是否表格' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTable, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };
  const isTableHeadSort = {
    name: 'master',
    config: { fieldName: 'isTableHeadSort', viewName: '是否表头排序' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTableHeadSort, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };
  const isMutiChoise = {
    name: 'master',
    config: { fieldName: 'isMutiChoise', viewName: '是否多选' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isMutiChoise, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };
  const isRowNo = {
    name: 'master',
    config: { fieldName: 'isRowNo', viewName: '是否显示行号' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isRowNo, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };

  const virtualName = {
    name: 'master',
    config: { fieldName: 'virtualName', viewName: '虚拟名称' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVirtual, disabled: !enabled },
    event: { onChange: props.onSwitchChange }
  };

  const buttonGroup = { onClick, enabled };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={onTreeSelect} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <Row>
        <Col><DatePickerComponent {...createDate} /></Col>
        <Col><InputComponent {...containerName} /></Col>
        <Col><InputComponent {...dataSetName} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...chineseName} /></Col>
        <Col><InputComponent {...traditionalName} /></Col>
        <Col><InputComponent {...englishName} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...entitySelect} /></Col>
        <Col><InputComponent {...entityWhere} /></Col>
        <Col><InputComponent {...entitySort} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...virtualName} /></Col>
        <Col><NumberComponent {...sortNum} /></Col>
        <Col><SwitchComponent {...isVisible} /></Col>
        <Col><SwitchComponent {...isTable} /></Col>
      </Row>
      {commonUtils.isNotEmptyObj(masterData) && masterData.isTable ?
      <Row>
        <Col><NumberComponent {...fixColumnCount} /></Col>
        <Col><SwitchComponent {...isTableHeadSort} /></Col>
        <Col><SwitchComponent {...isMutiChoise} /></Col>
        <Col><SwitchComponent {...isRowNo} /></Col>
      </Row>
        : ''}
    </div>)}, [masterData, enabled]);

  const containerNameValue = commonUtils.isNotEmptyObj(masterData) && commonUtils.isNotEmpty(masterData.containerName) ? masterData.containerName : '';
  const slaveTable = useMemo(()=>{ return (
    <SlaveContainer name='slave' {...props} getSelectList={getSelectList} onClick={onClick} />
  )}, [containerNameValue, slaveColumns, slaveData, enabled, slaveSelectedRowKeys]);

  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <Row>
        <Col>
          {tree}
        </Col>

        <Col>
          <Row>
            {component}
          </Row>
        </Col>
      </Row>
      <Row>
        {slaveTable}
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}
export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(commonManage(Container)));