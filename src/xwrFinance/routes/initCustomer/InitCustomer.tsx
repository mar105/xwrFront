import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useEffect, useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import categoryListEvent from "../../../common/categoryListEvent";
import Search from "../../../common/Search";
import * as application from "../../../xwrMaterialInventory/application";
import * as request from "../../../utils/request";
import CommonModal from "../../../common/commonModal";
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const InitCustomer = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  useEffect(() => {
    if (props.slaveContainer) {
      const fetchData = async () => {
        const { dispatchModifyState, slaveContainer } = props;
        const index = slaveContainer.slaveData.findIndex(item => item.fieldName === 'isAR');
        if (index > -1 && commonUtils.isNotEmpty(slaveContainer.slaveData[index].viewDrop)) {
          const returnData = (await props.getSelectList({containerSlaveId: slaveContainer.slaveData[index].id, isWait: true, config: slaveContainer.slaveData[index] })).list;
          if (commonUtils.isNotEmptyArr(returnData)) {
            dispatchModifyState({isAR: returnData[0].isAR});
          }
        }
      }
      fetchData();
    }
  }, [props.slaveContainer]);

  const onButtonClick = async (key, config, e) => {
    const { dispatch, dispatchModifyState, commonModel, routeId, slaveData } = props;
    if (key === 'setForceButton' || key === 'resetForceButton') { //强制完工设置处理
      const url: string = application.urlCommon + '/button/forceSet';
      const params = {
        routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: config.superiorId,
        containerSlaveId: config.id,
        forceType: key,
        id: routeId,                                    // 用于 期初客户->收款单 未清刷新数据。
        saveData: [{ name: 'slave', data: slaveData }], // 用于 生成 期初客户->收款单 数据。
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState = await props.getAllData({ pageNum: 1 });
        dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [], isAR: key === 'setForceButton' });
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onDataChange = (params) => {
    const { name, fieldName, isWait } = params;
    let returnData = props.onDataChange({...params, isWait: true});
    const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = returnData;
    const data: any = { ...dataOld };
    const dataModify = data.handleType === 'modify' ?
      commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
        { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
    const moneyPlace = props.commonModel.userInfo.shopInfo.moneyPlace;
    if (typeof dataOld === 'object' && dataOld.constructor === Object) {
      if (fieldName === 'notReceiptMoney') {
        data.notReceiptBaseMoney = commonUtils.round(data[fieldName] * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        if (data.handleType === 'modify') {
          dataModify.notReceiptBaseMoney = data.notReceiptBaseMoney;
        }
      } else if (fieldName === 'notInvoiceMoney') {
        data.notInvoiceBaseMoney = commonUtils.round(data[fieldName] * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        if (data.handleType === 'modify') {
          dataModify.notInvoiceBaseMoney = data.notInvoiceBaseMoney;
        }
      } else if (fieldName === 'customerName' || fieldName === 'currencyName') {
        data.notReceiptBaseMoney = commonUtils.round(data.notReceiptMoney * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        data.notInvoiceBaseMoney = commonUtils.round(data.notInvoiceMoney * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        if (data.handleType === 'modify') {
          dataModify.notReceiptBaseMoney = data.notReceiptBaseMoney;
          dataModify.notInvoiceBaseMoney = data.notInvoiceBaseMoney;
        }
      }
    }
    if (isWait) {
      return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
    } else {
      if (name === 'master') {
        form.setFieldsValue(commonUtils.setFieldsValue(data, props.masterContainer));
      }
      props.dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
    }
  }

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled || props.isAR });
    buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled || props.isAR });
    buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled || props.isAR });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled || props.isAR });
    buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled || props.isAR });
    buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 60, disabled: props.enabled || props.isAR });
    buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 100, disabled: props.enabled });
    buttonGroup.push({ key: 'setForceButton', caption: '设置期初', htmlType: 'button', sortNum: 100, disabled: props.enabled || props.isAR });
    buttonGroup.push({ key: 'resetForceButton', caption: '取消期初', htmlType: 'button', sortNum: 100, disabled: props.enabled || !props.isAR });
    return buttonGroup;
  }

  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData,
    reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState, container: slaveContainer,
    isModal: props.isModal, buttonGroup: getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.isLastColumn = false;
  tableParam.enabled = false;
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
      <ButtonGroup {...buttonGroup} />
      <Drawer width={600} visible={masterIsVisible} maskClosable={false} onClose={props.onDrawerCancel} footer={
        <div>
          <Button onClick={props.onDrawerOk} type="primary">Submit</Button>
          <Button onClick={props.onDrawerCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} onDataChange={onDataChange} />
        </Form>
      </Drawer>
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane}/>
      <CommonModal modalVisible={props.modalReportVisible} onModalCancel={props.onModalCancel} destroyOnClose={true} modalPane={
        <div>
          <UploadFile {...uploadParam}/>
          <a onClick={props.onReportUpload.bind(this, 'report')}><CloudUploadOutlined /></a>
        </div>
      } />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(InitCustomer)));