import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../ButtonGroup";
import commonBasic from "../../commonBasic";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";

const Customer = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const onFinish = async (values: any) => {
    const { contactData, contactDelData, addressData, addressDelData } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('contact', contactData, contactDelData, false));
    saveData.push(commonUtils.mergeData('address', addressData, addressDelData, false));
    const childParams = { saveData };
    props.onFinish(values, childParams);
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
  contactParam.pagination = false;
  const addressParam: any = commonUtils.getTableProps('address', props);
  addressParam.pagination = false;

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
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.addressContainer) ? <TableComponent {...addressParam} /> : '' }
        </Col>
      </Row>
      {buttonGroupComponent}
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonBasic(Customer)));