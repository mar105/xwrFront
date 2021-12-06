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
        props.callbackAddPane(config.popupSelectId, {handleType: 'add',
          listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: container.tableKey,
          listRowIndex: slaveSum.total, listRowTotal: slaveSum.total });
      } else if (key === 'modifyButton') {
        const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
        if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
            return;
          }
          const slaveIndex = slaveData.findIndex(item => item[container.tableKey] === slaveSelectedRowKeys[0]);
          const selectKey = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? 'id' : container.slaveData[index].popupSelectKey;
          props.callbackAddPane(container.slaveData[index].popupSelectId, { handleType: 'modify',
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
        props.callbackRemovePane({...props.modalParams, selectList: props.slaveSelectedRows });
      } else if (key === 'cancelButton') {
        props.callbackRemovePane();
      } else if (key === 'exportExcelButton') {
        const url: string = `${application.urlUpload}/excel/exportExcel`;
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
        // const url: string = `${application.urlUpload}/excel/importExcel`;
        // const requestParam = {
        //   routeId: routeId,
        //   groupId: commonModel.userInfo.groupId,
        //   shopId: commonModel.userInfo.shopId,
        //   containerId: container.id,
        // }
        // const interfaceReturn = await request.postExcelRequest(url, commonModel.token, application.paramInit(requestParam));
        // commonUtils.downloadExcel(interfaceReturn);
      }
    }

    const onRowDoubleClick = async (name, record, e) => {
      if (props.isModal) {
        props.callbackRemovePane({...props.modalParams, selectList: [record] });
      } else {
        const {[name + 'Container']: container, routeId, slaveSum, slaveSearchCondition: searchCondition, slaveData, slaveSorterInfo: sorterInfo } = props;
        const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
        if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
          const slaveIndex = slaveData.findIndex(item => item[container.tableKey] === record[container.tableKey]);
          const key = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? container.tableKey : container.slaveData[index].popupSelectKey;
          props.callbackAddPane(container.slaveData[index].popupSelectId, {
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
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 70, disabled: props.enabled });
      buttonGroup.push({ key: 'exportExcelButton', caption: '导出excel', htmlType: 'button', sortNum: 80, disabled: false });
      buttonGroup.push({ key: 'importExcelButton', caption: '导入数据', htmlType: 'button', sortNum: 80, disabled: false });
      return buttonGroup;
    }

    const onTableChange = async (name, pagination, filters, sorterInfo, extra) => {
      const {dispatchModifyState, [name + 'Container']: container, [name + 'SearchCondition']: searchCondition } = props;
      dispatchModifyState({[name + 'Loading']: true });
      const returnData: any = await props.getDataList({ name, containerId: container.id, pageNum: container.isTree === 1 ? undefined : 1, condition: { searchCondition, sorterInfo }, isWait: true });
      const addState = {...returnData, [name + 'SorterInfo']: sorterInfo};
      dispatchModifyState({...addState});
    }

    const onUploadSuccess = (buttonName, interfaceReturn) => {
      const { dispatch, dispatchModifyState } = props;
      const addState = {};
      if (interfaceReturn.code === 1) {
        const { container, data } = interfaceReturn.data;
        const columns: any = [];
        container.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance' || item.containerType === 'spare' || item.containerType === 'cascader') && item.isVisible).forEach(item => {
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
      const url: string = `${application.urlPrefix}/getData/saveData`;
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