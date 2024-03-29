import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useEffect, useMemo, useRef} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import Search from "../../../common/Search";
import categoryListEvent from "../../../common/categoryListEvent";
import CommonModal from "../../../common/commonModal";
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const Exchange = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const [form] = Form.useForm();
  props.onSetForm(form);

  const onButtonClick = async (key, config, e) => {
    const { slaveSelectedRows, masterContainer, exchangeRateContainer } = props;

    if (key === 'addButton' || key === 'addChildButton') {
      const childCallback = async (params) => {
        const exchangeRateData: any = [];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'exchangeRate');
        if (index > -1 && commonUtils.isNotEmpty(masterContainer.slaveData[index].viewDrop)) {
          const exchangeRate = (await props.getSelectList({containerSlaveId: masterContainer.slaveData[index].id, isWait: true, config: masterContainer.slaveData[index] })).list;
          exchangeRate.forEach((dataRow, rowIndex) => {
            let data = props.onAdd(exchangeRateContainer);
            data = { ...data, ...commonUtils.getAssignFieldValue('master', masterContainer.slaveData[index].assignField, dataRow)};
            data.superiorId = params.masterData.id;
            data.sortNum = rowIndex + 1;
            exchangeRateData.push(data);
          });
        }
        return { exchangeRateData, exchangeRateSelectedRowKeys: [] };
      }
      props.onButtonClick(key, config, e, {childCallback});
    }
    else if (key === 'modifyButton') {
      const childCallback = async (params) => {
        let returnData = await props.getDataList({ name: 'exchangeRate', containerId: exchangeRateContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        const addState = {...returnData};
        return addState;
      }
      props.onButtonClick(key, config, e, {childCallback});
    } else if (key === 'delButton') {
      const childCallback = async (params) => {
        const saveData: any = [];
        const returnData = await props.getDataList({ name: 'exchangeRate', containerId: exchangeRateContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        saveData.push(commonUtils.mergeData('exchangeRate', returnData.exchangeRateData, [], [], true));
        return saveData;
      }
      props.onButtonClick(key, config, e, {childCallback});
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onDrawerOk = async (e) => {
    const { exchangeRateData, exchangeRateModifyData, exchangeRateDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('exchangeRate', exchangeRateData, exchangeRateModifyData, exchangeRateDelData, false));
      return saveData;
    }
    props.onDrawerOk(e, {childCallback});
  }


  const { enabled, masterIsVisible, masterContainer, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData,
    reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.isLastColumn = false;
  tableParam.enabled = false;

  const exchangeRateParam: any = commonUtils.getTableProps('exchangeRate', props);
  exchangeRateParam.pagination = false;
  exchangeRateParam.width = 500;
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  const uploadParam: any = commonUtils.getUploadProps('report', props);
  uploadParam.enabled = true;
  uploadParam.isSelfModify = true;

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} onClick={onButtonClick}/>
      <Drawer width={600} visible={masterIsVisible} maskClosable={false} onClose={props.onDrawerCancel} footer={
        <div>
          <Button onClick={onDrawerOk} type="primary">Submit</Button>
          <Button onClick={props.onDrawerCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
          <TableComponent {...exchangeRateParam} />
        </Form>
      </Drawer>
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

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(Exchange)));