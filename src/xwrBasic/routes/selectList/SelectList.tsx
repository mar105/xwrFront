import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Form, Tooltip} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
import { DeleteOutlined } from '@ant-design/icons';

const SelectList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'selectButton', caption: '选择', htmlType: 'button', sortNum: 10, disabled: props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: props.enabled });
    buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 70, disabled: props.enabled });
    return buttonGroup;
  }

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer, buttonGroup: getButtonGroup(), isModal: props.isModal, modalType: 'select',
    onUploadSuccess: props.onUploadSuccess, dispatchModifyState: props.dispatchModifyState };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  // tableParam.isLastColumn = false;
  tableParam.enabled = false;
  tableParam.rowSelection.preserveSelectedRowKeys = true;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };


  const selectParam: any = commonUtils.getTableProps('slave', props);
  if (commonUtils.isNotEmptyObj(selectParam.tableNestParam.property)) {
    selectParam.tableNestParam.property.rowSelection = null;
    selectParam.tableNestParam.property.dataSource = props.slaveNestSelectedRows;
    selectParam.tableNestParam.lastColumn = { title: 'o',
      render: (text,record, index)=> {
        return <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, 'slaveNest', 'delSelectButton', record) : null}>
          <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
      }, width: 50 , fixed: 'right' };
  }

  selectParam.enabled = false;
  selectParam.property.dataSource = props.slaveSelectedRows;
  selectParam.property.rowSelection = null;
  selectParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, 'slave', 'delSelectButton', record) : null}>
      <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
  }, width: 50 , fixed: 'right' };
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
          <TableComponent {...selectParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(SelectList)));