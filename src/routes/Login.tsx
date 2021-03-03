import { connect } from "react-redux";
import { InputComponent } from "../components/InputComponent";
import { Form, Button } from "antd";
import React from "react";
import * as application from "../application";
import * as request from '../utils/request';
import { Md5 } from 'ts-md5';

const Login = () => {
    const [form] = Form.useForm();
    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };
    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };
    const userName = {
        form,
        fieldName: 'userName',
        rules: [{ required: true, message: '请输入你的用户名' }],
        property: { placeholder: '请输入你的用户名' },
    };
    const userPwd = {
        form,
        fieldName: 'userPwd',
        rules: [{ required: true, message: '请输入你的密码' }],
        property: { placeholder: '请输入你的用户名' },
    };
    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };
    const onFinish = async (values: any) => {
      const url: string = `${application.urlPrefix}/login/loginVerify`;
      const params: any = {};
      // const md5 = new Md5();
      params.userName = values.userName;
      params.userPwd = Md5.hashAsciiStr(Md5.hashAsciiStr(values.userPwd).toString());
      const interfaceReturn = (await request.postRequest(url, null, params));
      // if (interfaceReturn.code === 'success') {
      //
      // }
      console.log('Success:', params, interfaceReturn);
    };
    return (
        <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
            <InputComponent {...userName} />
            <InputComponent {...userPwd} />
            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
}
export default connect()(Login);