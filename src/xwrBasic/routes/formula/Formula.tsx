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
import {componentType} from "../../../utils/commonTypes";
import {ButtonComponent} from "../../../components/ButtonComponent";

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
    masterContainer.slaveData.filter(item => item.viewName.indexOf('[') > -1 && item.viewName.indexOf(']') > -1).forEach(config => {
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
    if (verifyFormula() === 1) {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
      const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
      const url: string = `${application.urlMain}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        dispatchModifyState({...returnState});
        props.gotoSuccess(dispatch, interfaceReturn);
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
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
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isNotEmptyArr(masterDataOld.children)) {
        props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
        return;
      }
      const params = { ...masterDataOld };
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
    } else if (key === 'verifyButton') {
      verifyFormula();
    }
  }

  const verifyFormula = () => {
    const { dispatch, masterData } = props;
    let formula = masterData.formula;
    if (commonUtils.isNotEmptyArr(treeData)) {
      treeData.forEach(tree => {
        if (commonUtils.isNotEmptyArr(tree.children)) {
          tree.children.forEach(item => {
            formula = formula.replace(item.title, 0);
          });
        }
      });
    }
    try {
      eval('var result = 0; ' + formula);
      props.gotoSuccess(dispatch, { code: '1', msg: commonUtils.getViewName(masterContainer,'verifySuccess')}); // 验证成功！
      return 1;
    }
    catch (e) {
      props.gotoError(dispatch, { code: '1', msg: commonUtils.getViewName(masterContainer,'verifyError') + e.message});
    }
  }


  const onDoubleClick = async (key, e) => {
    const { dispatchModifyState, masterData: masterDataOld } = props;
    if (key === 'ACButton') {
      form.setFieldsValue(commonUtils.setFieldsValue({ formula: ''}));
      dispatchModifyState({ masterData: {...masterDataOld, formula: ''} });
      formulaOperation('', true);
    } else {
      formulaOperation(key.replace('Button', ''), false);
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
    const { treeSelectNode, enabled } = props;
    if (enabled) {
      formulaOperation(treeSelectNode.title, treeSelectNode.children !== undefined);
    }
  }

  const formulaOperation = (text, isSelection) => {
    const { dispatchModifyState, masterData: masterDataOld } = props;
    const indexStart = formulaRef.current.resizableTextArea.textArea.selectionStart;
    const indexEnd = formulaRef.current.resizableTextArea.textArea.selectionEnd;
    if (isSelection) {
      formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart, indexEnd);
    } else {
      const formulaOld = commonUtils.isEmpty(formulaRef.current.resizableTextArea.textArea.value) ? '' : formulaRef.current.resizableTextArea.textArea.value;
      const strStart = commonUtils.isEmpty(formulaOld.substring(0, indexStart)) ? '' : formulaOld.substring(0, indexStart);
      const strEnd = commonUtils.isEmpty(formulaOld.substring(indexEnd, formulaOld.length)) ? '' : formulaOld.substring(indexEnd, formulaOld.length);
      const formula = strStart + text + strEnd;
      const masterData = {...masterDataOld, formula};
      form.setFieldsValue(commonUtils.setFieldsValue({ formula }));
      dispatchModifyState({masterData});
      setTimeout(() => {
        formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart + text.length, indexStart + text.length);
      }, 200);
    }
  }

  const { enabled, masterContainer, masterData: masterDataOld, treeData, treeSelectedKeys } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const buttonAddGroup: any = [];
  buttonAddGroup.push({ key: 'verifyButton', caption: '验证', htmlType: 'button', onClick, sortNum: 100, disabled: !props.enabled });
  const buttonGroup = { onClick, enabled, buttonGroup: buttonAddGroup };
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
  const paramButton = useMemo(()=>{
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'ACButton', caption: 'AC', htmlType: 'button', sortNum: 10, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '+/-Button', caption: '+/-', htmlType: 'button', sortNum: 20, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '%Button', caption: '%', htmlType: 'button', sortNum: 30, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '/Button', caption: '/', htmlType: 'button', sortNum: 40, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '7Button', caption: '7', htmlType: 'button', sortNum: 10, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '8Button', caption: '8', htmlType: 'button', sortNum: 20, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '9Button', caption: '9', htmlType: 'button', sortNum: 30, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '*Button', caption: '*', htmlType: 'button', sortNum: 40, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '4Button', caption: '4', htmlType: 'button', sortNum: 50, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '5Button', caption: '5', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '6Button', caption: '6', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '-Button', caption: '-', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '1Button', caption: '1', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '2Button', caption: '2', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '3Button', caption: '3', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '+Button', caption: '+', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '0Button', caption: '0', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '00Button', caption: '00', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '.Button', caption: '.', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '=Button', caption: '=', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '>Button', caption: '>', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '>=Button', caption: '>=', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '<Button', caption: '<', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '<=Button', caption: '<=', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

    buttonGroup.push({ key: '!=Button', caption: '!=', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: '(Button', caption: '(', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    buttonGroup.push({ key: ')Button', caption: ')', htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

    if (commonUtils.isNotEmptyObj(masterContainer)) {
    let index = masterContainer.slaveData.findIndex(item => item.fieldName === 'if'); // 如果
    let config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: 'ifButton', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '{'); // 那么
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '{Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === 'else'); // 否则
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: 'elseButton', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === 'else'); // 那么
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '}Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '&&'); // 并且
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '&&Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '||'); // 或者
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '||Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onDoubleClick, disabled: !enabled });
    }
    const buttonGroupNew = buttonGroup.map(item => {
      const button = {
        caption: item.caption,
        property: { name: item.key, htmlType: item.htmlType, disabled: item.disabled },
        event: { onDoubleClick: commonUtils.isEmpty(item.onDoubleClick) ? undefined : item.onDoubleClick.bind(this, item.key) },
        componentType: componentType.Soruce,
      };
      return <Col span={6}><ButtonComponent {...button} /></Col>;
    });

    return buttonGroupNew}, [masterContainer, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <Row>
        <Col>
          <InputComponent {...inputParams}  />;
        </Col>

        <Col>
          {tree}
        </Col>

        <Col>
          {paramButton}
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonBasic(Formula)));