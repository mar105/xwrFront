import * as React from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";

const commonMasterEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    // @ts-ignore
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }

    const onFinish = async (values: any, isWait) => {
      const { commonModel, dispatch, masterData, tabId, dispatchModifyState } = props;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
      const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
      const url: string = `${application.urlPrefix}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        if (isWait) {
          return {...returnState};
        } else {
          dispatchModifyState({...returnState});
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return {};
      }
    }


    const onButtonClick = async (key, e) => {
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
        const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          dispatchModifyState({ masterData, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'cancelButton') {
        if (masterDataOld.handleType === 'add') {
          const returnState: any = await props.getAllData({ dataId: masterDataOld.id });
          dispatchModifyState({...returnState});
        } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
          const {dispatch, commonModel, tabId, masterData} = props;
          const url: string = `${application.urlCommon}/verify/removeModifying`;
          const params = {id: masterData.id, tabId};
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            const returnState: any = await props.getAllData({ dataId: masterDataOld.id });
            dispatchModifyState({...returnState});
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        }
      } else if (key === 'delButton') {
        const { commonModel, dispatch, masterData, dispatchModifyState } = props;
        if (commonUtils.isEmptyArr(treeSelectedKeys)) {
          props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
          return;
        }
        if (commonUtils.isNotEmptyArr(masterData.children)) {
          props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
          return;
        }
        const params = { ...masterData };
        const url: string = `${application.urlPrefix}/route/delRoute`;
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

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onButtonClick={onButtonClick}
      onFinish={onFinish}
    />
  };
};

export default commonMasterEvent;