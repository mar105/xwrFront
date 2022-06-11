import {connect} from "react-redux";
import React from "react";
import {Form} from "antd";
import {InputComponent} from "../../components/InputComponent";
import {ButtonComponent} from "../../components/ButtonComponent";
import * as application from "../../application";
import * as request from "../../utils/request";

const ShopInvitation = (props) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const { dispatch } = props;
    const url = application.urlPrefix + '/shop/shopInvitation';
    const interfaceReturn = (await request.postRequest(url, props.commonModel.token, application.paramInit(values))).data;
    if (interfaceReturn.code === 1) {
      props.gotoSuccess(dispatch, interfaceReturn);
      setTimeout(() => {
        dispatch({
          type: 'commonModel/gotoNewPage',
          payload: { newPage: '/login' },
        });
      }, 500);
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onButtonClick = () => {
    props.onInvitationClose();
  };

  const invitation = {
    config: { fieldName: 'invitation', isRequired: true },
    property: { placeholder: '请输入你的邀请码' },
  };
  const confirmButton = {
    caption: '确定',
    property: { htmlType: 'submit' },
  };
  const cancelButton = {
    caption: '取消',
    event: { onClick: onButtonClick }
  };
  return (
    <Form name="shop" form={form} onFinish={onFinish}>
      <InputComponent {...invitation} />
      <ButtonComponent {...confirmButton} />
      <ButtonComponent {...cancelButton} />
    </Form>

  );
}

export default connect()(ShopInvitation);