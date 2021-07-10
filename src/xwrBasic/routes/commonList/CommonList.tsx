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
  const buttonAddGroup: any = [];
  buttonAddGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', onClick: props.onButtonClick, sortNum: 100, disabled: props.enabled });
  const buttonGroup = { onClick: props.onButtonClick, enabled, slaveContainer, buttonGroup: buttonAddGroup };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.rowSelection.checkStrictly = false;
  tableParam.isLastColumn = false;
  tableParam.enabled = false;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };
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