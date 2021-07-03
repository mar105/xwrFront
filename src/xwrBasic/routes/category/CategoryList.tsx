import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import categoryListEvent from "../../categoryListEvent";
import Search from "../../../common/Search";
const CategoryList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData } = props;
  const buttonGroup = { onClick: props.onButtonClick, enabled, slaveContainer };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.rowSelection.checkStrictly = false;
  tableParam.isLastColumn = false;
  tableParam.enabled = false;
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} />
      <Drawer width={600} visible={masterIsVisible} maskClosable={false} onClose={props.onModalCancel} footer={
        <div>
          <Button onClick={props.onModalOk} type="primary">Submit</Button>
          <Button onClick={props.onModalCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
        </Form>
      </Drawer>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(CategoryList)));