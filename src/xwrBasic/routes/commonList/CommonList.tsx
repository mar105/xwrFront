import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import { Form, Modal} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
import ImportList from "./ImportList";
const CommonList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData, importIsVisible } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer, buttonGroup: props.getButtonGroup(), isModal: props.isModal,
    onUploadSuccess: props.onUploadSuccess, dispatchModifyState: props.dispatchModifyState };
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
      <Modal width={1500} maskClosable={false}  visible={importIsVisible} onCancel={props.onImportModalCancel.bind(this, 'import')} onOk={props.onImportModalOk.bind(this, 'import')}>
        <ImportList {...props } />
      </Modal>

    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CommonList)));