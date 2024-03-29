/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-08 21:14:18
 * @FilePath: \xwrFront\src\routes\Login.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { connect } from "dva";
import { InputComponent } from "../components/InputComponent";
import { Form, Button } from "antd";
import React from "react";
import * as application from "../application";
import * as commonUtils from "../utils/commonUtils";
import * as request from "../utils/request";
import { Md5 } from "ts-md5";

const Login = ({ dispatch }) => {
  const [form] = Form.useForm();
  const layout = {
    labelCol: { span: 0 },
    wrapperCol: { span: 24 },
  };
  const tailLayout = {
    wrapperCol: { offset: 0, span: 24 },
  };
  const userName = {
    config: { fieldName: "userName", isRequired: true },
    property: { placeholder: "请输入你的用户名" },
  };
  const userPwd = {
    config: { fieldName: "userPwd", isRequired: true },
    password: true,
    property: { placeholder: "请输入你的密码" },
  };

  const onFinish = async (values: any) => {
    const url: string = application.urlPrefix + "/login/loginVerify";
    values.userName = values.userName;
    values.userPwd = Md5.hashAsciiStr(
      Md5.hashAsciiStr(values.userPwd).toString()
    );
    const interfaceReturn = (
      await request.postRequest(url, null, application.paramInit(values))
    ).data;
    if (interfaceReturn.code === 1) {
      // localStorage.setItem(application.prefix + 'token', '');
      // localStorage.setItem(application.prefix + 'userInfo', '');
      // localStorage.setItem(application.prefix + 'panes', '[]');
      // localStorage.setItem(application.prefix + 'activePane', '{}');
      const userInfo: any = {
        userId: interfaceReturn.data.userId,
        userName: values.userName,
      };
      if (commonUtils.isNotEmptyArr(interfaceReturn.data.userShop)) {
        userInfo.userAbbr = interfaceReturn.data.userShop[0].userAbbr;
        userInfo.groupId = interfaceReturn.data.userShop[0].groupId;
        userInfo.groupName = interfaceReturn.data.userShop[0].groupName;
        userInfo.shopId = interfaceReturn.data.userShop[0].shopId;
        userInfo.shopName = interfaceReturn.data.userShop[0].shopName;
        userInfo.isManage = interfaceReturn.data.userShop[0].isManage;
        userInfo.shopInfo = interfaceReturn.data.userShop[0].shopInfo;
      }
      dispatch({
        type: "commonModel/savePanes",
        payload: [],
      });
      dispatch({
        type: "commonModel/saveToken",
        payload: interfaceReturn.data.token,
      });
      dispatch({
        type: "commonModel/saveUserInfo",
        payload: userInfo,
      });
      dispatch({
        type: "commonModel/saveUserShop",
        payload: interfaceReturn.data.userShop,
      });
      dispatch({
        type: "commonModel/gotoNewPage",
        payload: {
          newPage: "/",
          state: { mailCount: interfaceReturn.data.mailCount },
        },
      });
      dispatch({
        type: "commonModel/saveCommonConstant",
        payload: interfaceReturn.data.commonConstant,
      });
      const stompClient = commonUtils.getWebSocketData(
        null,
        () => {
          dispatch({
            type: "commonModel/saveStompClient",
            payload: stompClient,
          });
        },
        interfaceReturn.data.token,
        true
      );
    } else {
      dispatch({
        type: "commonModel/gotoError",
        payload: { ...interfaceReturn },
      });
    }
  };
  return (
    <Form
      {...layout}
      name="basic"
      form={form}
      onFinish={onFinish}
      className="xwr-login-form"
    >
      <div className="login-form-body">
        <h1 className="login-form-title">登录</h1>
        <InputComponent {...userName} />
        <InputComponent {...userPwd} />
        <Form.Item {...tailLayout} className="xwr-login-form-btns">
          <Button type="primary" htmlType="submit" className="login-btn">
            登 录
          </Button>
          <a href="/register">register</a>
        </Form.Item>
      </div>
    </Form>
  );
};
export default connect()(Login);
