import { connect } from 'dva';
import React, { useEffect, useMemo } from 'react';
import { TreeComponent } from '../../components/TreeComponent';
import * as application from "../application";
import * as request from "../../utils/request";
import {Col, Form, Row} from "antd";
import commonBase from "../../utils/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "./ButtonGroup";
import {InputComponent} from "../../components/InputComponent";
import {NumberComponent} from "../../components/NumberComponent";
import {SwitchComponent} from "../../components/SwitchComponent";
import {DatePickerComponent} from "../../components/DatePickerComponent";

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
    const url: string = `${application.urlPrefix}/module/getAllRoute`;
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
      `${application.urlPrefix}/module/saveRoute` : `${application.urlPrefix}/module/modifyRoute`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute = await getAllRoute({isWait: true});
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id] });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  // 增加时，树节点增加空行数据
  // delId不为空时为删除树节点数据。
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

  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    if (key === 'addButton') {
      const data = props.onAdd();
      const masterData = { ...data, key: data.id, allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId : data.id, isVisible: 1 };
      let treeData = [...treeDataOld];
      const allList = masterDataOld.allId.split(',');
      allList.splice(allList.length - 1, 1);
      treeData = setNewTreeNode(treeData, allList.join(), masterData);
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
      treeData = setNewTreeNode(treeData, masterDataOld.allId, masterData);
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
        treeData = setNewTreeNode(treeData, allList.join(), masterData, masterData.id);
        addState.masterData = {...getTreeNode(treeData, allList.join()) };
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
      const params = { ...masterData };
      const url: string = `${application.urlPrefix}/module/delRoute`;
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

  const onSelect = (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState, dispatch, enabled } = props;
    if (enabled) {
      props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
    } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(e.node));
      dispatchModifyState({treeSelectedKeys: selectedKeys, masterData: { ...e.node }, selectNode: e.node });
    }
  }

  const onExpand= (expandedKeys) => {
    const { dispatchModifyState } = props;
    dispatchModifyState({treeExpandedKeys: expandedKeys });
  }


  const { treeSelectedKeys, treeData, enabled, masterData, onMasterChange, treeExpandedKeys } = props;

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, expandedKeys: treeExpandedKeys, height: 500 },
    event: { onSelect, onExpand },
  };

  const buttonGroup = { onClick, enabled };

  const createDate = {
    form,
    fieldName: 'createDate',
    label: '创建日期',
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
    event: { onMasterChange },
  };
  const routeName = {
    form,
    fieldName: 'routeName',
    label: '路由名称',
    rules: [{ required: true, message: '请输入你的路由名称' }],
    property: { disabled: !enabled },
    event: { onMasterChange },
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
    property: { checkedChildren: '显示', unCheckedChildren: '隐藏', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible, disabled: !enabled }
  };
  const tree =  useMemo(()=>{ return <TreeComponent {...treeParam} />}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled]);
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
    </div>)}, [masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <ButtonGroup {...buttonGroup} />

      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {tree}
        </Col>
        <Col>
          {component}
        </Col>
      </Row>
    </Form>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(Route));