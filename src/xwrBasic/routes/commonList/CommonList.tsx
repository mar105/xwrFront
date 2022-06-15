import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Form, Modal, Tooltip} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
import ImportList from "./ImportList";
import { SaveOutlined } from '@ant-design/icons';
import CommonModal from "../../../common/commonModal";

const CommonList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  //标准配置配置，直接把配置保存后后台配置表
  const configSetting = props.commonModel.userInfo.shopId === '1395719229487058944' ?
    <a onClick={props.onTableConfigSaveClick.bind(this, 'slave')}> <Tooltip placement="top" title="列宽保存"><SaveOutlined /> </Tooltip></a> : '';

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData, importIsVisible } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: slaveContainer, buttonGroup: props.getButtonGroup(), isModal: props.isModal,
    onUploadSuccess: props.onUploadSuccess, dispatchModifyState: props.dispatchModifyState };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.enabled = false;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };
  tableParam.width = 1500;
  tableParam.lastTitle = <div> {configSetting} </div>;
  tableParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div />
  }, width: 50 , fixed: 'right' }
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
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CommonList)));