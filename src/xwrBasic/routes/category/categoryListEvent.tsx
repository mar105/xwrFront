import * as React from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";

const categoryListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }

    const onButtonClick = async (key, config, e) => {
      const { dispatch, dispatchModifyState, commonModel, tabId, slaveSelectedRows, masterContainer } = props;
      if (key === 'addButton') {
        let masterData = props.onAdd();
        if (commonUtils.isNotEmptyArr(slaveSelectedRows)) {
          if (slaveSelectedRows.length > 1) {
            props.gotoError(dispatch, { code: '6001', msg: '只能选择一条数据！' });
            return;
          }
          const allList = slaveSelectedRows[0].allId.split(',');
          allList.splice(allList.length - 1, 1);
          masterData.allId = allList.join() + ',' + masterData.id;
          masterData.superiorId = slaveSelectedRows[0].superiorId;
          if (commonUtils.isNotEmpty(config.assignField)) {
            masterData = {...masterData, ...props.getAssignFieldValue(config.assignField, slaveSelectedRows[0])}
          }
        } else {
          masterData.allId = masterData.id;
        }
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData));
        dispatchModifyState({ masterData, masterIsVisible: true, enabled: true });
      }
      else if (key === 'addChildButton') {
        let masterData = props.onAdd();
        if (commonUtils.isEmptyArr(slaveSelectedRows)) {
          props.gotoError(dispatch, { code: '6001', msg: '请先选择数据！' });
          return;
        } else if (slaveSelectedRows.length > 1) {
          props.gotoError(dispatch, { code: '6001', msg: '只能选择一条数据！' });
          return;
        }
        masterData.allId = slaveSelectedRows[0].allId + ',' + masterData.id;
        masterData.superiorId = slaveSelectedRows[0].id;
        if (commonUtils.isNotEmpty(config.assignField)) {
          masterData = {...masterData, ...props.getAssignFieldValue(config.assignField, slaveSelectedRows[0])}
        }
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData));
        dispatchModifyState({ masterData, masterIsVisible: true, enabled: true });
      }
      else if (key === 'modifyButton') {
        if (commonUtils.isEmptyArr(slaveSelectedRows)) {
          props.gotoError(dispatch, { code: '6001', msg: '请先选择数据！' });
          return;
        } else if (slaveSelectedRows.length > 1) {
          props.gotoError(dispatch, { code: '6001', msg: '只能选择一条数据！' });
          return;
        }

        const url: string = `${application.urlCommon}/verify/isExistModifying`;
        const params = {id: slaveSelectedRows[0].id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const data = props.onModify();
          let masterData = await props.getDataOne({ routeId: props.routeId, containerId: masterContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
          masterData = {...masterData, ...data };
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(masterData));
          dispatchModifyState({ masterData, masterIsVisible: true, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'delButton') {
        const { commonModel, dispatch, dispatchModifyState } = props;
        if (commonUtils.isEmptyArr(slaveSelectedRows)) {
          props.gotoError(dispatch, { code: '6001', msg: '请先选择数据！' });
          return;
        } else if (slaveSelectedRows.length > 1) {
          props.gotoError(dispatch, { code: '6001', msg: '只能选择一条数据！' });
          return;
        } else if (commonUtils.isNotEmptyArr(slaveSelectedRows[0].children)) {
          props.gotoError(dispatch, { code: '6001', msg: '请选择删除子级数据！' });
          return;
        }
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('master', [slaveSelectedRows[0]], [], true));
        const params = { id: slaveSelectedRows[0].id, routeId: props.routeId, tabId, saveData, handleType: 'del' };
        const url: string = `${application.urlMain}/getData/saveData`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnState = await props.getAllData();
          dispatchModifyState({ ...returnState });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
    }
    const onModalCancel = async (e) => {
      const { dispatchModifyState } = props;
      const {dispatch, commonModel, tabId, masterData} = props;
      const url: string = `${application.urlCommon}/verify/removeModifying`;
      const params = {id: masterData.id, tabId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ masterIsVisible: false, enabled: false });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

    }

    const onModalOk = async (e) => {
      const { dispatchModifyState } = props;
      try {
        const values = await form.validateFields();
        const { commonModel, dispatch, masterData, tabId } = props;
        const saveData: any = [];
        saveData.push(commonUtils.mergeData("master", [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
        const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
        const url: string = `${application.urlMain}/getData/saveData`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnState = await props.getAllData();
          dispatchModifyState({ masterIsVisible: false, enabled: false, ...returnState });
        } else {
          props.gotoError(dispatch, interfaceReturn);
          return;
        }
      } catch (errorInfo) {
        console.log('Failed:', errorInfo);
      }
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onModalOk={onModalOk}
      onModalCancel={onModalCancel}
      onButtonClick={onButtonClick}
      />
  };
};

export default categoryListEvent;