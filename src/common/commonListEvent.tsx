import * as React from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";

const commonListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    // @ts-ignore
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
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
          props.callbackAddPane(container.slaveData[index].popupSelectId, { handleType: 'modify',
            listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: container.tableKey,
            listRowIndex: slaveIndex > -1 ? slaveIndex + 1 : 1, listRowTotal: slaveSum.total,
            dataId: slaveSelectedRowKeys[0] });
        }
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState });
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
      const {[name + 'Container']: container, routeId, slaveSum, slaveSearchCondition: searchCondition, slaveData, slaveSorterInfo: sorterInfo } = props;
      const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
      if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
        const slaveIndex = slaveData.findIndex(item => item[container.tableKey] === record[container.tableKey]);
        const key = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? container.tableKey : container.slaveData[index].popupSelectKey;
        props.callbackAddPane(container.slaveData[index].popupSelectId, {
          listRouteId: routeId, listContainerId: container.id, listCondition: { searchCondition, sorterInfo }, listTableKey: container.tableKey,
          listRowIndex: slaveIndex > -1 ? slaveIndex + 1 : 1, listRowTotal: slaveSum.total,
          dataId: record[key] });
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

    const onUploadSuccess = (name, data) => {
      console.log(name, data);
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onButtonClick={onButtonClick}
      onRowDoubleClick={onRowDoubleClick}
      getButtonGroup={getButtonGroup}
      onTableChange={onTableChange}
      onUploadSuccess={onUploadSuccess}
    />
  };
};

export default commonListEvent;