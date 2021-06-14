import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../ButtonGroup";
import {Form} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
const CategoryList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const { enabled, slaveContainer, searchRowKeys, searchData } = props;
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
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CategoryList)));