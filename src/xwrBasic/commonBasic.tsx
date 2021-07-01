import * as React from "react";
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "./application";
import * as request from "../utils/request";

const commonBasic = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }

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
      const { commonModel, tabId, dispatch, dispatchModifyState, masterData: masterDataOld } = props;
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
        if (commonUtils.isNotEmpty(masterDataOld.id)) {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('master', [masterDataOld], [], true));
          if (childParams && childParams.childCallback) {
            const saveChildData = await childParams.childCallback({masterDataOld});
            saveData.push(...saveChildData);
          }
          const params = { id: masterDataOld.id, routeId: props.routeId, tabId, saveData, handleType: 'del'};
          const url: string = `${application.urlMain}/getData/saveData`;
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            props.gotoSuccess(dispatch, interfaceReturn);
            props.callbackRemovePane(tabId);
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        } else {
          props.callbackRemovePane(tabId);
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






