import { connect } from 'dva';
import React, {useEffect, useMemo, useRef} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../../../common/ButtonGroup";
import commonDocEvent from "../../../common/commonDocEvent";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {InputComponent} from "../../../components/InputComponent";
import {TreeComponent} from "../../../components/TreeComponent";
import {componentType} from "../../../utils/commonTypes";
import {ButtonComponent} from "../../../components/ButtonComponent";

const Formula = (props) => {
  const formulaRef = React.useRef<any>(null);
  const formulaParamRef: any = useRef();
  const [form] = Form.useForm();
  props.onSetForm(form);
  // const layout = {
  //   labelCol: { span: 8 },
  //   wrapperCol: { span: 16 },
  // };

  useEffect(() => {
    formulaParamRef.current = props.formulaParam;
  }, [props.formulaParam]);

  useEffect(() => {
    const fetchData = async () => {
      const { dispatchModifyState } = props;
      const index = props.containerData[0].slaveData.findIndex(item => item.fieldName === 'treeSql');
      if (index > -1) {
        const returnState: any = await props.getSelectList({containerSlaveId: props.containerData[0].slaveData[index].id, isWait: true, config: props.containerData[0].slaveData[index] });
        dispatchModifyState({ formulaParam: returnState.list });
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        onButtonClick('addButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterData) && formulaParamRef.current) {
      const treeData = getTreeData(props.masterData.formulaType);
      props.dispatchModifyState({treeData });
    }
  }, [props.masterData]);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
      && props.commonModel.stompClient.connected) {
      const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturnResult);
      return () => {
        saveDataReturn.unsubscribe();
      };
    }

  }, [props.commonModel.stompClient]);

  const saveDataReturnResult = async (data) => {
    const returnBody = JSON.parse(data.body);
    if (returnBody.code === 1) {
      props.commonModel.stompClient.send('/websocket/syncRefreshData', {}, JSON.stringify({ userName: props.commonModel.userInfo.userName, type: 'formula'}));
    }
  }

  const getTreeData = (formulaType) => {
    const { masterContainer } = props;
    const treeData: any = [];
    const formulaParam: any = [];
    // formulaParamRef.current 为何用这个？原因： 上面useEffect用了之后形成闭包，取不到props.formulaParam;
    // onClick('addButton', null)这个上面可以加入props.formulaParam,为了不影响渲染速度，可以异步执行。
    formulaParam.push(...formulaParamRef.current.filter(item => item.paramCategory === formulaType));
    let index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaParam');  // 公式参数
    let config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: formulaParam});

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'serialCodeParam'); // 流水号参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    const serialCodeParam: any = {title: config.viewName, key: config.id, children: []};

    // 年，月、日、流水号
    masterContainer.slaveData.filter(item => item.viewName.indexOf('[') > -1 && item.viewName.indexOf(']') > -1).forEach(config => {
      serialCodeParam.children.push({title: config.viewName, key: config.id});
    });
    treeData.push(serialCodeParam);

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'systemParam'); // 系统参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: []});

    index = masterContainer.slaveData.findIndex(item => item.fieldName === 'methodParam'); //函数参数
    config = index > -1 ? masterContainer.slaveData[index] : {};
    treeData.push({title: config.viewName, key: config.id, children: []});
    return treeData;
  };

  // const onDataChange = (params) => {
  //   const { fieldName, value } = params;
  //   if (fieldName === 'formulaType') {
  //     const { dispatchModifyState } = props;
  //     let returnData = props.onDataChange({...params, isWait: true});
  //     const treeData = getTreeData(value);
  //     dispatchModifyState({treeData, ...returnData});
  //   } else {
  //     props.onDataChange(params);
  //   }
  //
  // }

  const onFinish = async (values: any) => {
    if (verifyFormula() === 1) {
      if (await props.onFinish(values)) {
        props.commonModel.stompClient.send('/websocket/syncRefreshData', {}, JSON.stringify({ userName: props.commonModel.userInfo.userName, type: 'formula'}));
      }
    }
  }

  const onButtonClick = async (key, config, e) => {
    if (key === 'verifyButton') {
      verifyFormula();
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const verifyFormula = () => {
    const { dispatch, masterData } = props;
    if (masterData.formulaType !== 'serialCode') {
      let formula = masterData.formula;
      if (commonUtils.isNotEmptyArr(treeData)) {  //流水号公式不校验
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
        props.gotoSuccess(dispatch, {code: '1', msg: commonUtils.getViewName(masterContainer, 'verifySuccess')}); // 验证成功！
        return 1;
      }
      catch (e) {
        props.gotoError(dispatch, {
          code: '1',
          msg: commonUtils.getViewName(masterContainer, 'verifyError') + e.message
        });
      }
    } else {
      return 1;
    }
  }


  const onClick = async (key, e) => {
    const { dispatchModifyState, masterContainer, masterData: masterDataOld } = props;
    if (key === 'ACButton') {
      form.setFieldsValue(commonUtils.setFieldsValue({ formula: ''}, masterContainer));
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
    const { dispatchModifyState, masterContainer, masterData: masterDataOld } = props;
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
      form.setFieldsValue(commonUtils.setFieldsValue({ formula }, masterContainer));
      dispatchModifyState({masterData});
      setTimeout(() => {
        formulaRef.current.resizableTextArea.textArea.setSelectionRange(indexStart + text.length, indexStart + text.length);
      }, 200);
    }
  }

  const { enabled, masterContainer, masterData: masterDataOld, treeData, treeSelectedKeys, commonModel } = props;
  const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
  const buttonAddGroup: any = props.getButtonGroup();
  buttonAddGroup.push({ key: 'verifyButton', caption: '验证', htmlType: 'button', onClick: onButtonClick, sortNum: 100, disabled: !props.enabled });
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: buttonAddGroup };
  const index = commonUtils.isEmptyObj(masterContainer) ? -1 : masterContainer.slaveData.findIndex(item => item.fieldName === 'formula');
  const inputParams = {
    name: 'master',
    text: true,
    config: index > -1 ? masterContainer.slaveData[index] : {},
    property: {value: masterData.formula, disabled: !enabled, ref: formulaRef },
    record: masterData,
    event: {onChange: props.onDataChange}
  };

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, height: 500 },
    event: { onDoubleClick: onTreeDoubleClick, onSelect: onTreeSelect },
  };
  const component = useMemo(()=>{
    return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  const tree = useMemo(()=>{ return (
    <TreeComponent {...treeParam} />)}, [treeData, treeSelectedKeys]);
  const paramButton = useMemo(()=>{
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'ACButton', caption: 'AC', htmlType: 'button', sortNum: 10, onClick, disabled: !enabled });
    buttonGroup.push({ key: '+/-Button', caption: '+/-', htmlType: 'button', sortNum: 20, onClick, disabled: !enabled });
    buttonGroup.push({ key: '%Button', caption: '%', htmlType: 'button', sortNum: 30, onClick, disabled: !enabled });
    buttonGroup.push({ key: '/Button', caption: '/', htmlType: 'button', sortNum: 40, onClick, disabled: !enabled });

    buttonGroup.push({ key: '7Button', caption: '7', htmlType: 'button', sortNum: 10, onClick, disabled: !enabled });
    buttonGroup.push({ key: '8Button', caption: '8', htmlType: 'button', sortNum: 20, onClick, disabled: !enabled });
    buttonGroup.push({ key: '9Button', caption: '9', htmlType: 'button', sortNum: 30, onClick, disabled: !enabled });
    buttonGroup.push({ key: '*Button', caption: '*', htmlType: 'button', sortNum: 40, onClick, disabled: !enabled });

    buttonGroup.push({ key: '4Button', caption: '4', htmlType: 'button', sortNum: 50, onClick, disabled: !enabled });
    buttonGroup.push({ key: '5Button', caption: '5', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '6Button', caption: '6', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '-Button', caption: '-', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

    buttonGroup.push({ key: '1Button', caption: '1', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '2Button', caption: '2', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '3Button', caption: '3', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '+Button', caption: '+', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

    buttonGroup.push({ key: '0Button', caption: '0', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '00Button', caption: '00', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '.Button', caption: '.', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '=Button', caption: '=', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

    buttonGroup.push({ key: '>Button', caption: '>', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '>=Button', caption: '>=', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '<Button', caption: '<', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '<=Button', caption: '<=', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

    buttonGroup.push({ key: '!=Button', caption: '!=', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: '(Button', caption: '(', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    buttonGroup.push({ key: ')Button', caption: ')', htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

    if (commonUtils.isNotEmptyObj(masterContainer)) {
    let index = masterContainer.slaveData.findIndex(item => item.fieldName === 'if'); // 如果
    let config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: 'ifButton', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '{'); // 那么
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '{Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === 'else'); // 否则
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: 'elseButton', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === 'else'); // 那么
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '}Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '&&'); // 并且
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '&&Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });

      index = masterContainer.slaveData.findIndex(item => item.fieldName === '||'); // 或者
      config = index > -1 ? masterContainer.slaveData[index] : {};
      buttonGroup.push({ key: '||Button', caption: config.viewName, htmlType: 'button', sortNum: 60, onClick, disabled: !enabled });
    }
    const buttonGroupNew = buttonGroup.map(item => {
      const button = {
        caption: item.caption,
        property: { name: item.key, htmlType: item.htmlType, disabled: item.disabled, type: 'default' },
        event: { onClick: commonUtils.isEmpty(item.onClick) ? undefined : item.onClick.bind(this, item.key) },
        componentType: componentType.Soruce,
      };
      return <Col span={6} className="xwr-cal-btn-item"><ButtonComponent {...button} /></Col>;
    });

    return buttonGroupNew}, [masterContainer, masterData, enabled]);
  return (
    <Form  name="basic" form={form} onFinish={onFinish} className="xwr-form-container">
      <Row gutter={[16, 16]} justify="start" style={{width:'100%'}}>
          {component}
      </Row>
      <Row style={{width: '100%' }} >
        <Col  span={24}>
          <InputComponent labeCol={2} {...inputParams}  />;
          
        </Col>
        <Col span={8}>
          {tree}
        </Col>
        <Col span={8}>
          <Row>
            {paramButton}
          </Row>
        </Col>
      </Row>
      <div className='btn-box'>
        <ButtonGroup {...buttonGroup} />
      </div>
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Formula)));