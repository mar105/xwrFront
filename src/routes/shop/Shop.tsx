import {connect} from "react-redux";
import * as commonUtils from "../../utils/commonUtils";
import commonBase from "../../common/commonBase";
import React, {useMemo} from "react";
import {ButtonGroup} from "../ButtonGroup";
import {Form} from "antd";
import commonMasterEvent from "../../common/commonMasterEvent";
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
      dispatch({
        type: 'commonModel/saveUserInfo',
        payload: userInfo,
      });
    }
  }

  const { enabled, masterContainer, masterData } = props;
  const buttonGroup = { onClick: props.onButtonClick, enabled };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form name="shop" form={form} onFinish={onFinish}>
      {component}
      <ButtonGroup {...buttonGroup} />
    </Form>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonMasterEvent(Shop)));