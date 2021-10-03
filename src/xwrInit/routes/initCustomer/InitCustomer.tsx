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
const InitCustomer = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  useEffect(() => {
    if (props.slaveContainer) {
      const fetchData = async () => {
        const { dispatchModifyState, slaveContainer } = props;
        const index = slaveContainer.slaveData.findIndex(item => item.fieldName === 'isAR');
        if (index > -1 && commonUtils.isNotEmpty(slaveContainer.slaveData[index].viewDrop)) {
          const isAR = (await props.getSelectList({containerSlaveId: slaveContainer.slaveData[index].id, isWait: true })).list;
          console.log('111', isAR);
          dispatchModifyState({ isAR: isAR.isAR });
        }
      }
      fetchData();
    }
  }, [props.slaveContainer]);

  const onButtonClick = async (key, config, e) => {
    const { dispatch, dispatchModifyState, commonModel, routeId } = props;
    if (key === 'setForceButton' || key === 'resetForceButton') { //强制完工设置处理
      const url: string = `${application.urlCommon}/button/forceSet`;
      const params = {
        routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: config.superiorId,
        containerSlaveId: config.id,
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState = await props.getAllData();
        dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [], isAR: key === 'setForceButton' });
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else {
      props.onButtonClick(key, config, e);
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
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer, buttonGroup: getButtonGroup() };
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
          <CommonExhibit name="master" {...props} />
        </Form>
      </Drawer>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(InitCustomer)));