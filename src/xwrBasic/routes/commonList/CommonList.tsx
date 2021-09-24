import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Form} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
const CategoryList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer, buttonGroup: props.getButtonGroup(), onUploadSuccess: props.onUploadSuccess };
  const tableParam: any = commonUtils.getTableProps('slave', props);
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