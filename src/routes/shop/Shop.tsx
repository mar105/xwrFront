import {connect} from "react-redux";
import * as commonUtils from "../../utils/commonUtils";
import commonBase from "../../common/commonBase";
import React, {useEffect, useMemo} from "react";
import {ButtonGroup} from "../../common/ButtonGroup";
import {Form, Modal, Progress} from "antd";
import commonDocEvent from "../../common/commonDocEvent";
import {CommonExhibit} from "../../common/CommonExhibit";
import * as application from "../../application";
import * as request from "../../utils/request";
import { QuestionCircleOutlined } from '@ant-design/icons';

const Shop = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

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

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
      && props.commonModel.stompClient.connected) {
      const progress = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/progress' + commonModel.userInfo.userId, progressResult);
      return () => {
        progress.unsubscribe();
      };
    }

  }, [props.commonModel.stompClient]);

  const progressResult = (data) => {
    const { dispatchModifyState } = props;
    const returnBody = data.body;
    dispatchModifyState({ progressPercent: returnBody });
  }

  const onFinish = async (values: any) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const returnState = await props.onFinish(values, true);
    if (commonUtils.isNotEmptyObj(returnState)) {
      dispatchModifyState({...returnState});
      const { userInfo } = commonModel;
      userInfo.groupId = returnState.masterData.superiorId;
      userInfo.groupName = returnState.masterData.superiorName;
      userInfo.shopId = returnState.masterData.id;
      userInfo.shopName = returnState.masterData.shopName;
      userInfo.isManage = returnState.masterData.isManage;
      userInfo.shopInfo = returnState.masterData;
      dispatch({
        type: 'commonModel/saveUserInfo',
        payload: userInfo,
      });
    }
  }

  const onButtonClick = async (key, config, e) => {
    const {commonModel} = props;
    if (key === 'invitationButton') {
      const params: any = {id: props.masterData.id, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId};
      const url: string = application.urlPrefix + '/shop/getInvitation' + commonUtils.paramGet(params);
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        Modal.info({
          content: interfaceReturn.data
        });
      } else {
        props.gotoError(props.dispatch, interfaceReturn);
      }

    } else if (key === 'initBusinessButton') {
      let index = commonModel.commonConstant.findIndex(item => item.constantName === 'confirmVar');
      const confirmVar = index > -1 ? commonModel.commonConstant[index].viewName : '确定#var#吗？';
      Modal.confirm({
        icon: <QuestionCircleOutlined/>,
        content: confirmVar.replace('#var#', config.viewName),
        onOk: () => {
          initData(key);
        }
      });
    } else if (key === 'initAllButton') {
      let index = commonModel.commonConstant.findIndex(item => item.constantName === 'confirmVar');
      const confirmVar = index > -1 ? commonModel.commonConstant[index].viewName : '确定#var#吗？';
      Modal.confirm({
        icon: <QuestionCircleOutlined/>,
        content: confirmVar.replace('#var#', config.viewName),
        onOk: () => {
          initData(key);
        }
      });
    } else {
      props.onButtonClick(key, config, e);
    }
  };

  const initData = async (key) => {
    const {dispatch, dispatchModifyState, commonModel} = props;
    if (key === 'initBusinessButton') {
      dispatchModifyState({progressIsVisible: true});
      const url: string = application.urlPrefix + '/clearData/clearBusinessData';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId
      }))).data;
      if (interfaceReturn.code === 1) {
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
      dispatchModifyState({progressIsVisible: false, progressPercent: 0});
    } else if (key === 'initAllButton') {
      const url: string = application.urlPrefix + '/clearData/clearAllData';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId }))).data;
      if (interfaceReturn.code === 1) {
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }
  };

  const buttonAddGroup: any = props.getButtonGroup();
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'firstButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'priorButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'nextButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'lastButton'), 1);
  buttonAddGroup.push({ key: 'invitationButton', caption: '生成邀请码', htmlType: 'button', sortNum: 3000, disabled: props.enabled });
  buttonAddGroup.push({ key: 'initBusinessButton', caption: '初始化业务数据', htmlType: 'button', sortNum: 3001, disabled: props.enabled });
  buttonAddGroup.push({ key: 'initAllButton', caption: '初始化所有数据', htmlType: 'button', sortNum: 3002, disabled: props.enabled });

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: buttonAddGroup };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <div>
      <Form name="shop" form={form} onFinish={onFinish}>
        {component}
        <ButtonGroup {...buttonGroup} onClick={onButtonClick} />
      </Form>
      <Modal width={800} visible={props.progressIsVisible} closable={false} mask={false} footer={null}>
        <Progress type="circle" percent={props.progressPercent} />
      </Modal>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Shop)));