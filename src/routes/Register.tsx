import React, { Component } from 'react';
import { Form } from 'antd';
import { connect } from 'dva';

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
    const [form] = Form.useForm();

    return (
        <Form form={form} name="dynamic_form_nest_item" onFinish={this.handleFinish} autoComplete="off">

        </Form>
    );
  }
}

export default connect()(Register);
