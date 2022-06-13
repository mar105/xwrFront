import {connect} from "react-redux";
import * as commonUtils from "../../utils/commonUtils";
import commonBase from "../../common/commonBase";
import React, {useEffect, useMemo} from "react";
import {ButtonGroup} from "../../common/ButtonGroup";
import {Form, Modal} from "antd";
import commonDocEvent from "../../common/commonDocEvent";
import {CommonExhibit} from "../../common/CommonExhibit";
import * as application from "../../application";
import * as request from "../../utils/request";

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

    } else {
      props.onButtonClick(key, config, e);
    }
  };

  const buttonAddGroup: any = props.getButtonGroup();
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'firstButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'priorButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'nextButton'), 1);
  buttonAddGroup.splice(buttonAddGroup.findIndex(item => item.key === 'lastButton'), 1);
  buttonAddGroup.push({ key: 'invitationButton', caption: '生成邀请码', htmlType: 'button', sortNum: 3000, disabled: props.enabled });

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: buttonAddGroup };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form name="shop" form={form} onFinish={onFinish}>
      {component}
      <ButtonGroup {...buttonGroup} onClick={onButtonClick} />
    </Form>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Shop)));