import React from 'react';
import { Form, Button } from 'antd';
import { connect } from 'dva';
import { InputComponent } from "../../components/InputComponent";

const  Register = () => {
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
  const userName1 = {
    form,
    fieldName: 'userPwd',
    rules: [{ required: true, message: '请输入你的密码' }],
    property: { placeholder: '请输入你的用户名' },
  };

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };
  return (
      <Form {...layout} name="basic" form={form} onFinish={onFinish}>
        <InputComponent {...userName} />
        <InputComponent {...userName1} />
        <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
        </Form.Item>
      </Form>
  );
}

export default connect()(Register);
