import * as React from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import {useEffect} from "react";

const commonListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    // @ts-ignore
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }

    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
        && props.commonModel.stompClient.connected) {
        const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturnResult);
        return () => {
          saveDataReturn.unsubscribe();
        };
      }
    }, [props.commonModel.stompClient]);

    // @ts-ignore
    const saveDataReturnResult = async (data) => {
      const { dispatch, dispatchModifyState } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState, importIsVisible: false });
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
        throw new Error(returnBody.msg);
      }
    }

    const onButtonClick = async (key, config, e) => {
      const { dispatch, commonModel, dispatchModifyState, ['slaveContainer']: container, slaveData, slaveSum, slaveSelectedRowKeys,
        slaveSearchCondition: searchCondition, slaveSorterInfo: sorterInfo, routeId } = props;
      if (key === 'addButton') {
        props.callbackAddPane(config.popupSelectId, {handleType: 'add', listTabId: props.tabId,
          listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: container.tableKey,
          listRowIndex: slaveSum.total, listRowTotal: slaveSum.total });
      } else if (key === 'modifyButton') {
        const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
        if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            const index = commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseData');
            if (index > -1) {
              props.gotoError(dispatch, { code: '6001', msg: commonModel.commonConstant[index].viewName });
            } else {
              props.gotoError(dispatch, { code: '6001', msg: '请选择数据！' });
            }
            return;
          }
          const slaveIndex = slaveData.findIndex(item => item[container.tableKey] === slaveSelectedRowKeys[0]);
          const selectKey = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? 'id' : container.slaveData[index].popupSelectKey;
          props.callbackAddPane(container.slaveData[index].popupSelectId, { handleType: 'modify', listTabId: props.tabId,
            listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: container.tableKey,
            listRowIndex: slaveIndex > -1 ? slaveIndex + 1 : 1, listRowTotal: slaveSum.total,
            dataId: slaveData[slaveIndex][selectKey] });
        }
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState });
      } else if (key === 'selectButton') {
        if (commonUtils.isEmptyArr(props.slaveSelectedRows)) {
          props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
          return;
        }
        props.callbackRemovePane({...props.modalParams,
          selectList: props.slaveSelectedRows, selectKeys: props.slaveSelectedRowKeys,
          selectNestContainer: props.slaveNestContainer,
          selectNestList: props.slaveNestSelectedRows, selectNestKeys: props.slaveNestSelectedRowKeys });
      } else if (key === 'cancelButton') {
        props.callbackRemovePane();
      } else if (key === 'exportExcelButton') {
        const url: string = application.urlUpload + '/excel/exportExcel';
        const requestParam = {
          routeId: routeId,
          groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId,
          containerId: container.id,
          pageSize: application.pageSize,
          condition: { searchCondition: props.slaveSearchCondition, sorterInfo: props.slaveSorterInfo },
        }
        const interfaceReturn = await request.postExcelRequest(url, commonModel.token, application.paramInit(requestParam));
        commonUtils.downloadExcel(interfaceReturn);
      } else if (key === 'importExcelButton') {
        //放在ButtonGroup中。
        // const url: string = application.urlUpload + '/excel/importExcel';
        // const requestParam = {
        //   routeId: routeId,
        //   groupId: commonModel.userInfo.groupId,
        //   shopId: commonModel.userInfo.shopId,
        //   containerId: container.id,
        // }
        // const interfaceReturn = await request.postExcelRequest(url, commonModel.token, application.paramInit(requestParam));
        // commonUtils.downloadExcel(interfaceReturn);
      } else if (key === 'printButton' || key === 'printToMenu') {
        const printConfig = key === 'printToMenu' ? e.item.props.config : config;
        if (e.key === 'reportUpload') {
          // 报表上传
          dispatchModifyState({ modalReportVisible: true });
        } else if (commonUtils.isNotEmpty(printConfig.name)) {
          props.onPrint(printConfig);
        }
      }
    }

    const onRowDoubleClick = async (name, record, e) => {
      if (props.isModal) {
        props.callbackRemovePane({...props.modalParams, selectList: [record], selectKeys: [record.id] });
      } if (props.routeData.modelType.includes('/msg')) {
        const { dispatch, commonModel, [name + 'Container']: container } = props;
        const url: string = application.urlPrefix + '/msg/markRead';
        const params = { groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId, userTbId: record.id};
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          props.commonModel.stompClient.send('/websocket/saveDataReturn', {},
            JSON.stringify( { authorization: props.commonModel.token, tabId: commonModel.userInfo.userId, result: -1 } ));
          const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
          if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
            const key = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? container.tableKey : container.slaveData[index].popupSelectKey;
            props.callbackAddPane(container.slaveData[index].popupSelectId, { dataId: record[key] });
          }
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
      else {
        const {[name + 'Container']: container, routeId, slaveSum, slaveSearchCondition: searchCondition, slaveData, slaveSorterInfo: sorterInfo } = props;
        const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
        if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
          const slaveIndex = slaveData.findIndex(item => item[container.tableKey] === record[container.tableKey]);
          const key = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? container.tableKey : container.slaveData[index].popupSelectKey;
          props.callbackAddPane(container.slaveData[index].popupSelectId, { listTabId: props.tabId,
            listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: key,
            listRowIndex: slaveIndex > -1 ? slaveIndex + 1 : 1, listRowTotal: slaveSum.total,
            dataId: record[key] });
        }
      }

    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      // buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      // buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 70, disabled: props.enabled });
      buttonGroup.push({ key: 'exportExcelButton', caption: '导出excel', htmlType: 'button', sortNum: 80, disabled: false });
      buttonGroup.push({ key: 'importExcelButton', caption: '导入数据', htmlType: 'button', sortNum: 90, disabled: false });
      buttonGroup.push({ key: 'printButton', caption: '打印', htmlType: 'button', sortNum: 100, disabled: false });
      return buttonGroup;
    }

    const onTableChange = async (name, pagination, filters, sorterInfo, extra) => {
      if (extra.action === 'sort') {
        const {dispatchModifyState, [name + 'Container']: container, [name + 'SearchCondition']: searchCondition } = props;
        dispatchModifyState({[name + 'Loading']: true });
        const returnData: any = await props.getDataList({ name, containerId: container.id, pageNum: commonUtils.isNotEmpty(container.superiorContainerId) || container.isTree === 1 ? undefined : 1, condition: { searchCondition, sorterInfo }, isWait: true });
        const addState = {...returnData, [name + 'SorterInfo']: sorterInfo, [name + 'Loading']: false};
        dispatchModifyState({...addState});
      }
    }

    const onUploadSuccess = (buttonName, interfaceReturn) => {
      const { dispatch, dispatchModifyState } = props;
      const addState = {};
      if (interfaceReturn.code === 1) {
        const { container, data } = interfaceReturn.data;
        const columns: any = [];
        container.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance' || item.containerType === 'relevanceNotView' || item.containerType === 'relevanceInstant' || item.containerType === 'spare' || item.containerType === 'cascader') && item.isVisible).forEach(item => {
          const column = { title: item.viewName, dataIndex: item.fieldName, fieldType: item.fieldType, sortNum: item.sortNum, width: item.width };
          columns.push(column);
        });
        addState[container.dataSetName + 'Container'] = container;
        addState[container.dataSetName + 'Columns'] = columns;
        addState[container.dataSetName + 'Data'] = data;
        dispatchModifyState({ ...addState, importIsVisible: true, pageLoading: false });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    const onImportModalCancel = () => {
      props.dispatchModifyState({ pageLoading: false, importIsVisible: false });
    };

    const onImportModalOk = async () => {
      const { commonModel, dispatch, slaveContainer, importData, tabId, dispatchModifyState } = props;
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('import', importData, [], [], false));

      const index = slaveContainer.slaveData.findIndex(item => item.fieldName === 'importExcelButton');
      const params = { tabId, routeId: slaveContainer.slaveData[index].popupActiveId, groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId, saveData, handleType: 'add' };
      const url: string = application.urlPrefix + '/getData/saveData';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        props.gotoSuccess(dispatch, interfaceReturn);
        dispatchModifyState({ ...returnState, importIsVisible: false });
      } else if (interfaceReturn.code === 10) {
        dispatchModifyState({ pageLoading: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    };

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onButtonClick={onButtonClick}
      onRowDoubleClick={onRowDoubleClick}
      getButtonGroup={getButtonGroup}
      onTableChange={onTableChange}
      onUploadSuccess={onUploadSuccess}
      onImportModalCancel={onImportModalCancel}
      onImportModalOk={onImportModalOk}
    />
  };
};

export default commonListEvent;