/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-07-28 23:49:58
 * @FilePath: \xwrFront\src\xwrSale\routes\saleOrder\SaleOrder.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { connect } from 'dva';
import React, { useMemo} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../../../common/ButtonGroup";
import commonDocEvent from "../../../common/commonDocEvent";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";

import CommonModal from "../../../common/commonModal";
import commonBillEvent from "../../../common/commonBillEvent";
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const SaleOrder = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData,
    permissionData: props.permissionData, reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState,
    container: masterContainer, isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const slaveParam: any = commonUtils.getTableProps('slave', props);
  slaveParam.isDragRow = true;
  slaveParam.pagination = false;
  slaveParam.width = 2000;
  slaveParam.lastColumn = { title: 'o', changeValue: props.upperMenus || props.lowerMenus,
    render: (text, record, index)=> {
    return props.getLastColumnButton(slaveParam.name, text, record, index);
  }, width: 50 , fixed: 'right' };

  const uploadParam: any = commonUtils.getUploadProps('report', props);
  uploadParam.enabled = true;
  uploadParam.isSelfModify = true;

  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <div>
      <Form {...layout} name="basic" form={form} onFinish={props.onFinish} className="xwr-search-form">
        <Row>
          <Col>
            {component}
          </Col>
        </Row>
        <Row>
          <Col>
            {commonUtils.isNotEmptyObj(props.slaveContainer) ? <TableComponent {...slaveParam} /> : '' }
          </Col>
        </Row>
        <ButtonGroup {...buttonGroup} />
      </Form>
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
      <CommonModal modalVisible={props.modalReportVisible} onModalCancel={props.onModalCancel} destroyOnClose={true} modalPane={
        <div>
          <UploadFile {...uploadParam}/>
          <a onClick={props.onReportUpload.bind(this, 'report')}><CloudUploadOutlined /></a>
        </div>
      } />
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(commonBillEvent(SaleOrder))));