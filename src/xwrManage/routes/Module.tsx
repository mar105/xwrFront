import { connect } from 'dva';
import React, { useLayoutEffect, useState } from 'react';
import { TreeComponent } from '../../components/TreeComponent';
import * as application from "../application";
import * as request from "../../utils/request";
import {Form} from "antd";
import {ButtonComponent} from "../../components/ButtonComponent";
import {componentType} from "../../utils/commonTypes";

const Module = ({ dispatch }) => {
  const [form] = Form.useForm();
  const [treeData, setTreeData] = useState([]);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useLayoutEffect(() => {
    const fetchData = async () => {
      const url: string = `${application.urlPrefix}/module/getAllModule`;
      const interfaceReturn = (await request.getRequest(url, null)).data;
      const data: any = { title: 'Expand to load', key: '0' };
      treeData.push(data);
      console.log('treedata', treeData);
      setTreeData([...treeData]);
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
    // const treeDataA = [{ title: 'Expand to load', key: '0' }];
    // console.log('treeData', treeData);
    const treeNewData: object[] = [];
    treeNewData.push({title: 'Expand to load', key: '0'});
    setTreeData(treeNewData);
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