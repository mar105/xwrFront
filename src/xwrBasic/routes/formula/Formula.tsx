import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import * as application from "../../application";
import * as request from "../../../utils/request";
import {Col, Form, Row} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../ButtonGroup";
import commonBasic from "../../commonBasic";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {InputComponent} from "../../../components/InputComponent";
import {TreeComponent} from "../../../components/TreeComponent";

const Formula = (props) => {
  const formulaRef = React.useRef<any>(null);
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    const fetchData = async () => {
      const { dispatchModifyState } = props;
      const index = props.containerData[0].slaveData.findIndex(item => item.fieldName === 'treeSql');
      if (index > -1) {
        const returnState: any = await props.getSelectList({containerSlaveId: props.containerData[0].slaveData[index].id, isWait: true });
        dispatchModifyState({ formulaParam: returnState.list });
      }
    }
    fetchData();
  }, []);

  const getTreeData = (formulaType) => {
    const { formulaParam: formulaParamOld, masterContainer } = props;
    const treeData: any = [];
    const formulaParam: any = [];
    formulaParam.push(...formulaParamOld.filter(item => item.paramCategory === formulaType));
    let index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaParam');  // 公式参数
    let config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: formulaParam});

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'billNumParam'); // 流水号参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    const billNumParam: any = {title: config.viewName, key: config.id, children: []};

    // 年，月、日、流水号
    masterContainer.slaveData.filter(item => item.viewName.indexOf('{') > -1).forEach(config => {
      billNumParam.children.push({title: config.viewName, key: config.id});
    });
    treeData.push(billNumParam);

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'systemParam'); // 系统参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: []});

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'methodParam'); //函数参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: []});
    return treeData;
  };

  const onSelectChange = (name, fieldName, record, assignField, value, option) => {
    if (fieldName === 'formulaType') {
      const { dispatchModifyState } = props;
      const returnState = props.onSelectChange(name, fieldName, record, assignField, value, option, true);
      const treeData = getTreeData(value);
      dispatchModifyState({treeData, ...returnState});
    } else {
      props.onSelectChange(name, fieldName, record, assignField, value, option);
    }

  }
  const onFinish = async (values: any) => {
    const { commonModel, dispatch, masterData, tabId, dispatchModifyState } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('master', [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
    const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
    const url: string = `${application.urlMain}/getData/saveData`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnState: any = await props.getAllData({ dataId: masterData.id });
      dispatchModifyState({...returnState});
    } else if (interfaceReturn.code === 10) {
      dispatchModifyState({ pageLoading: true });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }



  const onClick = async (key, e) => {
    const { commonModel, tabId, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld } = props;
    if (key === 'addButton') {
      const masterData = props.onAdd();
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, enabled: true });
    } else if (key === 'modifyButton') {
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
      if (masterDataOld.handleType === 'add') {
        const returnState = await props.getAllData({dataId: masterDataOld.id });
        dispatchModifyState({ ...returnState, enabled: false });
      } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
        const {dispatch, commonModel, tabId, masterData} = props;
        const url: string = `${application.urlCommon}/verify/removeModifying`;
        const params = {id: masterData.id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnState = await props.getAllData({dataId: masterDataOld.id });
          dispatchModifyState({ ...returnState, enabled: false });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
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
        const returnRoute: any = await props.getDataOne({isWait: true});
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

  const onTreeSelect = (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState } = props;
    if (commonUtils.isNotEmptyArr(selectedKeys)) {
      dispatchModifyState({treeSelectedKeys: selectedKeys, treeSelectNode: e.node});
      const indexStart = formulaRef.current.resizableTextArea.textArea.selectionStart;
      const indexEnd = formulaRef.current.resizableTextArea.textArea.selectionEnd;
      formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart, indexEnd);
    }
  }

  const onTreeDoubleClick = (e) => {
    const { dispatchModifyState, treeSelectNode, masterData: masterDataOld } = props;
    const indexStart = formulaRef.current.resizableTextArea.textArea.selectionStart;
    const indexEnd = formulaRef.current.resizableTextArea.textArea.selectionEnd;
    if (treeSelectNode.children !== undefined) {
      formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart, indexEnd);
    } else {
      const formulaOld = commonUtils.isEmpty(formulaRef.current.resizableTextArea.textArea.value) ? '' : formulaRef.current.resizableTextArea.textArea.value;
      const strStart = commonUtils.isEmpty(formulaOld.substring(0, indexStart)) ? '' : formulaOld.substring(0, indexStart);
      const strEnd = commonUtils.isEmpty(formulaOld.substring(indexEnd, formulaOld.length)) ? '' : formulaOld.substring(indexEnd, formulaOld.length);
      const formula = strStart + treeSelectNode.title + strEnd;
      const masterData = {...masterDataOld, formula};
      form.setFieldsValue({...masterData});
      dispatchModifyState({masterData});
      setTimeout(() => {
        formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart + treeSelectNode.title.length, indexStart + treeSelectNode.title.length);
      }, 200);
    }
  }



  const { enabled, masterContainer, masterData: masterDataOld, treeData, treeSelectedKeys } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const buttonGroup = { onClick, enabled };
  const index = commonUtils.isEmptyObj(masterContainer) ? -1 : masterContainer.slaveData.findIndex(item => item.fieldName === 'formula');
  const inputParams = {
    name: 'master',
    text: true,
    config: index > -1 ? masterContainer.slaveData[index] : {},
    property: {value: masterData.formula, disabled: !enabled, ref: formulaRef },
    record: masterData,
    event: {onChange: props.onInputChange}
  };

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, height: 500 },
    event: { onDoubleClick: onTreeDoubleClick, onSelect: onTreeSelect },
  };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} onSelectChange={onSelectChange} />)}, [masterContainer, masterData, enabled]);
  const tree = useMemo(()=>{ return (
    <TreeComponent {...treeParam} />)}, [treeData, treeSelectedKeys]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          <InputComponent {...inputParams}  />;
        </Col>

        <Col>
          {tree}
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonBasic(Formula)));