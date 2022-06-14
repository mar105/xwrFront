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
import CommonModal from "../../../common/commonModal";
const CategoryList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        const childParams = {};
        if (props.copyToData) {
          const masterData = {...commonUtils.getAssignFieldValue('master', props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
          childParams['masterData'] = masterData;
          for(const config of props.copyToData.config.children) {
            const fieldNameSplit = config.fieldName.split('.');
            const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
            if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
              const copyData: any = [];
              for(const data of props.copyToData[dataSetName + 'Data']) {
                copyData.push({...commonUtils.getAssignFieldValue(dataSetName, config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
              }
              childParams[dataSetName + 'Data'] = copyData;
              childParams[dataSetName + 'ModifyData'] = [];
              childParams[dataSetName + 'DelData'] = [];
            }
          }
        }
        props.onButtonClick('addButton', null, null, childParams);
      }
      else if (props.handleType === 'modify') {
        props.onButtonClick('modifyButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);

  const onButtonClick = async (key, config, e) => {
    const { dispatch, dispatchModifyState, commonModel, routeId } = props;
    if (key === 'syncBillButton') { //单据号设置 同步单据
      const url: string = application.urlPrefix + '/button/syncBill';
      const params = {
        routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: config.superiorId,
        containerSlaveId: config.id,
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState = await props.getAllData({ pageNum: 1 });
        dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [] });
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: slaveContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
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
      <CommonModal {...props} />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(CategoryList)));