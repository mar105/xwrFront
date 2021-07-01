import * as React from "react";
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "./application";
import * as request from "../utils/request";

const commonBasic = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
        && props.commonModel.stompClient.connected) {
        props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturn);
      }
      return () => {
        if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
          && props.commonModel.stompClient.connected) {
          props.commonModel.stompClient.unsubscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId);
        }
      };
    }, [props.commonModel.stompClient]);

    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }

    const saveDataReturn = async (data) => {
      const { dispatch, dispatchModifyState, masterData } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        dispatchModifyState({...returnState});
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
      }
    }




    const onButtonClick = async (key, config, e, childParams) => {
      const { commonModel, tabId, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld } = props;
      if (key === 'addButton') {
        const masterData = props.onAdd();
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData));
        dispatchModifyState({ masterData, enabled: true });
      } else if (key === 'modifyButton') {
        const data = props.onModify();
        const masterData = {...masterDataOld, ...data };
        const url: string = `${application.urlCommon}/verify/isExistModifying`;
        const params = {id: masterData.id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          dispatchModifyState({ masterData, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'cancelButton') {
        if (masterDataOld.handleType === 'add') {
          const returnState = await props.getAllData({dataId: masterDataOld.id });
          dispatchModifyState({ ...returnState, enabled: false });
        } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
          const {dispatch, commonModel, tabId, masterData} = props;
          const url: string = `${application.urlCommon}/verify/removeModifying`;
          const params = {id: masterData.id, tabId};
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            const returnState = await props.getAllData({dataId: masterDataOld.id });
            dispatchModifyState({ ...returnState, enabled: false });
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        }
      } else if (key === 'delButton') {
        if (commonUtils.isEmptyArr(treeSelectedKeys)) {
          props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
          return;
        }
        if (commonUtils.isNotEmptyArr(masterDataOld.children)) {
          props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
          return;
        }
        const params = { ...masterDataOld };
        const url: string = `${application.urlPrefix}/route/delRoute1111111`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnRoute: any = await props.getDataOne({isWait: true});
          const addState: any = {};
          if (commonUtils.isNotEmpty(returnRoute.treeData)) {
            addState.treeSelectedKeys = [returnRoute.treeData[0].id];
            addState.masterData = {...returnRoute.treeData[0]};
            form.resetFields();
            form.setFieldsValue(commonUtils.setFieldsValue(returnRoute.treeData[0]));
          }

          dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
    }

    const onFinish = async (values: any, childParams) => {
      const { commonModel, dispatch, masterData, tabId, dispatchModifyState } = props;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
      const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
      const url: string = `${application.urlMain}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        dispatchModifyState({...returnState});
        props.gotoSuccess(dispatch, interfaceReturn);
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    return <WrapComponent
      {...props}
      onButtonClick={onButtonClick}
      onFinish={onFinish}
      onSetForm={onSetForm}
    />
  };
};

export default commonBasic;






