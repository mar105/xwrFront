import {connect} from "react-redux";
import * as commonUtils from "../../utils/commonUtils";
import commonBase from "../../common/commonBase";
import React, {useMemo} from "react";
import {ButtonGroup} from "../../common/ButtonGroup";
import {Form} from "antd";
import commonDocEvent from "../../common/commonDocEvent";
import {CommonExhibit} from "../../common/CommonExhibit";

const Shop = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
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
      userInfo.userShopInfo = returnState.masterData;
      dispatch({
        type: 'commonModel/saveUserInfo',
        payload: userInfo,
      });
    }
  }

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
    buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 20, disabled: props.enabled });
    buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 30, disabled: !props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 40, disabled: !props.enabled });
    buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 50, disabled: props.enabled });
    buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 100, disabled: props.enabled });
    return buttonGroup;
  }

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, buttonGroup: getButtonGroup() };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form name="shop" form={form} onFinish={onFinish}>
      {component}
      <ButtonGroup {...buttonGroup} />
    </Form>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Shop)));