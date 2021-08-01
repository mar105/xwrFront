import * as React from "react";
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../xwrBasic/application";
import * as request from "../utils/request";
import {useRef} from "react";

const commonDocEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const masterDataRef: any = useRef();
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }

    useEffect(() => {
      masterDataRef.current = props.masterData;
    }, [props.masterData]);

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
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterDataRef.current.id });
        dispatchModifyState({...returnState});
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
      }
    }




    const onButtonClick = async (key, config, e, childParams) => {
      const { commonModel, tabId, dispatch, dispatchModifyState, masterContainer, masterData: masterDataOld } = props;
      if (key === 'addButton') {
        const masterData = childParams && childParams.masterData ? childParams.masterData : props.onAdd();
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData, masterContainer));
        dispatchModifyState({ masterData, enabled: true, ...childParams });
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
          const returnData: any = await props.getDataList({ name: 'slave', routeId: props.listRouteId, containerId: props.listContainerId, pageNum: props.listRowIndex, pageSize: 1, condition: props.listCondition, isWait: true });
          if (commonUtils.isNotEmptyArr(returnData.slaveData)) {
            const returnState: any = await props.getAllData({ dataId: returnData.slaveData[0].id });
            dispatchModifyState({...returnState, listRowIndex: props.listRowIndex});
          }
          // props.callbackRemovePane(tabId);
        } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
          const {dispatch, commonModel, tabId, masterData} = props;
          const url: string = `${application.urlCommon}/verify/removeModifying`;
          const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId};
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            const returnState = await props.getAllData({dataId: masterDataOld.id });
            dispatchModifyState({ ...returnState, enabled: false });
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        }
      } else if (key === 'delButton' || key === 'invalidButton') {
        if (commonUtils.isNotEmpty(masterDataOld.id)) {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('master', [masterDataOld], [], true));
          if (childParams && childParams.childCallback) {
            const saveChildData = await childParams.childCallback({masterDataOld});
            saveData.push(...saveChildData);
          }
          const params = { id: masterDataOld.id, routeId: props.routeId, tabId, saveData, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId, handleType: key.replace('Button', '')};
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
      } else if (key === 'firstButton' || key === 'priorButton' || key === 'nextButton' || key === 'lastButton') {
        let listRowIndex = key === 'firstButton' ? 1 :
          key === 'priorButton' ? props.listRowIndex - 1 :
            key === 'nextButton' ? props.listRowIndex + 1 :
              key === 'lastButton' ? props.listRowTotal : 1;
        if (listRowIndex <= 0 || listRowIndex > props.listRowTotal) {
          return;
        }
        const returnData: any = await props.getDataList({ name: 'slave', routeId: props.listRouteId, containerId: props.listContainerId, pageNum: listRowIndex, pageSize: 1, condition: props.listCondition, isWait: true });
        if (commonUtils.isNotEmptyArr(returnData.slaveData)) {
          const returnState: any = await props.getAllData({ dataId: returnData.slaveData[0].id });
          dispatchModifyState({...returnState, listRowIndex});
        }

      } else if (key === 'copyToButton' || key === 'menu') {
        const { containerData, routeId } = props;
        if (commonUtils.isNotEmptyArr(containerData)) {
          const copyToData: any = {};
          for(const container of containerData) {
            copyToData[container.dataSetName + 'Data'] = props[container.dataSetName + 'Data'];
          }
          copyToData.config = key === 'menu' ? e.item.props.config : config;
          props.callbackAddPane(copyToData.config.popupActiveId, { handleType: 'add',
            listRouteId: routeId, listContainerId: props.listContainerId, listCondition: props.listCondition, listTableKey: props.listTableKey,
            listRowIndex: props.listRowTotal, listRowTotal: props.listRowTotal, copyToData });
        }
      }
    }

    const onFinish = async (values: any, childParams) => {
      const { commonModel, dispatch, masterData, tabId, dispatchModifyState } = props;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
      if (commonUtils.isNotEmptyObj(childParams) && childParams.childCallback) {
        const saveChildData = await childParams.childCallback({masterData});
        saveData.push(...saveChildData);
      }
      const params = { id: masterData.id, tabId, routeId: props.routeId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType };
      const url: string = `${application.urlMain}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        const returnChild: any = await childParams.getAllData(true);
        dispatchModifyState({...returnState, ...returnChild});
        props.gotoSuccess(dispatch, interfaceReturn);
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 20, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 30, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 50, disabled: props.enabled });
      buttonGroup.push({ key: 'firstButton', caption: '首条', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'priorButton', caption: '上一条', htmlType: 'button', sortNum: 70, disabled: props.enabled });
      buttonGroup.push({ key: 'nextButton', caption: '下一条', htmlType: 'button', sortNum: 80, disabled: props.enabled });
      buttonGroup.push({ key: 'lastButton', caption: '末条', htmlType: 'button', sortNum: 90, disabled: props.enabled });
      buttonGroup.push({ key: 'copyToButton', caption: '复制', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      return buttonGroup;
    }

    return <WrapComponent
      {...props}
      onButtonClick={onButtonClick}
      onFinish={onFinish}
      onSetForm={onSetForm}
      getButtonGroup={getButtonGroup}
    />
  };
};

export default commonDocEvent;






