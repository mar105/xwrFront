import { connect } from 'dva';
import React, { useEffect, useMemo } from 'react';
import * as application from "../../application";
import * as request from "../../../utils/request";
import {Col, Form, Row} from "antd";
import commonBase from "../../../utils/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../ButtonGroup";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";
import {SwitchComponent} from "../../../components/SwitchComponent";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import TreeModule from "./TreeModule";
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
//   modelsType: string,
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
        form.setFieldsValue(commonUtils.setFieldsValue(treeData[0]));
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], enabled: false});
      }
    }
    fetchData();
  }, []);

  const getAllRoute = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = `${application.urlPrefix}/route/getAllRoute`;
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
    const { commonModel, dispatch, masterData, dispatchModifyState } = props;
    const params = { ...masterData, ...values };
    const url: string = masterData.handleType === 'add' ?
      `${application.urlPrefix}/route/saveRoute` : `${application.urlPrefix}/route/modifyRoute`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute = await getAllRoute({isWait: true});
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id] });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }



  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    if (key === 'addButton') {
      const data = props.onAdd();
      const masterData = { ...data, key: data.id, superiorId: '', allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId : data.id, isVisible: 1 };
      let treeData = [...treeDataOld];
      const allList = masterDataOld.allId.split(',');
      allList.splice(allList.length - 1, 1);
      treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true });
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
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.key], treeSelectedOldKeys: treeSelectedKeys, enabled: true, treeExpandedKeys });

    } else if (key === 'modifyButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
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
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
      } else if (masterData.handleType === 'modify' || masterData.handleType === 'copyToAdd') {
        const {dispatch, commonModel, tabId, masterData} = props;
        const url: string = `${application.urlCommon}/verify/removeModifying`;
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
      const url: string = `${application.urlPrefix}/route/delRoute`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllRoute({isWait: true});
        const addState: any = {};
        if (commonUtils.isNotEmpty(returnRoute.treeData)) {
          addState.treeSelectedKeys = [returnRoute.treeData[0].id];
          addState.masterData = {...returnRoute.treeData[0]};
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(returnRoute.treeData[0]));
        }

        dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }




  const { treeSelectedKeys, treeData, enabled, masterData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys } = props;

  const createDate = {
    form,
    fieldName: 'createDate',
    label: '创建日期',
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  };
  const routeName = {
    form,
    fieldName: 'routeName',
    label: '路由名称',
    rules: [{ required: true, message: '请输入你的路由名称' }],
    property: { disabled: !enabled },
  };
  const sortNum = {
    form,
    fieldName: 'sortNum',
    label: '排序号',
    rules: [{ required: true, message: '请输入你的排序号' }],
    property: { disabled: !enabled },
  };
  const chineseName = {
    form,
    fieldName: 'chineseName',
    label: '中文名称',
    rules: [{ required: true, message: '请输入你的中文名称' }],
    property: { disabled: !enabled },
  };
  const traditionalName = {
    form,
    fieldName: 'traditionalName',
    label: '繁体名称',
    property: { disabled: !enabled },
  };
  const englishName = {
    form,
    fieldName: 'englishName',
    label: '英文名称',
    property: { disabled: !enabled },
  };
  const modelsType = {
    form,
    fieldName: 'modelsType',
    label: '模块类型',
    property: { disabled: !enabled },
  };

  const isVisible = {
    form,
    fieldName: 'isVisible',
    label: '是否显示',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible, disabled: !enabled }
  };
  const isVirtual = {
    form,
    fieldName: 'isVirtual',
    label: '是否虚拟化',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVirtual, disabled: !enabled }
  };
  const buttonGroup = { onClick, enabled };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={props.onTreeSelect} />
    )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <DatePickerComponent {...createDate} />
      <InputComponent {...routeName} />
      <NumberComponent {...sortNum} />
      <InputComponent {...chineseName} />
      <InputComponent {...traditionalName} />
      <InputComponent {...englishName} />
      <InputComponent {...modelsType} />
      <SwitchComponent {...isVisible} />
      <SwitchComponent {...isVirtual} />
    </div>)}, [masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
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

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(commonManage(Route)));