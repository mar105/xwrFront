import { connect } from 'dva';
import React, { useEffect, useMemo } from 'react';
import * as application from "../../application";
import * as request from "../../../utils/request";
import {Col, Form, Row} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";
import {SwitchComponent} from "../../../components/SwitchComponent";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import TreeModule from "../TreeModule";
import commonManage from "../../commonManage";

// type IRoute = {
//   id: string,
//   userId: string,
//   isInvalid: boolean,
//   routeName: string,
//   sortNum: number,
//   chineseName: string,
//   traditionalName;
//   englishName: string,
//   isVisible: boolean,
//   modelType: string,
//   allId: string,
// }

const Route = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    const fetchData = async () => {
      const {dispatchModifyState} = props;
      const returnRoute: any = await getAllRoute({isWait: true});
      if (commonUtils.isNotEmptyObj(returnRoute) && commonUtils.isNotEmptyArr(returnRoute.treeData)) {
        const {treeData} = returnRoute;
        const selectedKeys = [treeData[0].id];
        form.resetFields();
        form.setFieldsValue({ ...commonUtils.setFieldsValue(treeData[0]), treeSearchValue: props.treeSearchValue });
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], masterModifyData: {}, enabled: false});
      }
    }
    fetchData();
  }, []);

  const getAllRoute = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = application.urlPrefix + '/route/getAllRoute';
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
    saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }],
      commonUtils.isNotEmptyObj(masterModifyData) ? [masterModifyData] : [], []));
    const params = { id: masterData.id, tabId, saveData };
    const url: string = application.urlPrefix + '/route/saveRoute';
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute: any = await getAllRoute({isWait: true});
      const addState: any = {};
      addState.masterData = {...props.getTreeNode(returnRoute.treeData, masterData.allId) };
      addState.masterModifyData = {};
      form.resetFields();
      form.setFieldsValue({ ...commonUtils.setFieldsValue(addState.masterData), treeSearchValue: props.treeSearchValue });
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id], ...addState });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }



  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    if (key === 'addButton') {
      const data = props.onAdd();
      const allList = commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId.split(',') : [''];
      allList.splice(allList.length - 1, 1);
      const masterData = { ...data, key: data.id, superiorId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.superiorId : '',
        allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? allList.join() === '' ? data.id : allList.join() + ',' + data.id : data.id, isVisible: true };
      let treeData = commonUtils.isNotEmptyArr(treeSelectedKeys) ? [...treeDataOld] : [];
      treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
      form.resetFields();
      form.setFieldsValue({ ...commonUtils.setFieldsValue(masterData), treeSearchValue: props.treeSearchValue });
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true });
    } else if (key === 'addChildButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
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
      form.resetFields();
      form.setFieldsValue({ ...commonUtils.setFieldsValue(masterData), treeSearchValue: props.treeSearchValue });
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.key], treeSelectedOldKeys: treeSelectedKeys, enabled: true, treeExpandedKeys });

    } else if (key === 'modifyButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      const data = props.onModify();
      const masterData = {...masterDataOld, ...data };
      const url: string = application.urlCommon + '/verify/isExistModifying';
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
        form.setFieldsValue({ ...commonUtils.setFieldsValue(addState.masterData), treeSearchValue: props.treeSearchValue });
      } else if (masterData.handleType === 'modify' || masterData.handleType === 'copyToAdd') {
        const {dispatch, commonModel, tabId, masterData} = props;
        const url: string = application.urlCommon + '/verify/removeModifying';
        const params = {id: masterData.id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
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
      const params = { ...masterData };
      const url: string = application.urlPrefix + '/route/delRoute';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllRoute({isWait: true});
        const addState: any = {};
        if (commonUtils.isNotEmpty(returnRoute.treeData)) {
          addState.treeSelectedKeys = [returnRoute.treeData[0].id];
          addState.masterData = {...returnRoute.treeData[0]};
          addState.masterModifyData = {};
          form.resetFields();
          form.setFieldsValue({ ...commonUtils.setFieldsValue(returnRoute.treeData[0]), treeSearchValue: props.treeSearchValue });
        }

        dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else if (key === 'copyButton') {
      const { commonModel, dispatch, masterData, dispatchModifyState } = props;
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      const params = { id: masterData.id };
      const url: string = application.urlPrefix + '/route/copyRoute';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllRoute({isWait: true});
        const addState: any = {};
        addState.masterData = {...props.getTreeNode(returnRoute.treeData, interfaceReturn.data.allId) };
        addState.masterModifyData = {};
        form.resetFields();
        form.setFieldsValue({ ...commonUtils.setFieldsValue(addState.masterData), treeSearchValue: props.treeSearchValue });
        dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [addState.masterData.id], ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }




  const { treeSelectedKeys, treeData, enabled, masterData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys, commonModel } = props;

  const createDate = {
    name: 'master',
    config: { fieldName: 'createDate', viewName: '创建日期' },
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
    event: { onChange: props.onDataChange },
  };
  const routeName = {
    name: 'master',
    config: { fieldName: 'routeName', isRequired: true, viewName: '路由名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };
  const sortNum = {
    name: 'master',
    config: { fieldName: 'sortNum', isRequired: true, viewName: '排序号' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };
  const chineseName = {
    name: 'master',
    config: { fieldName: 'chineseName', isRequired: true, viewName: '中文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };
  const traditionalName = {
    name: 'master',
    config: { fieldName: 'traditionalName', viewName: '繁体名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };
  const englishName = {
    name: 'master',
    config: { fieldName: 'englishName', viewName: '英文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };
  const modelType = {
    name: 'master',
    config: { fieldName: 'modelType', viewName: '模块类型' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange },
  };

  const isVisible = {
    name: 'master',
    config: { fieldName: 'isVisible', viewName: '是否显示' },
    property: { checkedChildren: '是', unCheckedChildren: '否', disabled: !enabled, checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible },
    event: { onChange: props.onDataChange }
  };

  const buttonAddGroup: any = props.getButtonGroup();
  buttonAddGroup.push({ key: 'copyButton', caption: '复制', htmlType: 'button', onClick, sortNum: 100, disabled: props.enabled });
  const buttonGroup = { userInfo: commonModel.userInfo, onClick, enabled, buttonGroup: buttonAddGroup };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={props.onTreeSelect} getAllRoute={getAllRoute} />
    )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <DatePickerComponent {...createDate} />
      <InputComponent {...routeName} />
      <NumberComponent {...sortNum} />
      <InputComponent {...chineseName} />
      <InputComponent {...traditionalName} />
      <InputComponent {...englishName} />
      <InputComponent {...modelType} />
      <SwitchComponent {...isVisible} />
    </div>)}, [masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {tree}
        </Col>
        <Col>
          {component}
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonManage(Route)));