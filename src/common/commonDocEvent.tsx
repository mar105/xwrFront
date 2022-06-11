import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";

const commonDocEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }

    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
        && props.commonModel.stompClient.connected) {
        const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturnResult);
        return () => {
          saveDataReturn.unsubscribe();
        };
      }

    }, [props.commonModel.stompClient]);


    const saveDataReturnResult = async (data) => {
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        if (props.isModal) {
          props.callbackRemovePane({...props.modalParams, newRecord: propsRef.current.masterData.id });
        } else {
          const returnState: any = await props.getAllData({ dataId: propsRef.current.masterData.id });
          dispatchModifyState({...returnState});
          if (commonUtils.isNotEmpty(props.listTabId)) {
            props.commonModel.stompClient.send('/websocket/saveDataReturn', {},
              JSON.stringify( { authorization: props.commonModel.token, tabId: props.listTabId, result: { code: 1 }} ));
          }
        }
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
        throw new Error(returnBody.msg);
      }
    }

    const onButtonClick = async (key, config, e, childParams) => {
      const { commonModel, tabId, dispatch, dispatchModifyState, masterContainer, masterData: masterDataOld, slaveData } = props;
      if (key === 'addButton') {
        const masterData = childParams && childParams.masterData ? childParams.masterData : props.onAdd();
        masterData.examineStatus = 'create';
        const addState = {};
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData, masterContainer));
        for(const container of props.containerData) {
          addState[container.dataSetName + 'Data'] = [];
          addState[container.dataSetName + 'ModifyData'] = [];
          addState[container.dataSetName + 'DelData'] = [];
        }
        dispatchModifyState({ ...addState, masterData, masterModifyData: {}, enabled: true, ...childParams });
      } else if (key === 'modifyButton') {
        const data = props.onModify();
        const masterData = {...masterDataOld, ...data };
        const url: string = application.urlPrefix + '/getData/getIsCanModify';
        const params = {id: masterData.id, tabId, routeId: props.routeId, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          dispatchModifyState({ masterData, masterModifyData: {}, enabled: true, ...childParams });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

      } else if (key === 'cancelButton') {
        if (masterDataOld.handleType === 'add') {
          // ------------清除复制从数据锁定数据。---------------------
          const originalSlaveIds: any = [];
          slaveData.forEach(slave => {
            if (commonUtils.isNotEmpty(slave.originalSlaveId)) {
              originalSlaveIds.push(slave.originalId + '_' + slave.originalSlaveId);
            }
          });
          if (commonUtils.isNotEmptyArr(originalSlaveIds)) {
            const url: string = application.urlCommon + '/verify/removeModifyingMulti';
            const params: any = {selectKeys: originalSlaveIds, groupId: commonModel.userInfo.groupId,
              shopId: commonModel.userInfo.shopId, tabId};
            const interfaceReturn = (await request.postRequest(url, props.commonModel.token, application.paramInit(params))).data;
            if (interfaceReturn.code !== 1) {
              props.gotoError(props.dispatch, interfaceReturn);
              return;
            }
          }
          //------------------------------------
          if (props.listRouteId) {
            const returnData: any = await props.getDataList({ name: 'slave', routeId: props.listRouteId, containerId: props.listContainerId, pageNum: props.listRowIndex <= 0 ? 1 : props.listRowIndex, pageSize: 1, condition: props.listCondition, isWait: true });
            if (commonUtils.isNotEmptyArr(returnData.slaveData)) {
              const returnState: any = await props.getAllData({ dataId: returnData.slaveData[0].id });
              dispatchModifyState({...returnState, listRowIndex: props.listRowIndex <= 0 ? 1 : props.listRowIndex});
            } else {
              props.callbackRemovePane(tabId);
            }
          } else {
            props.callbackRemovePane(tabId);
          }
        } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
          const {dispatch, commonModel, tabId, masterData} = props;
          // 清除复制从数据锁定数据。
          const originalSlaveIds: any = [];
          slaveData.filter(item => item.handleType === 'add').forEach(slave => {
            if (commonUtils.isNotEmpty(slave.originalSlaveId)) {
              originalSlaveIds.push(slave.originalId + '_' + slave.originalSlaveId);
            }
          });

          const url: string = application.urlCommon + '/verify/removeModifyingMulti';
          const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId, selectKeys: originalSlaveIds };
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            const returnState = await props.getAllData({dataId: masterDataOld.id });
            dispatchModifyState({ ...returnState, enabled: false, ...childParams });
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        }
      } else if (key === 'delButton' || key === 'invalidButton') {
        if (commonUtils.isNotEmpty(masterDataOld.id)) {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('master', [masterDataOld], [], [], true));
          if (childParams && childParams.childCallback) {
            const saveChildData = await childParams.childCallback({masterDataOld});
            saveData.push(...saveChildData);
          }
          const params = { id: masterDataOld.id, tabId, routeId: props.routeId, saveData, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId, handleType: key.replace('Button', '')};
          const url: string = application.urlPrefix + '/getData/saveData';
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
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({dataId: masterDataOld.id });
        dispatchModifyState({ ...returnState, enabled: false, pageLoading: false });
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
          const returnState: any = await props.getAllData({ dataId: returnData.slaveData[0][props.listTableKey] });
          dispatchModifyState({...returnState, listRowIndex});
        }

      } else if (key === 'copyToButton' || key === 'copyToMenu') {
        const { containerData, routeId } = props;
        if (commonUtils.isNotEmptyArr(containerData)) {
          const copyToData: any = {};
          for(const container of containerData) {
            copyToData[container.dataSetName + 'Data'] = props[container.dataSetName + 'Data'];
          }
          copyToData.config = key === 'copyToMenu' ? e.item.props.config : config;
          props.callbackAddPane(copyToData.config.popupActiveId, { handleType: 'add',
            listRouteId: routeId, listContainerId: props.listContainerId, listCondition: props.listCondition, listTableKey: props.listTableKey,
            listRowIndex: props.listRowTotal, listRowTotal: props.listRowTotal, copyToData });
        }
      } else if (key === 'examineButton' || key === 'cancelExamineButton') {
        if (commonUtils.isNotEmpty(masterDataOld.id)) {
          const saveData: any = [];
          // 审核时传入数据原因是需要审核后动作。
          saveData.push(commonUtils.mergeData('master', [masterDataOld], [], [], true));
          if (childParams && childParams.childCallback) {
            const saveChildData = await childParams.childCallback({masterDataOld});
            saveData.push(...saveChildData);
          }
          const params = { id: masterDataOld.id, tabId, routeId: props.routeId, saveData, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId, handleType: key.replace('Button', '')};
          const url: string = application.urlPrefix + '/getData/examineOrCancel';
          const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
          if (interfaceReturn.code === 1) {
            props.gotoSuccess(dispatch, interfaceReturn);
            let returnState: any = await props.getAllData({ dataId: masterDataOld.id });
            if (commonUtils.isNotEmptyObj(childParams) && childParams.getAllData) {
              const returnChild: any = await childParams.getAllData(true);
              returnState = {...returnState, ...returnChild};
            }
            dispatchModifyState({...returnState });
          } else {
            props.gotoError(dispatch, interfaceReturn);
          }
        } else {
          props.callbackRemovePane(tabId);
        }
      } else if (key === 'copyFromButton' || key === 'copyFromMenu') {
        const fromConfig = key === 'copyFromMenu' ? e.item.props.config : config;
        const condition = commonUtils.getCondition('master', masterDataOld, config.sqlCondition, props);

        const searchCondition: any = [];
        const searchRowKeys: any = [];
        const searchData: any = {};
        Object.keys(condition).forEach(key => {
          const value = commonUtils.isEmpty(condition[key]) ? '' : condition[key];
          if (commonUtils.isNotEmpty(value)) {
            searchRowKeys.push(key);
            searchCondition.push({fieldName: key, condition: '=', fieldValue: value});
            searchData['first' + key] = key;
            searchData['second' + key] = '=';
            searchData['third' + key] = value;
          }
        });

        // routeName配置的未清为commonList转换为selectList
        const dropParam = { name: 'slave', type: 'popupFrom', config: fromConfig, routeName: '/xwrBasic/selectList', onModalOk,
          state: { searchRowKeys, copyFromCondition: condition, slaveSearchCondition: searchCondition, searchData }  };
        props.onDropPopup(dropParam);
      }
    }

    const onFinish = async (values: any, childParams) => {
      const { commonModel, dispatch, masterData, masterModifyData, tabId, dispatchModifyState } = props;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }],
        commonUtils.isNotEmptyObj(masterModifyData) ? [masterModifyData] : [], []));
      if (commonUtils.isNotEmptyObj(childParams) && childParams.childCallback) {
        const saveChildData = await childParams.childCallback({masterData});
        saveData.push(...saveChildData);
      }
      const params = { id: masterData.id, tabId, routeId: props.routeId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType };
      const url: string = application.urlPrefix + '/getData/saveData';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        if (props.isModal) {
          props.callbackRemovePane({...props.modalParams, newRecord: masterData });
        } else {
          let returnState: any = await props.getAllData({ dataId: masterData.id });
          if (commonUtils.isNotEmptyObj(childParams) && childParams.getAllData) {
            //BusinessPermission用到
            const returnChild: any = await childParams.getAllData(true);
            returnState = {...returnState, ...returnChild};
          }
          dispatchModifyState({...returnState });
          //刷新列表数据
          if (commonUtils.isNotEmpty(props.listTabId)) {
            props.commonModel.stompClient.send('/websocket/saveDataReturn', {},
              JSON.stringify( { authorization: props.commonModel.token, tabId: props.listTabId, result: { code: 1 }} ));
          }
        }
        props.gotoSuccess(dispatch, interfaceReturn);
        return 1;
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    const getButtonGroup = () => {
      const { masterData: masterDataOld, masterContainer } = props;
      const masterData = commonUtils.isEmptyObj(masterDataOld) ? {} : masterDataOld;
      const { isInvalid } = masterData;
      let { isExamine } = masterData;
      const buttonGroup: any = [];

      // 审核按钮配置不显示认为没有审核功能。
      if (commonUtils.isNotEmptyObj(masterContainer)) {
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'examineButton');
        if (index > -1) {
          isExamine = isExamine && masterContainer.slaveData[index].isVisible;
        } else {
          isExamine = isExamine;
        }
      }

      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 20, disabled: props.enabled || isInvalid || isExamine });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 30, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 50, disabled: props.enabled || isExamine });
      buttonGroup.push({ key: 'examineButton', caption: '审核', htmlType: 'button', sortNum: 60, disabled: props.enabled || isExamine });
      buttonGroup.push({ key: 'cancelExamineButton', caption: '消审', htmlType: 'button', sortNum: 70, disabled: props.enabled || !isExamine });

      buttonGroup.push({ key: 'firstButton', caption: '首条', htmlType: 'button', sortNum: 80, disabled: props.enabled });
      buttonGroup.push({ key: 'priorButton', caption: '上一条', htmlType: 'button', sortNum: 90, disabled: props.enabled });
      buttonGroup.push({ key: 'nextButton', caption: '下一条', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      buttonGroup.push({ key: 'lastButton', caption: '末条', htmlType: 'button', sortNum: 110, disabled: props.enabled });
      buttonGroup.push({ key: 'copyToButton', caption: '复制', htmlType: 'button', sortNum: 120, disabled: props.enabled });
      buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 130, disabled: props.enabled || isInvalid || isExamine });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 140, disabled: props.enabled });
      return buttonGroup;
    }

    const onDataChange = (params) => {
      const { name, fieldName, record, isWait } = params;
      let returnData = props.onDataChange({...params, isWait: true});
      returnData = calcOperation({name, fieldName, record, returnData});
      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const calcOperation = (params) => {
      const {name, fieldName, record, returnData } = params;
      const { [name + 'Container']: container } = props;
      //产品计算
      if (typeof returnData[name + 'Data'] === 'object' && returnData[name + 'Data'].constructor === Object) {
        if (fieldName === 'customerName' || fieldName === 'settleName') {
          let settleDate = commonUtils.getSettleDate(returnData[name + 'Data']);
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], settleDate};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], settleDate} : returnData[name + 'ModifyData'];
        } else if (container.containerModel.includes('/product') && (fieldName === 'measureQty' || fieldName === 'productName' || fieldName === 'productStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'],'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'],'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...convertCalcData};
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, returnData[name + 'Data'],'product', fieldName, 'costMoney');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...moneyCalcData};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], ...qtyCalcData, ...convertCalcData, ...moneyCalcData} : returnData[name + 'ModifyData'];
        }
        //材料计算
        else if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'],'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'],'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...convertCalcData};
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, returnData[name + 'Data'],'material', fieldName, 'costMoney');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...moneyCalcData};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], ...qtyCalcData, ...convertCalcData, ...moneyCalcData} : returnData[name + 'ModifyData'];
        }

        //工艺计算
        else if (container.containerModel.includes('/process') && (fieldName === 'measureQty' || fieldName === 'processName' || fieldName === 'processStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'],'process', 'measureQty', 'processQty', 'measureToProcessFormulaId', 'measureToProcessCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'],'process', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...convertCalcData};
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, returnData[name + 'Data'],'process', fieldName, 'costMoney');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...moneyCalcData};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], ...qtyCalcData, ...convertCalcData, ...moneyCalcData} : returnData[name + 'ModifyData'];
        }

        // 主表仓库数据带到从表
        else if (fieldName === 'warehouseLocationName') {
          const { slaveData: slaveDataOld, slaveModifyData: slaveModifyDataOld } = propsRef.current;
          const slaveData: any = [];
          const slaveModifyData: any = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          if (commonUtils.isNotEmptyObj(slaveDataOld)) {
            slaveDataOld.forEach(slaveOld => {
              const warehoseLocationData = { warehouseLocationName: returnData[name + 'Data'].warehouseLocationName, warehouseLocationCode: returnData[name + 'Data'].warehouseLocationCode, warehouseLocationId: returnData[name + 'Data'].warehouseLocationId };
              const slave = {...slaveOld, handleType: commonUtils.isEmpty(slaveOld.handleType) ? 'modify' : slaveOld.handleType, ...warehoseLocationData};
              slaveData.push(slave);
              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = { ...slaveModifyData[indexModify], ...warehoseLocationData };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, ...warehoseLocationData });
                }
              }
            });
            returnData.slaveData = slaveData;
            returnData.slaveModifyData = slaveModifyData;
          }
        }
        if (form) {
          form.setFieldsValue(commonUtils.setFieldsValue(returnData[name + 'Data'], props[name + 'Container']));
        }
      } else {
        let dataRow: any = {};
        if (container.isTree) {
          dataRow = props.getTreeNode(returnData[name + 'Data'], record.allId);
          props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
        } else {
          const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
          if (index > -1) {
            dataRow = returnData[name + 'Data'][index];
          }
        }
        //产品计算
        if (container.containerModel.includes('/product') && (fieldName === 'measureQty' || fieldName === 'measureGiveQty' || fieldName === 'measureStockUpQty' || fieldName === 'productName' || fieldName === 'productStyle')) {
          if (fieldName === 'measureQty' || fieldName === 'productName' || fieldName === 'productStyle') {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = { ...dataRow, ...convertCalcData};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
              }
            }
          }

          if (fieldName === 'measureGiveQty' || fieldName === 'productName' || fieldName === 'productStyle') {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'product', 'measureGiveQty', 'productGiveQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'product', 'measureGiveQty', 'convertGiveQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = { ...dataRow, ...convertCalcData};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
              }
            }
          }
          if (fieldName === 'measureStockUpQty' || fieldName === 'productName' || fieldName === 'productStyle') {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'product', 'measureStockUpQty', 'productStockUpQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'product', 'measureStockUpQty', 'convertStockUpQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = { ...dataRow, ...convertCalcData};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
              }
            }
          }

        }

        //材料计算
        else if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'measureGiveQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
          if (fieldName === 'measureQty' || fieldName === 'productName' || fieldName === 'productStyle') {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = { ...dataRow, ...convertCalcData};
            dataRow = { ...dataRow};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
              }
            }
          }

          if (fieldName === 'measureGiveQty' || fieldName === 'productName' || fieldName === 'productStyle') {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'material', 'measureGiveQty', 'materialGiveQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'material', 'measureGiveQty', 'convertGiveQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = { ...dataRow, ...convertCalcData};
            dataRow = { ...dataRow};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
              }
            }
          }
        }

        //工艺计算
        else if (container.containerModel.includes('/process') && (fieldName === 'measureQty' || fieldName === 'processName' || fieldName === 'processStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'process', 'measureQty', 'processQty', 'measureToProcessFormulaId', 'measureToProcessCoefficient');
          dataRow = { ...dataRow, ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'process', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          dataRow = { ...dataRow, ...convertCalcData};
          dataRow = { ...dataRow};
          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData };
            }
          }
        }




        //算完数量后还需要计算金额价格。
        //产品计算
        // isWhole 外协整单放入成品一起计算
        if (container.containerModel.includes('/product') && (fieldName === 'measureQty' || fieldName === 'productQty' || fieldName === 'convertQty'
          || fieldName === 'productName' || fieldName === 'productStyle'
          || fieldName === 'productStdPrice' || fieldName === 'costPrice'
          || fieldName === 'processStdPrice')) {
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'product', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          const isWhole = container.containerModel.includes('/productWhole');
          let wholeMoneyCalcData = {};
          if (isWhole) {
            wholeMoneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'product', fieldName, isWhole);
            dataRow = { ...dataRow, ...wholeMoneyCalcData};
          }

          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData, ...wholeMoneyCalcData };
            }
          }
        }
        else if (container.containerModel.includes('/product') && (fieldName === 'productStdMoney'
          || fieldName === 'knifePlateMoney' || fieldName === 'makePlateMoney' || fieldName === 'proofingMoney' || fieldName === 'freightMoney' || fieldName === 'businessMoney'
          || fieldName === 'costMoney' || fieldName === 'taxName')) {
          const moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, dataRow,'product', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          const isWhole = container.containerModel.includes('/productWhole');
          let wholeMoneyCalcData = {};
          if (isWhole) {
            wholeMoneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, dataRow,'product', fieldName, isWhole);
            dataRow = { ...dataRow, ...wholeMoneyCalcData};
          }

          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData, ...wholeMoneyCalcData };
            }
          }
        }


        //材料计算
        else if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialQty' || fieldName === 'convertQty'
          || fieldName === 'materialName' || fieldName === 'materialStyle'
          || fieldName === 'materialStdPrice' || fieldName === 'costPrice')) {
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'material', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
            }
          }
        }
        else if (container.containerModel.includes('/material') && (fieldName === 'materialStdMoney' || fieldName === 'costMoney' || fieldName === 'taxName')) {
          const moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, dataRow,'material', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
            }
          }
        }


        //工艺计算
        else if (container.containerModel.includes('/process') && (fieldName === 'measureQty' || fieldName === 'processQty' || fieldName === 'convertQty'
          || fieldName === 'processName' || fieldName === 'processStyle'
          || fieldName === 'processStdPrice' || fieldName === 'costPrice')) {
          const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'process', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
            }
          }
        }
        else if (container.containerModel.includes('/process') && (fieldName === 'processStdMoney' || fieldName === 'costMoney' || fieldName === 'taxName')) {
          const moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, dataRow,'process', fieldName);
          dataRow = { ...dataRow, ...moneyCalcData};
          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
            }
          }
        }

        if (container.isTree) {
          props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
        } else {
          const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
          if (index > -1) {
            returnData[name + 'Data'][index] = dataRow;
          }
        }
      }
      return returnData;
    }

    const onModalOk = async (params, isWait) => {
      if (commonUtils.isEmpty(params)) {
        props.dispatchModifyState({ modalVisible: false });
        return;
      }
      const name = params.name;
      const { commonModel, dispatch, [name + 'Container']: container, masterModifyData: masterModifyDataOld, masterData: masterDataOld, [name + 'Data']: dataOld }: any = propsRef.current;

      //复制从功能处理。
      if (params.type === 'popupFrom' && name === 'slave' && commonUtils.isNotEmptyArr(params.selectList)) {
        const assignField = params.config.assignField;
        const data = [...dataOld];
        const addState: any = {};


        //校验选择框选择数据是否相同
        const sqlConditionNew: any = [];
        params.config.sqlCondition.split(',').forEach(condition => {
          if (condition.split('.').length > 2) {
            sqlConditionNew.push(condition.split('.')[0] + '.' + condition.split('.')[2]);
          } else if (condition.split('.').length > 1) {
            sqlConditionNew.push(condition.split('.')[0] + '.' + condition.split('.')[1]);
          }
        });
        const conditionSelect = commonUtils.getCondition('master', params.selectList[0], sqlConditionNew.toString(), props);
        let selectListFilter: any = [...params.selectList];
        for(const key of Object.keys(conditionSelect)) {
          selectListFilter = selectListFilter.filter(item =>  item[key] === conditionSelect[key]);
        }
        if (selectListFilter.length != params.selectList.length) {
          const index = commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseSameMasterData');
          if (index > -1) {
            props.gotoError(dispatch, { code: '6001', msg: commonModel.commonConstant[index].viewName });
          } else {
            props.gotoError(dispatch, { code: '6001', msg: '请选择相同主表数据！' });
          }
          return;
        }

        const originalSlaveIds: any = [];
        params.selectList.forEach(slave => {
          if (commonUtils.isNotEmpty(slave.id)) {
            originalSlaveIds.push(slave.masterId + '_' + slave.id);
          }
          if (commonUtils.isNotEmptyObj(params.selectNestContainer)) {
            //嵌套表数据加入
            params.selectNestList.filter(item => item[params.selectNestContainer.treeSlaveKey] === slave[params.selectNestContainer.treeKey]).forEach(nest => {
              if (commonUtils.isNotEmpty(nest.id)) {
                originalSlaveIds.push(nest.masterId + '_' + nest.id);
              }
            });
          }
          else if (commonUtils.isNotEmptyArr(slave.children)) {
            //子表数据加入
            slave.children.forEach(child => {
              if (commonUtils.isNotEmpty(child.id)) {
                originalSlaveIds.push(child.masterId + '_' + child.id);
              }
            });
          }
        });
        const url: string = application.urlCommon + '/verify/isExistModifyingMulti';
        const paramsModify: any = {selectKeys: originalSlaveIds, groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId, tabId: props.tabId};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(paramsModify))).data;
        if (interfaceReturn.code !== 1) {
          props.gotoError(dispatch, interfaceReturn);
          return;
        }

        //复制从时，从表没有数据，直接覆盖主表数据。
        if (commonUtils.isEmptyArr(data)) {
          const assignValue = commonUtils.getAssignFieldValue(name, assignField, params.selectList[0], propsRef.current);
          const masterData = { ...masterDataOld, ...assignValue };
          addState.masterData = masterData;
          const masterModifyData = masterData.handleType === 'modify' ?
            commonUtils.isEmptyObj(masterModifyDataOld) ? { id: masterData.id, handleType: masterData.handleType, ...assignValue } :
              { ...masterModifyDataOld, id: masterData.id, ...assignValue } : masterModifyDataOld;
          addState.masterModifyData = masterModifyData;
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(masterData, props.masterContainer));
        }

        const index = commonUtils.isEmptyArr(params.config.children) ? -1 : params.config.children.findIndex(item => item.fieldName === params.config.fieldName + '.slave');
        const assignFieldSlave = index > -1 ? params.config.children[index].assignField : '';
        const nestIndex = commonUtils.isEmptyArr(params.config.children) ? -1 : params.config.children.findIndex(item => item.fieldName === params.config.fieldName + '.slaveNest');
        const nestAssignFieldSlave = nestIndex > -1 ? params.config.children[nestIndex].assignField : '';

        params.selectList.forEach((selectItem, selectIndex) => {
          const assignValue = commonUtils.getAssignFieldValue(name, assignFieldSlave, selectItem, propsRef.current);
          const rowData = { ...props.onAdd(container), ...assignValue, superiorId: masterDataOld.id };
          rowData.allId = rowData.id;
          if (commonUtils.isNotEmptyObj(params.selectNestContainer)) {
            //嵌套表数据加入
            const nestData: any = [];
            params.selectNestList.filter(item => item[params.selectNestContainer.treeSlaveKey] === selectItem[params.selectNestContainer.treeKey]).forEach(nest => {
              const nestAssignValue = commonUtils.getAssignFieldValue(name, nestAssignFieldSlave, nest, propsRef.current);
              const rowNestData = { ...props.onAdd(container), ...nestAssignValue, superiorId: masterDataOld.id, slaveSuperiorId: rowData.id };
              rowNestData.allId = rowData.id + ',' + rowNestData.id;
              nestData.push(rowNestData);
            });

            if (commonUtils.isNotEmptyArr(nestData)) {
              rowData.children = nestData;
            }
          }
          else if (commonUtils.isNotEmptyArr(selectItem.children)) {
            //子表数据加入
            const childrenData: any = [];
            selectItem.children.forEach(child => {
              const childAssignValue = commonUtils.getAssignFieldValue(name, assignFieldSlave, child, propsRef.current);
              const rowChildData = { ...props.onAdd(container), ...childAssignValue, superiorId: masterDataOld.id, slaveSuperiorId: rowData.id };
              rowChildData.allId = rowData.id + ',' + rowChildData.id;
              childrenData.push(rowChildData);
            });

            rowData.children = childrenData;
          }
          data.push(rowData);
        });

        if (isWait) {
          return { [name + 'Data']: data, ...addState, modalVisible: false };
        } else {
          props.dispatchModifyState({ [name + 'Data']: data, ...addState, modalVisible: false });
        }
      } else {
        props.onModalOk(params);
      }
    }


    return <div>
      <WrapComponent
        {...props}
        onButtonClick={onButtonClick}
        onFinish={onFinish}
        onSetForm={onSetForm}
        getButtonGroup={getButtonGroup}
        onDataChange={onDataChange}
        onModalOk={onModalOk}
      />
    </div>
  };
};

export default commonDocEvent;






