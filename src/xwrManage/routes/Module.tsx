import { connect } from 'dva';
import React, { useEffect, useState } from 'react';
import { TreeComponent } from '../../components/TreeComponent';
import * as application from "../application";
import * as request from "../../utils/request";
import {Col, Form, Row} from "antd";
import { onAdd } from "../../utils/commonBase";
import {ButtonGroup} from "./ButtonGroup";

const Module = ({ dispatch }) => {
  const [form] = Form.useForm();
  const initTreeData: any[] = [];
  const [treeData, setTreeData] = useState(initTreeData);
  const [treeSelectedKeys, setTreeSelectedKeys] = useState(initTreeData);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    const fetchData = async () => {
      const url: string = `${application.urlPrefix}/module/getAllModule`;
      const interfaceReturn = (await request.getRequest(url, null)).data;
      setTreeData(interfaceReturn.result);
    }
    fetchData();
  }, []);
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    console.log(values);
  }

  const onClick = (e) => {
    console.log(e);
    const data = onAdd();
    setTreeData([...treeData, data]);
    setTreeSelectedKeys([data.key]);
  }

  const onSelect = (selectedKeys: React.Key[]) => {
    setTreeSelectedKeys(selectedKeys);
  }

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, height: 500 },
    event: { onSelect },
  };
  console.log('111111111', treeData);
  const buttonGroup: any = [];
  buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', onClick });
  buttonGroup.push({ key: 'addChildButton', caption: '增加子级', htmlType: 'button', onClick });
  buttonGroup.push({ key: 'editButton', caption: '修改', htmlType: 'button', onClick });
  buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', onClick });
  buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', onClick });
  buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', onClick });
  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <ButtonGroup buttonGroup={buttonGroup} />
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          <TreeComponent {...treeParam} />
        </Col>
        <Col>
          <TreeComponent {...treeParam} />
        </Col>
      </Row>
    </Form>
  );
}

export default connect()(Module);