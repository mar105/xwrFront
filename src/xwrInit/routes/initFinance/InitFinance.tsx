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
import * as application from "../../application";
import * as request from "../../../utils/request";
const InitFinance = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  useEffect(() => {
    if (props.slaveContainer) {
      const fetchData = async () => {
        const { dispatchModifyState, slaveContainer } = props;
        const index = slaveContainer.slaveData.findIndex(item => item.fieldName === 'isFinance');
        if (index > -1 && commonUtils.isNotEmpty(slaveContainer.slaveData[index].viewDrop)) {
          const returnData = (await props.getSelectList({containerSlaveId: slaveContainer.slaveData[index].id, isWait: true, sqlCondition: slaveContainer.slaveData[index].sqlCondition })).list;
          if (commonUtils.isNotEmptyArr(returnData)) {
            dispatchModifyState({isFinance: returnData[0].isFinance});
          }
        }
      }
      fetchData();
    }
  }, [props.slaveContainer]);

  const onButtonClick = async (key, config, e) => {
    const { dispatch, dispatchModifyState, commonModel, routeId, slaveData } = props;
    if (key === 'setForceButton' || key === 'resetForceButton') { //强制完工设置处理
      const url: string = `${application.urlCommon}/button/forceSet`;
      const params = {
        routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: config.superiorId,
        containerSlaveId: config.id,
        forceType: key,
        id: routeId,                                    // 用于 期初财务->日记账 未清刷新数据。
        saveData: [{ name: 'slave', data: slaveData }], // 用于 生成 期初财务->日记账 数据。
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState = await props.getAllData();
        dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [], isFinance: key === 'setForceButton' });
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
    const returnData = props.onDataChange({...params, isWait: true});
    const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = returnData;
    const data: any = { ...dataOld };
    const dataModify = data.handleType === 'modify' ?
      commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
        { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
    const moneyPlace = props.commonModel.userInfo.shopInfo.moneyPlace;
    if (typeof dataOld === 'object' && dataOld.constructor === Object) {
      if (fieldName === 'financeMoney') {
        data.financeBaseMoney = commonUtils.round(data[fieldName] * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        if (data.handleType === 'modify') {
          dataModify.financeBaseMoney = data.financeBaseMoney;
        }
      } else if (fieldName === 'currencyName') {
        data.financeBaseMoney = commonUtils.round(data.financeMoney * commonUtils.isEmptyorZeroDefault(data.exchangeRate, 1), moneyPlace);
        if (data.handleType === 'modify') {
          dataModify.financeBaseMoney = data.financeBaseMoney;
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
    buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled || props.isFinance });
    buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled || props.isFinance });
    buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled || props.isFinance });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled || props.isFinance });
    buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled || props.isFinance });
    buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 60, disabled: props.enabled || props.isFinance });
    buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 100, disabled: props.enabled });
    buttonGroup.push({ key: 'setForceButton', caption: '设置期初', htmlType: 'button', sortNum: 100, disabled: props.enabled || props.isFinance });
    buttonGroup.push({ key: 'resetForceButton', caption: '取消期初', htmlType: 'button', sortNum: 100, disabled: props.enabled || !props.isFinance });
    return buttonGroup;
  }

  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer,
    isModal: props.isModal, buttonGroup: getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
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
          <CommonExhibit name="master" {...props} onDataChange={onDataChange} />
        </Form>
      </Drawer>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(InitFinance)));