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
    const url: string = `${application.urlPrefix}/module/saveRoute`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute = await getAllRoute({isWait: true});
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id] });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, treeSelectedOldKeys, masterData: masterDataOld } = props;
    if (key === 'addButton') {
      const data = props.onAdd();
      const masterData = { ...data, allId: data.id };
      const treeData = [...treeDataOld, masterData];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true });
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
      // const returnRoute: any = await getAllRoute({isWait: true});
      const treeData = [...treeDataOld];
      console.log('1111', masterData);
      if (masterData.handleType === 'add') {
        const iIndex = treeDataOld.findIndex(item => item.key === masterData.id);
        if (iIndex > -1) {
          treeData.splice(iIndex, 1);
        }
      } else { // if (masterData.handleType === 'modify') {
        const {dispatch, commonModel, tabId, masterData} = props;
        const url: string = `${application.urlCommon}/verify/removeModifying`;
        const params = {id: masterData.id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
      let selectRoute: any;
      if (commonUtils.isNotEmptyArr(treeSelectedOldKeys)) {
        const iIndex = treeData.findIndex(item => item.key === treeSelectedOldKeys.toString());
        if (iIndex > -1) {
          const selectedKeys = [treeData[iIndex].id];
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(treeData[iIndex]));
          selectRoute = {treeSelectedKeys: selectedKeys, masterData: treeData[iIndex]};
        }
      }
      dispatchModifyState({...selectRoute, treeData, enabled: false});

    }

  }

  const onSelect = (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState } = props;
    if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(e.node));
      dispatchModifyState({treeSelectedKeys: selectedKeys, masterData: e.node });

      // const url: string = `${application.urlPrefix}/module/getRoute?id=` + selectedKeys;
      // const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      // if (interfaceReturn.code === 1) {
      //   dispatchModifyState({treeSelectedKeys: selectedKeys, masterData: interfaceReturn.data });
      //   form.resetFields();
      //   form.setFieldsValue(interfaceReturn.data);
      //   console.log(interfaceReturn);
      // } else {
      //   props.gotoError(dispatch, interfaceReturn);
      // }
    }
  }

  const { treeSelectedKeys, treeData, enabled, masterData, onMasterChange } = props;

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, height: 500 },
    event: { onSelect },
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
    property: { checkedChildren: '显示', unCheckedChildren: '隐藏', defaultChecked: true, disabled: !enabled }
  };

  const tree =  useMemo(()=>{ return <TreeComponent {...treeParam} />}, [treeData, treeSelectedKeys]);
  const component =  useMemo(()=>{ return (
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