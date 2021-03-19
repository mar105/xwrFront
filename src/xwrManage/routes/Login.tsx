import { connect } from 'dva';
import { InputComponent } from '../../components/InputComponent';
import { ButtonComponent } from '../../components/ButtonComponent';
import { Form } from 'antd';
import React from 'react';
import * as application from '../application';
import * as request from '../../utils/request';
import { Md5 } from 'ts-md5';

const Login = ({ dispatch }) => {
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  // const tailLayout = {
  //   wrapperCol: { offset: 8, span: 16 },
  // };
  const userName = {
    form,
    fieldName: 'userName',
    rules: [{ required: true, message: '请输入你的用户名' }],
    property: { placeholder: '请输入你的用户名' },
  };
  const userPwd = {
    form,
    fieldName: 'userPwd',
    password: true,
    rules: [{ required: true, message: '请输入你的密码' }],
    property: { placeholder: '请输入你的密码' },

  };
  const loginButton = {
    caption: '登录',
    property: { htmlType: 'submit' },
  };
  const onFinishFailed = (errorInfo: any) => {
      console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    const url: string = `${application.urlPrefix}/login/loginVerify`;
    values.userName = values.userName;
    values.userPwd = Md5.hashAsciiStr(Md5.hashAsciiStr(values.userPwd).toString());
    const interfaceReturn = (await request.postRequest(url, null, application.paramInit(values))).data;
    if (interfaceReturn.code === 'success') {
      dispatch({
        type: 'commonModel/saveToken',
        payload: interfaceReturn.result,
      });
      dispatch({
        type: 'commonModel/saveUserInfo',
        payload: { userName: values.userName },
      });
      dispatch({
        type: 'commonModel/gotoNewPage',
        payload: { newPage: '/xwrManage' },
      });
    } else {
      dispatch({
        type: 'commonModel/gotoError',
        payload: { interfaceReturn },
      });
    }
  };
  return (
      <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
          <InputComponent {...userName} />
          <InputComponent {...userPwd} />
        <ButtonComponent {...loginButton} />
      </Form>
  );
}
export default connect()(Login);