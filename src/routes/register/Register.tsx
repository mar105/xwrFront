import React from 'react';
import {Form, Row, Col, Slider} from 'antd';
import { connect } from 'dva';
import { InputComponent } from "../../components/InputComponent";
import {ButtonComponent} from "../../components/ButtonComponent";
import * as request from "../../utils/request";
import * as application from '../../application';
import * as commonUtils from "../../utils/commonUtils";
import commonBase from "../../utils/commonBase";
import {Md5} from "ts-md5";

const FormItem = Form.Item;

const  Register = (props) => {
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    const { dispatch } = props;
    const url = `${application.urlPrefix}/login/registerUser`;
    values.userPwd = Md5.hashAsciiStr(Md5.hashAsciiStr(values.userPwd).toString());
    values.userPwdTwo = Md5.hashAsciiStr(Md5.hashAsciiStr(values.userPwdTwo).toString());
    values.authorize = 'web';
    const interfaceReturn = (await request.postRequest(url, '', application.paramInit(values))).data;
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
  };

  const handleSendCaptcha = async (e) => {
    const { dispatch, sliderValue } = props;
    const userMobile = form.getFieldValue('userMobile');
    if (commonUtils.isEmpty(userMobile)) {
      props.gotoError(dispatch, { code: '6002', msg: '手机号不能为空！' });
      return;
    } else if (sliderValue !== 100) {
      props.gotoError(dispatch, { code: '6003', msg: '请拖动滑块验证码！' });
      return;
    }

    const url = `${application.urlPrefix}/sendMessage/registerCaptcha`;
    const params = {
      userMobile: form.getFieldValue('userMobile'),
    };
    const interfaceReturn = await request.postRequest(url, '', application.paramInit(params)).data;
    if (interfaceReturn.code === 1) {
      props.gotoSuccess(dispatch, interfaceReturn);
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  };

  const handleSliderChange = (value) => {
    const { dispatchModifyState } = props;
    if (value === 100) {
      dispatchModifyState({ sliderValue: value, sliderDisabled: true });
    } else {
      dispatchModifyState({ sliderValue: value });
    }
  }

  const { sliderValue, sliderDisabled } = props;
  const userName = {
    name: 'master',
    form,
    fieldName: 'userName',
    rules: [{ required: true, message: '请输入你的用户名' }],
    property: { placeholder: '请输入你的用户名' },
  };
  const userPwd = {
    name: 'master',
    form,
    fieldName: 'userPwd',
    rules: [{ required: true, pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[a-zA-Z\d]{6,16}$/, message: '密码需要包含数字和英文字母（6位-16位）' }],
    property: { type: 'password', placeholder: '请输入你的密码' },
  };
  const userPwdTwo = {
    name: 'master',
    form,
    fieldName: 'userPwdTwo',
    rules: [{ required: true, pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[a-zA-Z\d]{6,16}$/, message: '密码需要包含数字和英文字母（6位-16位）' }],
    property: { type: 'password', placeholder: '请再次输入你的密码' },
  };
  const userMobile = {
    name: 'master',
    form,
    fieldName: 'userMobile',
    rules: [{ required: true, pattern: /^(((13[0-9])|(14[5-7])|(15[0-9])|(17[0-9])|(18[0-9])|(19[0-9]))+\d{8})$/, message: '请输入正确的手机号' }],
    property: { placeholder: '请输入你的手机号码' },
  };
  const sendCaptchaButton = {
    componentType: 'Soruce',
    caption: '发送',
    property: { onClick: handleSendCaptcha },
  };
  const userCaptcha = {
    name: 'master',
    form,
    fieldName: 'userCaptcha',
    rules: [{ required: true, message: '请输入你的验证码' }],
    property: { placeholder: '请输入你的验证码' },
  };
  const loginButton = {
    caption: '注册',
    property: { htmlType: 'submit' },
  };

  return (
      <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
        <InputComponent {...userName} />
        <InputComponent {...userPwd} />
        <InputComponent {...userPwdTwo} />
        <FormItem>
          <Row>
            <Col><InputComponent {...userMobile} /></Col>
            <Col style={{width:300}}><Slider value={sliderValue} disabled={sliderDisabled} onChange={handleSliderChange} /></Col>
            <Col><ButtonComponent {...sendCaptchaButton} /></Col>
          </Row>
        </FormItem>
        <InputComponent {...userCaptcha} />
        <ButtonComponent {...loginButton} />
      </Form>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(Register));
