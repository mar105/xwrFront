import { connect } from 'dva';
import React, {useEffect, useMemo} from 'react';
import {Col, Form, Row, Tooltip} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../ButtonGroup";
import commonDocEvent from "../../../common/commonDocEvent";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";
import { StarTwoTone, DeleteOutlined, StarFilled } from '@ant-design/icons';

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
    const childParams: any = {};
    if (key === 'addButton') {
      childParams.addressData = [];
      childParams.addressDelData = [];
      childParams.contactData = [];
      childParams.contactDelData = [];
      props.onButtonClick(key, config, e, childParams);
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onLastColumnClick = (name, key, record, e, isWait = false) => {
    const { dispatchModifyState, masterData: masterDataOld }: any = props;
    if (name === 'contact') {
      if (key === 'defaultButton') {
        const masterData = { ...masterDataOld, defaultContactId: record.id };
        dispatchModifyState({ masterData });
      }
    } else if (name === 'address') {
      if (key === 'defaultButton') {
        const masterData = { ...masterDataOld, defaultAddressId: record.id };
        dispatchModifyState({ masterData });
      }
    }


  };

  const { enabled, masterContainer, masterData } = props;
  const buttonGroup = { onClick: onButtonClick, enabled };
  const contactParam: any = commonUtils.getTableProps('contact', props);
  contactParam.pagination = false;
  contactParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, 'contact', 'defaultButton', record)}>
        <Tooltip placement="top" title="默认"> {masterData.defaultContactId === record.id ? <StarFilled /> : <StarTwoTone /> }</Tooltip></a>
      <a onClick={props.onLastColumnClick.bind(this, 'contact', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
    </div>
  }, width: 50 , fixed: 'right' };
  const addressParam: any = commonUtils.getTableProps('address', props);
  addressParam.pagination = false;
  addressParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
      return <div>
        <a onClick={onLastColumnClick.bind(this, 'address', 'defaultButton', record)}>
          <Tooltip placement="top" title="默认">{masterData.defaultAddressId === record.id ? <StarFilled /> : <StarTwoTone /> }</Tooltip></a>
        <a onClick={props.onLastColumnClick.bind(this, 'address', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
      </div>
    }, width: 50 , fixed: 'right' };

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

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Customer)));