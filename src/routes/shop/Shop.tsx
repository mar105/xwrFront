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
  const { enabled, masterContainer, masterData } = props;
  const buttonGroup = { onClick: props.onButtonClick, enabled };
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form name="shop" form={form} onFinish={props.onFinish}>
      {component}
      <ButtonGroup {...buttonGroup} />
    </Form>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonMasterEvent(Shop)));