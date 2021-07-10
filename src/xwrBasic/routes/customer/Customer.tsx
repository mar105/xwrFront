import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row, Tooltip} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../ButtonGroup";
import commonBasic from "../../commonBasic";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";
import { PlusOutlined } from '@ant-design/icons';

const Customer = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const onFinish = async (values: any) => {
    props.onFinish(values);
  }

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        onButtonClick('addButton', null, null);
      }
      else if (props.handleType === 'modify') {
        onButtonClick('modifyButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);



  const onButtonClick = async (key, config, e) => {
    props.onButtonClick(key, config, e);
  }

  const { enabled, masterContainer, masterData } = props;
  const buttonGroup = { onClick: onButtonClick, enabled };
  const contactParam: any = commonUtils.getTableProps('contact', props);
  contactParam.labelTitle = <div>
    <a onClick={props.onTableAddClick.bind(this, 'contact')}> <Tooltip placement="top" title="增加"><PlusOutlined /> </Tooltip></a>
  </div>;
  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  const buttonGroupComponent = useMemo(()=>{ return (
    <ButtonGroup {...buttonGroup} />)}, [enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.contactContainer) ? <TableComponent {...contactParam} /> : '' }
        </Col>
      </Row>
      {buttonGroupComponent}
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonBasic(Customer)));