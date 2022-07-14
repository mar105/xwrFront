import { connect } from 'dva';
import React, {useEffect, useMemo, useRef} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "../../common/ButtonGroup";
import commonDocEvent from "../../common/commonDocEvent";
import { CommonExhibit } from "../../common/CommonExhibit";
import CommonModal from "../../common/commonModal";
import {SelectComponent} from "../../components/SelectComponent";
import {ButtonComponent} from "../../components/ButtonComponent";
import {InputComponent} from "../../components/InputComponent";
import * as application from "../../application";
import * as request from "../../utils/request";
import {replacePath, routeInfo} from "../../routeInfo";

const ExamineFlow = (props) => {
  const propsRef: any = useRef();
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    propsRef.current = props;
  }, [props]);


  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        const childParams = {};
        if (props.copyToData) {
          const masterData = {...commonUtils.getAssignFieldValue('master', props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
          childParams['masterData'] = masterData;
          for(const config of props.copyToData.config.children) {
            const fieldNameSplit = config.fieldName.split('.');
            const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
            if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
              const copyData: any = [];
              for(const data of props.copyToData[dataSetName + 'Data']) {
                copyData.push({...commonUtils.getAssignFieldValue(dataSetName, config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
              }
              childParams[dataSetName + 'Data'] = copyData;
              childParams[dataSetName + 'ModifyData'] = [];
              childParams[dataSetName + 'DelData'] = [];
            }
          }
        }
        props.onButtonClick('addButton', null, null, childParams);
      }
      else if (props.handleType === 'modify') {
        props.onButtonClick('modifyButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);

  const onModalOk = async (params: any, isWait) => {
    if (commonUtils.isEmpty(params)) {
      props.dispatchModifyState({ modalVisible: false });
      return;
    }
    const { commonModel, dispatch, tabId, masterData }: any = propsRef.current;

    if (params.type === 'examineFlow' && commonUtils.isNotEmptyArr(params.levelData)) {
      // 审核流程

      for(const level of params.levelData) {
        const formulaData = params.slaveData.filter(item => item.examineLevelId === level.id);
        let msgContent = '';
        for(const formula of formulaData) {
          msgContent += formula.dataRow + ' ' + formula.formulaName + '\n';
        }
        // 743388356183851008 消息 路由Id
        const masterMsgData = { ...props.onAdd(), billRouteId: masterData.billRouteId, routeId: '743388356183851008', billId: masterData.billId, billSerialCode: masterData.billSerialCode,
          examineLevelId: level.id, examineLevel: level.examineLevel,
          msgType: 'examineFlow', msgTitle: masterData.msgTitle, msgContent };

        const slaveData: any = [];

        level.userSelectedKeys.forEach((userId, index) => {
          slaveData.push({...props.onAdd(), routeId: '743388356183851008', superiorId: masterMsgData.id, userId, sortNum: index });
        });

        const saveData: any = [];
        saveData.push(commonUtils.mergeData('master', [masterMsgData], [], []));
        saveData.push(commonUtils.mergeData('slave', slaveData, [], []));
        const msgParams = { id: masterMsgData.id, tabId, routeId: '743388356183851008', groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId, saveData, handleType: 'add' };
        const url: string = application.urlPrefix + '/msg/saveAndSendMsg';
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(msgParams))).data;
        if (interfaceReturn.code === 1) {
          props.gotoSuccess(dispatch, interfaceReturn);
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }

      props.dispatchModifyState({ modalVisible: false });
    } else {
      props.onModalOk(params);
    }
  }

  const onButtonClick = async (key, config, e) => {
    const { dispatch, tabId, dispatchModifyState } = props;
    const { masterData } = propsRef.current;
    if (key === 'replyButton') {
      dispatchModifyState( { modalReplyPane, modalReplyTitle: config.viewName, modalReplyVisible: true } );
    } else if (key === 'confirmButton') {
      //消息回复
      const masterMsgData = { ...props.onAdd(), billRouteId: masterData.billRouteId, routeId: '744620290109079552', billId: masterData.billId, billSerialCode: masterData.billSerialCode,
        examineLevelId: masterData.examineLevelId, examineLevel: masterData.examineLevel,
        msgId: masterData.id, replyResult: masterData.replyResult, replyContent: masterData.replyContent };
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [masterMsgData], [], []));
      const msgParams = { id: masterMsgData.id, tabId, routeId: '744620290109079552', groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, sendUserId: masterData.createUserId, handleType: 'add' };
      const url: string = application.urlPrefix + '/msg/saveAndReplyMsg';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(msgParams))).data;
      if (interfaceReturn.code === 1) {
        props.gotoSuccess(dispatch, interfaceReturn);
      } else if (interfaceReturn.code === 6000) {
        const examineCondition = JSON.parse(interfaceReturn.msg);

        // 审核条件
        const url: string = application.urlPrefix + '/personal/getRouteContainer?id=743048326546456576&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&downloadPrefix=' + application.urlUpload + '/downloadFile';
        const interfaceContainer = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceContainer.code === 1) {
          const state = { routeId: '743048326546456576', ...interfaceContainer.data, handleType: undefined, isModal: true, ...examineCondition, modalParams: {}, dataId: undefined };
          const path = replacePath(state.routeData.routeName);
          const route: any = commonUtils.getRouteComponent(routeInfo, path);
          dispatchModifyState({ modalReplyVisible: false, modalVisible: true, modalTitle: state.routeData.viewName, modalPane: commonUtils.panesComponent({key: commonUtils.newId()}, route, null, onModalOk, null, state).component });
        } else {
          props.gotoError(dispatch, interfaceContainer);
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
      dispatchModifyState( { modalReplyVisible: false } );
    } else if (key === 'cancelButton') {
      dispatchModifyState( { modalReplyVisible: false } );
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const modalReplyPane = useMemo(()=>{
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      const { masterData: masterDataOld } = props;
      const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
      const replyIndex = props.masterContainer.slaveData.findIndex(item => item.fieldName === 'replyResult');
      const replyContentIndex = props.masterContainer.slaveData.findIndex(item => item.fieldName === 'replyContent');
      if (replyIndex > -1 && replyContentIndex > -1) {
        const replyParams = {
          name: 'master',
          config: props.masterContainer.slaveData[replyIndex],
          property: {value: masterData.replyResult},
          record: masterData,
          event: {onChange: props.onDataChange, getSelectList: props.getSelectList}
        };
        const replyContentParams = {
          name: 'master',
          config: props.masterContainer.slaveData[replyContentIndex],
          property: {value: masterData.replyResult},
          record: masterData,
          event: {onChange: props.onDataChange, getSelectList: props.getSelectList}
        };
        const confirmButton = {
          caption: '确定',
          event: {onClick: onButtonClick.bind(this, 'confirmButton')}
        };
        const cancelButton = {
          caption: '取消',
          event: {onClick: onButtonClick.bind(this, 'cancelButton')}
        };
        return <div>
          <SelectComponent {...replyParams}/>
          <InputComponent {...replyContentParams}/>
          <ButtonComponent {...confirmButton} />
          <ButtonComponent {...cancelButton} />
        </div>;
      }
    }
  }, [props.masterContainer.dataSetName, props.masterData ]);


  const getButtonGroup = () => {
    const { masterData: masterDataOld } = props;
    const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
    buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 20, disabled: props.enabled || masterData.isInvalid || masterData.isSend });
    buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 30, disabled: !props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 40, disabled: !props.enabled });
    buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 50, disabled: props.enabled || masterData.isReply });
    buttonGroup.push({ key: 'replyButton', caption: '回复', htmlType: 'button', sortNum: 60, disabled: props.enabled || masterData.isReply });
    return buttonGroup;
  }

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: getButtonGroup() };

  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={props.onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
      <CommonModal modalVisible={props.modalReplyVisible} modalTitle={props.modalReplyTitle} onModalCancel={props.onModalCancel} modalPane={props.modalReplyPane} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(ExamineFlow)));