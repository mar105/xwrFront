import { connect } from 'dva';
import React, { useEffect, useState } from 'react';
import { TreeComponent } from '../../components/TreeComponent';
import * as application from "../application";
import * as commonUtils from "../../utils/commonUtils";
import * as request from "../../utils/request";
import {Form} from "antd";
import {ButtonComponent} from "../../components/ButtonComponent";
import {componentType} from "../../utils/commonTypes";

const Module = ({ dispatch }) => {
  const [form] = Form.useForm();
  const initTreeData: any[] = [];
  const [treeData, setTreeData] = useState(initTreeData);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    const fetchData = async () => {
      const url: string = `${application.urlPrefix}/module/getAllModule`;
      const interfaceReturn = (await request.getRequest(url, null)).data;
      const data = { title: 'Expand to load', key: commonUtils.newId() };
      // treeData.push(data);
      console.log('treedata', treeData);
      setTreeData([...treeData, data]);
      console.log(interfaceReturn);
      // setTreeData(interfaceReturn.result);
    }
    fetchData();
  }, []);
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    console.log(values);
  }

  const onClick = (values: any) => {
    console.log('onClick111', treeData);
    setTreeData([...treeData, {title: 'Expand to load11111', key: commonUtils.newId() }]);
  }

  const treeParam = {
    treeData,
    height: 500,
  };
  const addButton = {
    caption: '增加',
    property: { htmlType: 'button' },
    event: { onClick },
    componentType: componentType.Soruce,
  };
  const editButton = {
    caption: '修改',
    property: { htmlType: 'button' },
  };
  const postButton = {
    caption: '保存',
    property: { htmlType: 'submit' },
    componentType: componentType.Soruce,
  };

  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <TreeComponent {...treeParam} />
      <ButtonComponent {...addButton} />
      <ButtonComponent {...editButton} />
      <ButtonComponent {...postButton} />
    </Form>
  );
}

export default connect()(Module);