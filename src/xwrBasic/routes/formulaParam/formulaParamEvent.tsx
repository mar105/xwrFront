import * as React from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import {useEffect} from "react";

const categoryListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
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
        const returnState = await props.getAllData();
        dispatchModifyState({ ...returnState });
        props.gotoSuccess(dispatch, returnBody);
      }
    }

    const onButtonClick = async (key, config, e) => {
      const { dispatch, dispatchModifyState, commonModel, tabId, slaveSelectedRows, masterContainer, categoryContainer, categoryDelData: categoryDelDataOld } = props;
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
        const categoryData: any = [];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaCategory');
        if (index > -1 && masterContainer.slaveData[index].viewDrop) {
          const formulaCategory = commonUtils.objectToArr(commonUtils.stringToObj(masterContainer.slaveData[index].viewDrop));
          formulaCategory.forEach(item => {
            const data = props.onAdd();
            data.superiorId = masterData.id;
            data.paramCategory = item.id;
            data.sortNum = index;
            categoryData.push(data);
          });
        }
        dispatchModifyState({ masterData, categoryData, masterIsVisible: true, enabled: true });
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
        const categoryData: any = [];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaCategory');
        if (index > -1 && masterContainer.slaveData[index].viewDrop) {
          const formulaCategory = commonUtils.objectToArr(commonUtils.stringToObj(masterContainer.slaveData[index].viewDrop));
          formulaCategory.forEach(item => {
            const data = props.onAdd();
            data.superiorId = masterData.id;
            data.paramCategory = item.id;
            data.sortNum = index;
            categoryData.push(data);
          });
        }
        dispatchModifyState({ masterData, categoryData, masterIsVisible: true, enabled: true });
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
          let addState: any = {};
          let masterData = await props.getDataOne({ containerId: masterContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
          masterData = {...masterData, ...data };
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(masterData));
          let returnData = await props.getDataList({ name: 'category', containerId: categoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
          addState = {...addState, ...returnData};
          const categoryData: any = [];
          const categoryDataOld: any = [...addState.categoryData];
          const categorySelectedRowKeys: any = [];
          addState.categoryData.forEach(item => {
            categorySelectedRowKeys.push(item[categoryContainer.tableKey]);
          });
          const categoryDelData: any = commonUtils.isEmptyArr(categoryDelDataOld) ? [] : [...categoryDelDataOld];
          const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaCategory');
          if (index > -1 && masterContainer.slaveData[index].viewDrop) {
            const formulaCategory = commonUtils.objectToArr(commonUtils.stringToObj(masterContainer.slaveData[index].viewDrop));
            let rowIndex = 0;
            for(const dataRow of categoryDataOld) {
              const index = formulaCategory.findIndex(item => item.id === dataRow.paramCategory);
              if (!(index > -1)) {
                dataRow.handleType = 'del';
                categoryDelData.push(dataRow);
                categoryDataOld.splice(rowIndex, 1);
              }
              rowIndex += 1;
            }

            formulaCategory.forEach((dataRow, index)  => {
              const indexCategory = categoryDataOld.findIndex(item => item.paramCategory === dataRow.id);
              if (!(indexCategory > -1)) {
                const data = props.onAdd();
                data.superiorId = masterData.id;
                data.paramCategory = dataRow.id;
                data.sortNum = index;
                categoryData.push(data);
              } else {
                categoryData.push(categoryDataOld[indexCategory]);
              }
            });
            addState.categoryData = categoryData;
          }
          dispatchModifyState({ masterData, ...addState, categoryDelData, categorySelectedRowKeys, masterIsVisible: true, enabled: true });
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
        const returnData = await props.getDataList({ name: 'category', containerId: categoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        saveData.push(commonUtils.mergeData('category', returnData.categoryData, [], true));
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
        const { commonModel, dispatch, masterData, categoryData: categoryDataOld, categorySelectedRowKeys: categorySelectedRowKeysOld, categoryDelData, tabId } = props;
        const saveData: any = [];
        saveData.push(commonUtils.mergeData("master", [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
        const categorySelectedRowKeys = commonUtils.isEmptyArr(categorySelectedRowKeysOld) ? [] : categorySelectedRowKeysOld;
        const categoryData = [...categoryDataOld];
        for(const category of categoryData) {
          if (!(categorySelectedRowKeys.findIndex(item => item === category.paramCategory) > -1)) {
            if (category.handleType === 'add') {
              delete category.handleType;
            } else {
              category.handleType = 'del';
            }
          }
        }
        saveData.push(commonUtils.mergeData("category", categoryData.filter(item => commonUtils.isNotEmpty(item.handleType)), categoryDelData, true));
        const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
        const url: string = `${application.urlMain}/getData/saveData`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          const returnState = await props.getAllData({ testMongo: true });
          dispatchModifyState({ masterIsVisible: false, enabled: false, ...returnState });
          props.gotoSuccess(dispatch, interfaceReturn);
        } else {
          props.gotoError(dispatch, interfaceReturn);
          return;
        }
      } catch (errorInfo) {
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