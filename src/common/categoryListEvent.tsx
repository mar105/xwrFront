import * as React from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../xwrBasic/application";
import * as request from "../utils/request";
import {useEffect} from "react";
import {useRef} from "react";

const categoryListEvent = (WrapComponent) => {
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
        const saveAfterSyncToMongo = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveAfterSyncToMongo', saveAfterSyncToMongoResult);
        // @ts-ignore
        const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturnResult);
        return () => {
          saveAfterSyncToMongo.unsubscribe();
          saveDataReturn.unsubscribe();
        };
      }
    }, [props.commonModel.stompClient]);

    const saveAfterSyncToMongoResult = async (data) => {
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState = await props.getAllData({ pageNum: 1 });
        dispatchModifyState({ ...returnState, pageLoading: false });
        props.gotoSuccess(dispatch, returnBody);
      }
    }

    const saveDataReturnResult = async (data) => {
      const { dispatch, dispatchModifyState, slaveContainer } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        let addState = {};
        if (commonUtils.isEmpty(slaveContainer.virtualName)) {
          const returnState: any = await props.getAllData({ dataId: masterDataRef.current.id });
          addState = { ...returnState};
        }
        dispatchModifyState({...addState, pageLoading: false, masterIsVisible: false, enabled: false });
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
        throw new Error(returnBody.msg);
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
            masterData = {...masterData, ...commonUtils.getAssignFieldValue('master', config.assignField, slaveSelectedRows[0])}
          }
        } else {
          masterData.allId = masterData.id;
        }
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData, masterContainer));

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
          masterData = {...masterData, ...commonUtils.getAssignFieldValue('master', config.assignField, slaveSelectedRows[0])}
        }
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData, masterContainer));
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

        const url: string = application.urlCommon + '/verify/isExistModifying';
        const params = {id: slaveSelectedRows[0].id, tabId, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const data = props.onModify();
          let masterData = await props.getDataOne({ containerId: masterContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
          masterData = {...masterData, ...data };
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(masterData, masterContainer));
          let addState = {};
          if (childParams && childParams.childCallback) {
            addState = await childParams.childCallback({masterData});
          }
          dispatchModifyState({ masterData, ...addState, masterModifyData: {}, masterIsVisible: true, enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'delButton' || key === 'invalidButton') {
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
        saveData.push(commonUtils.mergeData('master', [slaveSelectedRows[0]], [], [], true));
        if (childParams && childParams.childCallback) {
          const saveChildData = await childParams.childCallback({masterData});
          saveData.push(...saveChildData);
        }

        const params = { id: slaveSelectedRows[0].id, tabId, routeId: props.routeId, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId,  saveData, handleType: key.replace('Button', '') };
        const url: string = application.urlMain + '/getData/saveData';
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          props.gotoSuccess(dispatch, interfaceReturn);
          const returnState = await props.getAllData({ pageNum: 1});
          dispatchModifyState({ ...returnState, slaveSelectedRows: [], slaveSelectedRowKeys: [] });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState });
      }
    }
    const onDrawerCancel = async (e) => {
      const { dispatchModifyState } = props;
      const {dispatch, commonModel, tabId, masterData} = props;
      const url: string = application.urlCommon + '/verify/removeModifying';
      const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({masterIsVisible: false, enabled: false});
        if (props.isModal) {
          props.callbackRemovePane();
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

    }

    const onDrawerOk = async (e, childParams) => {
      const { dispatchModifyState, commonModel, dispatch, masterData, masterModifyData, tabId } = props;
      // const values = await form.validateFields();
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }],
        commonUtils.isNotEmptyObj(masterModifyData) ? [masterModifyData] : [], []));
      if (childParams && childParams.childCallback) {
        const saveChildData = await childParams.childCallback({masterData});
        saveData.push(...saveChildData);
      }
      const params = { id: masterData.id, tabId, routeId: props.routeId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType };
      const url: string = application.urlMain + '/getData/saveData';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        if (props.isModal) {
          dispatchModifyState({masterIsVisible: false, enabled: false});
          props.callbackRemovePane({...props.modalParams, newRecord: masterData });
        } else {
          const returnState = await props.getAllData({testMongo: true, pageNum: 1});
          dispatchModifyState({masterIsVisible: false, enabled: false, ...returnState});
        }
        props.gotoSuccess(dispatch, interfaceReturn);
        return 1;
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return 0;
      }
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      return buttonGroup;
    }

    const onTableChange = async (name, pagination, filters, sorterInfo, extra) => {
      const {dispatchModifyState, [name + 'Container']: container, [name + 'SearchCondition']: searchCondition } = props;
      dispatchModifyState({[name + 'Loading']: true });
      const returnData: any = await props.getDataList({ name, containerId: container.id, pageNum: container.isTree === 1 ? undefined : 1, condition: { searchCondition, sorterInfo }, isWait: true });
      const addState = {...returnData, [name + 'SorterInfo']: sorterInfo};
      dispatchModifyState({...addState});
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onDrawerOk={onDrawerOk}
      onDrawerCancel={onDrawerCancel}
      onButtonClick={onButtonClick}
      getButtonGroup={getButtonGroup}
      onTableChange={onTableChange}
      />
  };
};

export default categoryListEvent;