import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../ButtonGroup";
import {Form, Modal} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import categoryListEvent from "./categoryListEvent";

const CategoryList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const { enabled, masterIsVisible } = props;
  const buttonGroup = { onClick: props.onButtonClick, enabled };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.enabled = false;
  return (
    <div>
      {props.slaveContainer ? <TableComponent {...tableParam} /> : ''}
      <ButtonGroup {...buttonGroup} />
      <Modal width={800} visible={masterIsVisible} maskClosable={false} onCancel={props.onModalCancel} onOk={props.onModalOk}>
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
        </Form>
      </Modal>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(CategoryList)));