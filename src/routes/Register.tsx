import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';
import { InputComponent } from "../components/InputComponent";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
        token: '',
    };
  }
  handleFinish = (e) => {
    console.log('ee', e);
  }

  render() {
    const form: any = React.createRef();
    const userName = {
      form,
      fieldName: 'userName',
      rules: {
        required: true,
        message: '请输入你的用户名',
      },
      property: {
        placeholder: '请输入你的用户名',
      },
    };
    return (
        <Form ref={form}>
          <InputComponent {...userName} />
        </Form>
    );
  }
}

export default connect()(Register);
