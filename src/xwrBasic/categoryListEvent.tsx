import * as React from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "./application";
import * as request from "../utils/request";
import categoryListButtonEvent from "./categoryListButtonEvent";
import {useEffect} from "react";

const categoryListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }
    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
        && props.commonModel.stompClient.connected) {
        props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveAfterSyncToMongo', saveAfterSyncToMongoResult);
      }
    }, [props.commonModel.stompClient]);

    const saveAfterSyncToMongoResult = async (data) => {
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState = await props.getAllData({ pageNum: 1 });
        dispatchModifyState({ ...returnState });
        props.gotoSuccess(dispatch, returnBody);
      }
    }

    const onButtonClick = async (key, config, e, childParams) => {
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

        let addState = {};
        if (childParams && childParams.childCallback) {
          addState = await childParams.childCallback({masterData});
        }
        dispatchModifyState({ masterData, ...addState, masterIsVisible: true, enabled: true });
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
        let addState = {};
        if (childParams && childParams.childCallback) {
          addState = await childParams.childCallback({masterData});
        }
        dispatchModifyState({ masterData, ...addState, masterIsVisible: true, enabled: true });
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
        const params = {id: slaveSelectedRows[0].id, tabId, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const data = props.onModify();
          let masterData = await props.getDataOne({ containerId: masterContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
          masterData = {...masterData, ...data };
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(masterData));
          let addState = {};
          if (childParams && childParams.childCallback) {
            addState = await childParams.childCallback({masterData});
          }
          dispatchModifyState({ masterData, ...addState, masterIsVisible: true, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'delButton') {
        const { commonModel, dispatch, dispatchModifyState, masterData } = props;
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
        if (childParams && childParams.childCallback) {
          const saveChildData = await childParams.childCallback({masterData});
          saveData.push(...saveChildData);
        }

        const params = { id: slaveSelectedRows[0].id, routeId: props.routeId, tabId, saveData, handleType: 'del' };
        const url: string = `${application.urlMain}/getData/saveData`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnState = await props.getAllData({ pageNum: 1});
          dispatchModifyState({ ...returnState, slaveSelectedRows: [] });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState });
      } else {
        categoryListButtonEvent(key, config, e, childParams, props);
      }
    }
    const onModalCancel = async (e) => {
      const { dispatchModifyState } = props;
      const {dispatch, commonModel, tabId, masterData} = props;
      const url: string = `${application.urlCommon}/verify/removeModifying`;
      const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ masterIsVisible: false, enabled: false });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

    }

    const onModalOk = async (e, childParams) => {
      const { dispatchModifyState, commonModel, dispatch, masterData, tabId } = props;
      const values = await form.validateFields();
      const saveData: any = [];
      saveData.push(commonUtils.mergeData("master", [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
      if (childParams && childParams.childCallback) {
        const saveChildData = await childParams.childCallback({masterData});
        saveData.push(...saveChildData);
      }
      const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
      const url: string = `${application.urlMain}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState = await props.getAllData({ testMongo: true, pageNum: 1 });
        dispatchModifyState({ masterIsVisible: false, enabled: false, ...returnState });
        props.gotoSuccess(dispatch, interfaceReturn);
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return;
      }
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      return buttonGroup;
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onModalOk={onModalOk}
      onModalCancel={onModalCancel}
      onButtonClick={onButtonClick}
      getButtonGroup={getButtonGroup}
      />
  };
};

export default categoryListEvent;