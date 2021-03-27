import { connect } from 'dva';
import React, { useEffect, useState } from 'react';
import { TreeComponent } from '../../components/TreeComponent';
import * as application from "../application";
import * as request from "../../utils/request";
import {Col, Form, Row} from "antd";
import {onAdd} from "../../utils/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "./ButtonGroup";
import {InputComponent} from "../../components/InputComponent";
import {NumberComponent} from "../../components/NumberComponent";
import {SwitchComponent} from "../../components/SwitchComponent";

const Module = ({ dispatch }) => {
  const [form] = Form.useForm();
  const initTreeData: any[] = [];
  const [treeData, setTreeData] = useState(initTreeData);
  const [treeSelectedKeys, setTreeSelectedKeys] = useState(initTreeData);
  const [enabled, setEnabled] = useState(false);
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
    commonUtils.getWebSocketData();
  }, []);
  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
    console.log(values);
  }

  const onClick = (key, e) => {
    if (key === 'addButton') {
      const data = onAdd();
      setTreeData([...treeData, data]);
      setTreeSelectedKeys([data.key]);
      setEnabled(true);
    } else if (key === 'editButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        dispatch({
          type: 'commonModel/gotoError',
          payload: { code: 'error', msg: '请选择数据' },
        });
        return;
      }
      setEnabled(true);
    } else if (key === 'cancelButton') {
      setEnabled(false);
    }

  }

  const onSelect = (selectedKeys: React.Key[]) => {
    setTreeSelectedKeys(selectedKeys);
  }

  const treeParam = {
    property: { treeData, selectedKeys: treeSelectedKeys, height: 500 },
    event: { onSelect },
  };

  const buttonGroup = { onClick, enabled };

  const routeName = {
    form,
    fieldName: 'routeName',
    label: '路由名称',
    rules: [{ required: true, message: '请输入你的路由名称' }],
    property: { disabled: !enabled },
  };
  const sortNum = {
    form,
    fieldName: 'sortNum',
    label: '排序号',
    rules: [{ required: true, message: '请输入你的排序号' }],
    property: { disabled: !enabled },
  };
  const chineseName = {
    form,
    fieldName: 'chineseName',
    label: '中文名称',
    rules: [{ required: true, message: '请输入你的中文名称' }],
    property: { disabled: !enabled },
  };
  const traditionalName = {
    form,
    fieldName: 'chineseName',
    label: '繁体名称',
    property: { disabled: !enabled },
  };
  const englishName = {
    form,
    fieldName: 'chineseName',
    label: '英文名称',
    property: { disabled: !enabled },
  };
  const modelsType = {
    form,
    fieldName: 'modelsType',
    label: '模块类型',
    property: { disabled: !enabled },
  };
  const isVisible = {
    form,
    fieldName: 'isVisible',
    label: '是否显示',
    property: { checkedChildren: '显示', unCheckedChildren: '隐藏', defaultChecked: true, disabled: !enabled }
  };

  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <ButtonGroup {...buttonGroup} />
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          <TreeComponent {...treeParam} />
        </Col>
        <Col>
          <InputComponent {...routeName} />
          <NumberComponent {...sortNum} />
          <InputComponent {...chineseName} />
          <InputComponent {...traditionalName} />
          <InputComponent {...englishName} />
          <InputComponent {...modelsType} />
          <SwitchComponent {...isVisible} />
        </Col>
      </Row>
    </Form>
  );
}

export default connect()(Module);