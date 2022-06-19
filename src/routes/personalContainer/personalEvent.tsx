import React, {useEffect, useRef} from 'react';
import * as application from "../../application";
import * as request from "../../utils/request";
import * as commonUtils from "../../utils/commonUtils";

const personalEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const onDataChange = (params) => {
      const { name, fieldName, fieldType, record, isWait } = params;
      const { commonModel, setPersonalData: setPersonalDataOld } = propsRef.current;

      const setPersonalData = commonUtils.isNotEmptyArr(setPersonalDataOld) ? setPersonalDataOld : [];
      let returnData = props.onDataChange({...params, isWait: true});
      if (typeof returnData[name + 'Data'] === 'object' && returnData[name + 'Data'].constructor === Object) {
        for(const key of Object.keys(returnData[name + 'ModifyData'])) {
          if (key === 'id' || key === 'handleType') continue;
          const index = setPersonalData.findIndex(item => item.keyType === 'containerMaster' && item.keyName === returnData[name + 'ModifyData'].id  && item.keyFieldName === fieldName);
          if (index > -1) {
            setPersonalData[index].handleType = commonUtils.isEmpty(setPersonalData[index].handleType) ? 'modify': setPersonalData[index].handleType;
            setPersonalData[index].keyValue = returnData[name + 'ModifyData'][key];
          } else {
            const dataRow = {id: commonUtils.newId(), keyType: 'containerMaster', handleType: 'add', routeId: commonModel.userInfo.shopId, groupId: commonModel.userInfo.groupId,
              shopId: commonModel.userInfo.shopId, userId: commonModel.userInfo.userId,
              originalRouteId: returnData[name + 'Data'].superiorId, originalContainerId: returnData[name + 'Data'].id,
              keyName: returnData[name + 'ModifyData'].id, keyFieldName: fieldName, keyFieldType: fieldType, keyValue: returnData[name + 'ModifyData'][fieldName], sortNum: 1};
            setPersonalData.push(dataRow);
          }
        }
        returnData.setPersonalData = setPersonalData;
      } else {
        const indexData = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (indexData > -1) {
          if (returnData[name + 'Data'][indexData].handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              for(const key of Object.keys(returnData[name + 'ModifyData'][indexModify])) {
                if (key === 'id' || key === 'handleType') continue;
                const index = setPersonalData.findIndex(item => item.keyType === 'containerSlave' && item.originalContainerId === propsRef.current.masterData.id && item.keyName === returnData[name + 'Data'][indexData].fieldName && item.keyFieldName === fieldName);
                if (index > -1) {
                  setPersonalData[index].handleType = commonUtils.isEmpty(setPersonalData[index].handleType) ? 'modify': setPersonalData[index].handleType;
                  setPersonalData[index].keyValue = returnData[name + 'ModifyData'][indexModify][key];
                } else {
                  const dataRow = {id: commonUtils.newId(), keyType: 'containerSlave', handleType: 'add', routeId: commonModel.userInfo.shopId, groupId: commonModel.userInfo.groupId,
                    shopId: commonModel.userInfo.shopId, userId: commonModel.userInfo.userId,
                    originalRouteId: propsRef.current.masterData.superiorId, originalContainerId: propsRef.current.masterData.id,
                    keyName: returnData[name + 'Data'][indexData].fieldName, keyFieldName: fieldName, keyFieldType: fieldType, keyValue: returnData[name + 'ModifyData'][indexModify][fieldName], sortNum: 1};
                  setPersonalData.push(dataRow);
                }
              }
              returnData.setPersonalData = setPersonalData;
            }

          } else if (returnData[name + 'Data'][indexData].handleType === 'add') {
            for(const key of Object.keys(returnData[name + 'Data'][indexData])) {
              if (key === 'handleType') continue;
              const index = setPersonalData.findIndex(item => item.keyType === 'containerSlave' && item.originalContainerId === propsRef.current.masterData.id && item.keyName === returnData[name + 'Data'][indexData].fieldName && item.keyFieldName === fieldName);
              if (index > -1) {
                setPersonalData[index].handleType = commonUtils.isEmpty(setPersonalData[index].handleType) ? 'modify': setPersonalData[index].handleType;
                setPersonalData[index].keyValue = returnData[name + 'Data'][indexData][key];
              } else {
                const dataRow = {id: commonUtils.newId(), keyType: 'containerSlave', handleType: 'add', routeId: commonModel.userInfo.shopId, groupId: commonModel.userInfo.groupId,
                    shopId: commonModel.userInfo.shopId, userId: commonModel.userInfo.userId,
                  originalRouteId: propsRef.current.masterData.superiorId, originalContainerId: propsRef.current.masterData.id,
                  keyName: returnData[name + 'Data'][indexData].fieldName, keyFieldName: fieldName, keyFieldType: fieldType, keyValue: returnData[name + 'Data'][indexData][fieldName], sortNum: 1};
                setPersonalData.push(dataRow);
              }

            }
            returnData.setPersonalData = setPersonalData;
          }
        }
      }

      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const onFinish = async (values: any, childParams) => {
      const { commonModel, dispatch, masterData, setPersonalData, tabId, dispatchModifyState } = propsRef.current;
      const saveData: any = [];
      saveData.push({ name: 'slave', data: setPersonalData });
      const params = { id: masterData.id, tabId, routeId: masterData.superiorId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType };
      const url: string = application.urlPrefix + '/personal/savePersonal';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        props.gotoSuccess(dispatch, interfaceReturn);
        props.callbackRemovePane({...props.modalParams});
        return 1;
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    const onButtonClick = async (key, e) => {
      const { commonModel, tabId, dispatch, dispatchModifyState, masterData: masterDataOld } = propsRef.current;
      if (key === 'modifyButton') {
        const data = props.onModify();
        const masterData = {...masterDataOld, ...data };
        const url: string = application.urlCommon + '/verify/isExistModifying';
        const params = {id: masterData.id, tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          dispatchModifyState({ masterData, masterModifyData: {}, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'cancelButton') {
        props.callbackRemovePane();
      } else if (key === 'syncToMongoButton') {
        const masterData = {...masterDataOld };
        if (commonUtils.isEmpty(masterData.virtualName)) {
          props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
          return;
        }
        const { stompClient } = commonModel;
        const params = { routeId: masterData.superiorId, containerId: masterData.id };
        stompClient.send('/websocket/container/syncToMongo', {}, JSON.stringify(application.paramInit(params)));
      } else if (key === 'syncToMongoIndexButton') {
        const masterData = {...masterDataOld };
        if (commonUtils.isEmpty(masterData.virtualName)) {
          props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
          return;
        }
        if (commonUtils.isEmpty(masterData.virtualIndex)) {
          props.gotoError(dispatch, { code: '6003', msg: '虚拟索引不能为空！' });
          return;
        }
        const { stompClient } = commonModel;
        const params = { routeId: masterData.superiorId, containerId: masterData.id, virtualName: masterData.virtualName, virtualIndex: masterData.virtualIndex, tableKey: masterData.tableKey };
        stompClient.send('/websocket/container/syncToMongoIndex', {}, JSON.stringify(application.paramInit(params)));

      } else if (key === 'dropCollectionMongoButton') {
        const masterData = {...masterDataOld };
        if (commonUtils.isEmpty(masterData.virtualName)) {
          props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
          return;
        }
        const { stompClient } = commonModel;
        const params = { routeId: masterData.superiorId, containerId: masterData.id, virtualName: masterData.virtualName };
        stompClient.send('/websocket/container/dropCollectionMongo', {}, JSON.stringify(application.paramInit(params)));

      }
    }

    const delPersonalClick =(name, fieldName, keyName) => {
      const { masterData, setPersonalData: setPersonalDataOld, dispatchModifyState } = propsRef.current;
      const setPersonalData = commonUtils.isNotEmptyArr(setPersonalDataOld) ? [...setPersonalDataOld] : [];
      if (name === 'master') {
        const index = setPersonalData.findIndex(item => item.keyType === 'containerMaster' && item.keyName === masterData.id && item.keyFieldName === fieldName);
        if (index > -1) {
          setPersonalData[index] = {...setPersonalData[index], handleType: 'del' };
          dispatchModifyState({ setPersonalData });
        }
      } else {
        const index = setPersonalData.findIndex(item => item.keyType === 'containerSlave' && item.originalContainerId === masterData.id && item.keyName === keyName && item.keyFieldName === fieldName);
        if (index > -1) {
          setPersonalData[index] = {...setPersonalData[index], handleType: 'del' };
          dispatchModifyState({ setPersonalData });
        }
      }
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'syncToMongoButton', caption: '同步到mongo数据', htmlType: 'button', onClick: onButtonClick, sortNum: 101, disabled: props.enabled });
      return buttonGroup;
    }

    return <WrapComponent
      {...props}
      onDataChange={onDataChange}
      onButtonClick={onButtonClick}
      getButtonGroup={getButtonGroup}
      onFinish={onFinish}
      delPersonalClick={delPersonalClick}
    />
  };
};

export default personalEvent;






