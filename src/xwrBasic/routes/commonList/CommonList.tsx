/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-04 20:32:15
 * @FilePath: \xwrFront\src\xwrBasic\routes\commonList\CommonList.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const CommonList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  //标准配置配置，直接把配置保存后后台配置表
  const configSetting = props.commonModel.userInfo.shopId === '1395719229487058944' ?
    <a onClick={props.onTableConfigSaveClick.bind(this, 'slave')}> <Tooltip placement="top" title="列宽保存"><SaveOutlined /> </Tooltip></a> : '';

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData, importIsVisible, searchSchemeData, searchSchemeId, schemeIsVisible } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData,
    reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState, container: slaveContainer, buttonGroup: props.getButtonGroup(), isModal: props.isModal,
    onUploadSuccess: props.onUploadSuccess };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.enabled = false;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };
  tableParam.width = '100%';
  tableParam.lastTitle = <div> {configSetting} </div>;
  tableParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div />
  }, width: 50 , fixed: 'right' }
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData, searchSchemeData, searchSchemeId, schemeIsVisible]);

  const uploadParam: any = commonUtils.getUploadProps('report', props);
  uploadParam.enabled = true;
  uploadParam.isSelfModify = true;

  return (
    <div>
      {props.slaveContainer ?
        <div>
          <div className="table-header-search-row">
            {search}
            
          </div>
          <TableComponent {...tableParam} />
          <ButtonGroup {...buttonGroup} />
        </div>: ''}
     
      <Modal width={1500} maskClosable={false}  visible={importIsVisible} onCancel={props.onImportModalCancel.bind(this, 'import')} onOk={props.onImportModalOk.bind(this, 'import')}>
        <ImportList {...props } />
      </Modal>
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

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CommonList)));