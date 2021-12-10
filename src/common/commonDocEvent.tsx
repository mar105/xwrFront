import * as React from "react";
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import {useRef} from "react";
import CommonModal from "./commonModal";
import moment from 'moment';

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
        // @ts-ignore
        const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturn);
        return () => {
          saveDataReturn.unsubscribe();
        };
      }

    }, [props.commonModel.stompClient]);

    // @ts-ignore
    const saveDataReturn = async (data) => {
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        if (props.isModal) {
          props.callbackRemovePane({...props.modalParams, newRecord: propsRef.current.masterData.id });
        } else {
          const returnState: any = await props.getAllData({ dataId: propsRef.current.masterData.id });
          dispatchModifyState({...returnState});
        }
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
        throw new Error(returnBody.msg);
      }
    }




    const onButtonClick = async (key, config, e, childParams) => {
      const { commonModel, tabId, dispatch, dispatchModifyState, masterContainer, masterData: masterDataOld } = props;
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
        const url: string = `${application.urlPrefix}/getData/getIsCanModify`;
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
          if (props.listRouteId) {
            const returnData: any = await props.getDataList({ name: 'slave', routeId: props.listRouteId, containerId: props.listContainerId, pageNum: props.listRowIndex, pageSize: 1, condition: props.listCondition, isWait: true });
            if (commonUtils.isNotEmptyArr(returnData.slaveData)) {
              const returnState: any = await props.getAllData({ dataId: returnData.slaveData[0].id });
              dispatchModifyState({...returnState, listRowIndex: props.listRowIndex});
            }
          } else {
            props.callbackRemovePane(tabId);
          }
        } else if (masterDataOld.handleType === 'modify' || masterDataOld.handleType === 'copyToAdd') {
          const {dispatch, commonModel, tabId, masterData} = props;
          const url: string = `${application.urlCommon}/verify/removeModifying`;
          const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId};
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
          const url: string = `${application.urlPrefix}/getData/saveData`;
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
      } else if (key === 'examineButton' || key === 'cancelExamineButton') {
        if (commonUtils.isNotEmpty(masterDataOld.id)) {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('master', [masterDataOld], [], [], true));
          if (childParams && childParams.childCallback) {
            const saveChildData = await childParams.childCallback({masterDataOld});
            saveData.push(...saveChildData);
          }
          const params = { id: masterDataOld.id, tabId, routeId: props.routeId, saveData, groupId: commonModel.userInfo.groupId,
            shopId: commonModel.userInfo.shopId, handleType: key.replace('Button', '')};
          const url: string = `${application.urlPrefix}/getData/examineOrCancel`;
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
      const url: string = `${application.urlPrefix}/getData/saveData`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        if (props.isModal) {
          props.callbackRemovePane({...props.modalParams, newRecord: masterData });
        } else {
          let returnState: any = await props.getAllData({ dataId: masterData.id });
          if (commonUtils.isNotEmptyObj(childParams) && childParams.getAllData) {
            const returnChild: any = await childParams.getAllData(true);
            returnState = {...returnState, ...returnChild};
          }
          dispatchModifyState({...returnState });
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
      buttonGroup.push({ key: 'cancelExamineButton', caption: '消审', htmlType: 'button', sortNum: 60, disabled: props.enabled || !isExamine });

      buttonGroup.push({ key: 'firstButton', caption: '首条', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'priorButton', caption: '上一条', htmlType: 'button', sortNum: 70, disabled: props.enabled });
      buttonGroup.push({ key: 'nextButton', caption: '下一条', htmlType: 'button', sortNum: 80, disabled: props.enabled });
      buttonGroup.push({ key: 'lastButton', caption: '末条', htmlType: 'button', sortNum: 90, disabled: props.enabled });
      buttonGroup.push({ key: 'copyToButton', caption: '复制', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      buttonGroup.push({ key: 'invalidButton', caption: '作废', htmlType: 'button', sortNum: 100, disabled: props.enabled || isInvalid || isExamine });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 70, disabled: props.enabled });
      return buttonGroup;
    }

    const onNumberChange = (name, fieldName, record, valueOld, isWait) => {
      let returnData = props.onNumberChange(name, fieldName, record, valueOld, true);
      returnData = calcOperation({name, fieldName, record, returnData});
      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const onSelectChange = (name, fieldName, record, assignField, valueOld, option, isWait = false) => {
      let returnData = props.onSelectChange(name, fieldName, record, assignField, valueOld, option, true);
      returnData = calcOperation({name, fieldName, record, returnData});
      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const onInputChange = (name, fieldName, record, e, isWait) => {
      let returnData = props.onInputChange(name, fieldName, record, e, true);
      returnData = calcOperation({name, fieldName, record, returnData});
      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const onTreeSelectChange = (name, fieldName, record, config, valueOld, extra, isWait = false) => {
      let returnData = props.onTreeSelectChange(name, fieldName, record, config, valueOld, extra, true);
      returnData = calcOperation({name, fieldName, record, returnData});
      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const calcOperation = (params) => {
      const {name, fieldName, record, returnData } = params;
      //成品计算
      if (typeof returnData[name + 'Data'] === 'object' && returnData[name + 'Data'].constructor === Object) {
        if (fieldName === 'customerName' || fieldName === 'settleName') {
          let settleDate = moment().format('YYYY-MM-DD');
          if (returnData[name + 'Data'].settleType === 'moment') {

          } else if (returnData.settleType === 'month') {
            moment(settleDate).add(returnData.monthValue, 'months').format('YYYY-MM-DD');
            const day = moment(settleDate).get('date');
            if (returnData.settleDay > day) {
              settleDate = moment(settleDate).add(1, 'months').format('YYYY-MM-DD');
            }
            const endDay = moment(settleDate).endOf('day').get('date');
            if (returnData.settleDay > endDay) {
              settleDate = moment(settleDate).endOf('day').format('YYYY-MM-DD');
            }
            returnData[name + 'Data'] = { ...returnData[name + 'Data'], settleDate};
          } else if (returnData.settleType === 'deliverAfter') {
            if (commonUtils.isNotEmpty(returnData.deliverDate)) {
              settleDate = moment(returnData.deliverDate).add(1, 'months').format('YYYY-MM-DD');
            } else {
              settleDate = moment(settleDate).add(returnData.deliverAfterDay, 'days').format('YYYY-MM-DD');
            }
          }
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], settleDate};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], settleDate} : returnData[name + 'ModifyData'];
        } else if (props.routeData.modelType.includes('/product') && (fieldName === 'measureQty' || fieldName === 'productName' || fieldName === 'productStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'],'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'],'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...convertCalcData};
          const moneyCalcData = commonUtils.getMoney(props.commonModel, returnData[name + 'Data'],'product', fieldName, 'costMoney');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...moneyCalcData};
          returnData[name + 'ModifyData'] = returnData[name + 'Data'].handleType === 'modify' ? { ...returnData[name + 'ModifyData'], ...qtyCalcData, ...convertCalcData, ...moneyCalcData} : returnData[name + 'ModifyData'];
        }
        //材料计算
        else if (props.routeData.modelType.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'],'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'],'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          returnData[name + 'Data'] = { ...returnData[name + 'Data'], ...convertCalcData};
          const moneyCalcData = commonUtils.getMoney(props.commonModel, returnData[name + 'Data'],'material', fieldName, 'costMoney');
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
        const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (index > -1) {
          //成品计算
          if (props.routeData.modelType.includes('/product') && (fieldName === 'measureQty' || fieldName === 'productName' || fieldName === 'productStyle')) {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'][index],'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'][index],'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...convertCalcData};
            const moneyCalcData = commonUtils.getMoney(props.commonModel, returnData[name + 'Data'][index],'product', fieldName, 'costMoney');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...moneyCalcData};
            if (returnData[name + 'Data'][index].handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData, ...moneyCalcData };
              }
            }
          }
          //材料计算
          else if (props.routeData.modelType.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, returnData[name + 'Data'][index],'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, returnData[name + 'Data'][index],'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...convertCalcData};
            const moneyCalcData = commonUtils.getMoney(props.commonModel, returnData[name + 'Data'][index],'material', fieldName, 'costMoney');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...moneyCalcData};
            if (returnData[name + 'Data'][index].handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData, ...moneyCalcData };
              }
            }
          }
          else if (fieldName === 'costPrice') {
            const moneyCalcData = commonUtils.getMoney(props.commonModel, returnData[name + 'Data'][index],'product', fieldName, 'costMoney');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...moneyCalcData};
            if (returnData[name + 'Data'][index].handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
              }
            }
          }
          else if (fieldName === 'costMoney') {
            const moneyCalcData = commonUtils.getPrice(props.commonModel, returnData[name + 'Data'][index],'product', fieldName, 'costPrice');
            returnData[name + 'Data'][index] = { ...returnData[name + 'Data'][index], ...moneyCalcData};
            if (returnData[name + 'Data'][index].handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {
                returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
              }
            }
          }

        }
      }
      return returnData;
    }



    return <div>
      <WrapComponent
        {...props}
        onButtonClick={onButtonClick}
        onFinish={onFinish}
        onSetForm={onSetForm}
        getButtonGroup={getButtonGroup}
        onNumberChange={onNumberChange}
        onSelectChange={onSelectChange}
        onInputChange={onInputChange}
        onTreeSelectChange={onTreeSelectChange}
      />
      <CommonModal
        {...props}
        onButtonClick={onButtonClick}
        onFinish={onFinish}
        onSetForm={onSetForm}
        getButtonGroup={getButtonGroup}
        onNumberChange={onNumberChange}
        onSelectChange={onSelectChange}
        onInputChange={onInputChange}
        onTreeSelectChange={onTreeSelectChange}
      />
    </div>
  };
};

export default commonDocEvent;






