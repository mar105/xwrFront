import {connect} from "react-redux";
import commonBase from "../../../common/commonBase";
import {Col, Form, Row} from "antd";
import {ButtonGroup} from "../../../common/ButtonGroup";
import React, {useEffect, useMemo} from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import TreeModule from "../TreeModule";
import commonManage from "../../commonManage";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";

const Permission = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    const fetchData = async () => {
      const {dispatchModifyState} = props;
      const returnRoute: any = await getAllPermission({isWait: true});
      if (commonUtils.isNotEmptyObj(returnRoute) && commonUtils.isNotEmptyArr(returnRoute.treeData)) {
        const {treeData} = returnRoute;
        const selectedKeys = [treeData[0].id];
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(treeData[0]));
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], masterModifyData: {}, enabled: false});
      }
    }
    fetchData();
  }, []);

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

  const onFinish = async (values: any) => {
    const { commonModel, dispatch, masterData, masterModifyData, dispatchModifyState, tabId } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType }], [masterModifyData], []));
    const params = { id: masterData.id, tabId, saveData };
    const url: string = `${application.urlPrefix}/permission/savePermission`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute: any = await getAllPermission({isWait: true});
      const addState: any = {};
      addState.masterData = {...props.getTreeNode(returnRoute.treeData, masterData.allId) };
      addState.masterModifyData = {};
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
      if (commonUtils.isEmpty(masterDataOld.permissionName)) {
        props.gotoError(dispatch, { code: '6002', msg: '同级权限界面，才可增加同级' });
        return;
      }
      const data = props.onAdd();
      const allList = commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId.split(',') : [''];
      allList.splice(allList.length - 1, 1);
      const masterData = { ...data, key: data.id, superiorId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.superiorId : '',
        allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? allList.join() === '' ? data.id : allList.join() + ',' + data.id : data.id };
      let treeData = commonUtils.isNotEmptyArr(treeSelectedKeys) ? [...treeDataOld] : [];
      treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true });
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
      const masterData = { ...data, key: data.id, superiorId: masterDataOld.id, allId: masterDataOld.allId + ',' + data.id };
      let treeData = [...treeDataOld];
      let treeExpandedKeys;
      treeData = props.setNewTreeNode(treeData, masterDataOld.allId, masterData);
      if (commonUtils.isNotEmptyArr(treeExpandedKeysOld)) {
        treeExpandedKeys = [...treeExpandedKeysOld];
        treeExpandedKeys.push(masterDataOld.id);
      } else {
        treeExpandedKeys = [masterDataOld.id];
      }
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.key], treeSelectedOldKeys: treeSelectedKeys, enabled: true, treeExpandedKeys });

    } else if (key === 'modifyButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.permissionName)) {
        props.gotoError(dispatch, { code: '6003', msg: '权限界面才可修改' });
        return;
      }
      const data = props.onModify();
      const masterData = {...masterDataOld, ...data };
      const url: string = `${application.urlCommon}/verify/isExistModifying`;
      const params = {id: masterData.id, tabId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ masterData, masterModifyData: {}, enabled: true });
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
      }
      dispatchModifyState({...addState, treeData, enabled: false});

    } else if (key === 'delButton') {
      const { commonModel, dispatch, masterData, dispatchModifyState } = props;
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isNotEmptyArr(masterData.children)) {
        props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.permissionName)) {
        props.gotoError(dispatch, { code: '6003', msg: '权限界面才可删除' });
        return;
      }
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [masterData], [], [], true));
      const params = { id: masterData.id, tabId, saveData, handleType: 'del' };
      const url: string = `${application.urlPrefix}/permission/savePermission`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllPermission({isWait: true});
        const addState: any = {};
        if (commonUtils.isNotEmpty(returnRoute.treeData)) {
          addState.treeSelectedKeys = [returnRoute.treeData[0].id];
          addState.masterData = {...returnRoute.treeData[0]};
          addState.masterModifyData = {};
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(returnRoute.treeData[0]));
        }
        dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }

  const { enabled, masterData,
    treeSelectedKeys, treeData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys, commonModel } = props;

  const createDate = {
    name: 'master',
    config: { fieldName: 'createDate', viewName: '创建日期' },
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
    event: { onChange: props.onDatePickerChange },
  };
  const permissionName = {
    name: 'master',
    config: { fieldName: 'permissionName', isRequired: true, viewName: '权限名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange },
  };
  const sortNum = {
    name: 'master',
    config: { fieldName: 'sortNum', isRequired: true, viewName: '排序号' },
    property: { disabled: !enabled },
    event: { onChange: props.onNumberChange }
  };
  const chineseName = {
    name: 'master',
    config: { fieldName: 'chineseName', isRequired: true, viewName: '中文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange },
  };
  const traditionalName = {
    name: 'master',
    config: { fieldName: 'traditionalName', viewName: '繁体名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange },
  };
  const englishName = {
    name: 'master',
    config: { fieldName: 'englishName', viewName: '英文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onInputChange },
  };


  const buttonGroup = { userInfo: commonModel.userInfo, onClick, enabled, buttonGroup: props.getButtonGroup() };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={props.onTreeSelect} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <DatePickerComponent {...createDate} />
      <InputComponent {...permissionName} />
      <NumberComponent {...sortNum} />
      <InputComponent {...chineseName} />
      <InputComponent {...traditionalName} />
      <InputComponent {...englishName} />
    </div>)}, [masterData, enabled]);

  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
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
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}
export default connect(commonUtils.mapStateToProps)(commonBase(commonManage(Permission)));