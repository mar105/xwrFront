import { connect } from 'dva';
import { InputComponent } from '../components/InputComponent';
import { Form, Button } from 'antd';
import React from 'react';
import * as application from '../application';
import * as commonUtils from '../utils/commonUtils';
import * as request from '../utils/request';
import { Md5 } from 'ts-md5';

const Login = ({ dispatch }) => {
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
  };
  const userName = {
    config: { fieldName: 'userName', isRequired: true },
    property: { placeholder: '请输入你的用户名' },
  };
  const userPwd = {
    config: { fieldName: 'userPwd', isRequired: true },
    password: true,
    property: { placeholder: '请输入你的密码' },
  };

  const onFinish = async (values: any) => {
    const url: string = `${application.urlPrefix}/login/loginVerify`;
    values.userName = values.userName;
    values.userPwd = Md5.hashAsciiStr(Md5.hashAsciiStr(values.userPwd).toString());
    const interfaceReturn = (await request.postRequest(url, null, application.paramInit(values))).data;
    if (interfaceReturn.code === 1) {
      localStorage.setItem(`${application.prefix}token`, '');
      localStorage.setItem(`${application.prefix}userInfo`, '');
      localStorage.setItem(`${application.prefix}panes`, '[]');
      localStorage.setItem(`${application.prefix}activePane`, '{}');
      const userInfo: any = { userId: interfaceReturn.data.userId, userName: values.userName };
      if (commonUtils.isNotEmptyArr(interfaceReturn.data.userShop)) {
        userInfo.groupId = interfaceReturn.data.userShop[0].groupId;
        userInfo.groupName = interfaceReturn.data.userShop[0].groupName;
        userInfo.shopId = interfaceReturn.data.userShop[0].shopId;
        userInfo.shopName = interfaceReturn.data.userShop[0].shopName;
        userInfo.isManage = interfaceReturn.data.userShop[0].isManage;
        userInfo.userShop = interfaceReturn.data.userShop;
      }
      dispatch({
        type: 'commonModel/saveToken',
        payload: interfaceReturn.data.token,
      });
      dispatch({
        type: 'commonModel/saveUserInfo',
        payload: userInfo,
      });
      dispatch({
        type: 'commonModel/saveUserShop',
        payload: interfaceReturn.data.userShop,
      });
      dispatch({
        type: 'commonModel/gotoNewPage',
        payload: { newPage: '/' },
      });
      const stompClient = commonUtils.getWebSocketData(null, interfaceReturn.data.token);
      dispatch({
        type: 'commonModel/saveStompClient',
        payload: stompClient,
      });
    } else {
      dispatch({
        type: 'commonModel/gotoError',
        payload: { ...interfaceReturn },
      });
    }
  };
  return (
      <Form {...layout} name="basic" form={form} onFinish={onFinish}>
          <InputComponent {...userName} />
          <InputComponent {...userPwd} />
          <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                  登录
              </Button>
          </Form.Item>
      </Form>
  );
}
export default connect()(Login);