import React, {useEffect, useReducer, useRef} from 'react';
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import {Spin} from "antd";



const commonBase = (WrapComponent) => {
  return function ChildComponent(props) {
    const stateRef = useRef();
    const [modifyState, dispatchModifyState] = useReducer((state, action) => {
      return {...state, ...action };
    },{ ...props.commonModel.activePane });
    useEffect(() => {
      stateRef.current = modifyState;
    }, [modifyState]);

    useEffect(() => {
      if (commonUtils.isNotEmpty(modifyState.routeId)) {
        const fetchData = async () => {
          const returnState: any = await getAllData({ pageNum: 1, dataId: modifyState.dataId });
          dispatchModifyState({...returnState});
        }
        fetchData();
      }
    }, []);

    useEffect(() => {
      //刷新走两次这方法原因：一次是主路由，第二次子路由。
      return ()=> {
        const clearModifying = async () => {
          const {dispatch, commonModel, tabId} = props;
          //为什么要用stateRef.current？是因为 masterData数据改变后，useEffect使用的是[]不重新更新state，为老数据,使用 useRef来存储变量。
          const { masterData }: any = stateRef.current;
          if (commonUtils.isNotEmptyObj(masterData) && commonUtils.isNotEmpty(masterData.handleType)) {
            const url: string = `${application.urlCommon}/verify/removeModifying`;
            const params = {id: masterData.id, tabId};
            const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
            if (interfaceReturn.code === 1) {
            } else {
              gotoError(dispatch, interfaceReturn);
            }
          }
        }
        clearModifying();
      }
    }, []);

    const getAllData = async (paramsOld) => {
      const { containerData } = modifyState;
      const params = commonUtils.isEmptyObj(paramsOld) ? {} : paramsOld;
      if (commonUtils.isNotEmptyArr(containerData)) {
        let addState = { enabled: false, pageLoading: false };
        for(const container of containerData) {
        // containerData.forEach(async container => { //foreach不能使用await
          if (params.testMongo) {
            // 如果有虚拟名称时，保存后不获取数据，等待任务推送数据。
            if (commonUtils.isNotEmpty(container.virtualName)) {
              continue;
            }
          }
          if (commonUtils.isNotEmpty(container.dataSetName) && commonUtils.isEmptyObj(modifyState[container.dataSetName + 'Columns'])) {
            addState[container.dataSetName + 'Container'] = container;
            if (container.isTable && commonUtils.isEmptyArr(modifyState[container.dataSetName + 'Columns'])) {
              const columns: any = [];
              container.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance') && item.isVisible).forEach(item => {
                const column = { title: item.viewName, dataIndex: item.fieldName, fieldType: item.fieldType, sortNum: item.sortNum, width: item.width };
                columns.push(column);
              });
              addState[container.dataSetName + 'Columns'] = columns;
            }
          }
          if (commonUtils.isNotEmpty(params.dataId) && container.isSelect) {
            //单据获取
            if (container.isTable) {
              const returnData: any = await getDataList({ name: container.dataSetName, containerId: container.id, condition: { dataId: params.dataId }, isWait: true });
              addState = {...addState, ...returnData, [container.dataSetName + 'DelData']: []};
              // addState[container.dataSetName + 'Data'] = returnData.list;
              // addState[container.dataSetName + 'Sum'] = returnData.sum;
              // addState[container.dataSetName + 'PageNum'] = returnData.pageNum;
              // addState[container.dataSetName + 'IsLastPage'] = returnData.isLastPage;

            } else {
              const returnData: any = await getDataOne({ name: container.dataSetName, containerId: container.id, condition: { dataId: params.dataId }, isWait: true });
              addState[container.dataSetName + 'Data'] = returnData;
            }
          } else if (params.handleType !== 'add' && container.isSelect) {
            //列表获取
            if (container.isTable) {
              const returnData: any = await getDataList({ name: container.dataSetName, containerId: container.id, pageNum: container.isTree === 1 ? undefined : params.pageNum, condition: {}, isWait: true });
              addState = {...addState, ...returnData, [container.dataSetName + 'DelData']: []};
              // addState[container.dataSetName + 'Data'] = returnData.list;
              // addState[container.dataSetName + 'Sum'] = returnData.sum;
              // addState[container.dataSetName + 'PageNum'] = returnData.pageNum;
              // addState[container.dataSetName + 'IsLastPage'] = returnData.isLastPage;
              // if (commonUtils.isNotEmpty(returnData.createDate)) {
              //   addState[container.dataSetName + 'CreateDate'] = returnData.createDate;
              // }
            }
          }
        };
        return addState;
      }
    }
    const getDataOne = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataOne?routeId=` + modifyState.routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId +
        '&containerId=' + params.containerId + '&dataId=' + params.condition.dataId;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data };
        } else {
          dispatchModifyState({ ...interfaceReturn.data });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const getDataList = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataList`;
      const addState = {};
      const requestParam = {
        routeId: modifyState.routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: params.containerId,
        pageNum: params.pageNum,
        pageSize: application.pageSize,
        condition: params.condition,
        createDate: params.createDate,
      }

      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(requestParam))).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          addState[params.name + 'Data'] = interfaceReturn.data.data.list;
          if (params.pageNum === 1) {
            addState[params.name + 'Sum'] = interfaceReturn.data.sum;
          }
          addState[params.name + 'PageNum'] = interfaceReturn.data.data.pageNum;
          addState[params.name + 'IsLastPage'] = interfaceReturn.data.data.isLastPage;
          if (commonUtils.isNotEmpty(interfaceReturn.data.createDate)) {
            addState[params.name + 'CreateDate'] = interfaceReturn.data.createDate;
          }
          addState[params.name + 'Loading'] = false;
          return { ...addState } //{ ...interfaceReturn.data.data, sum: interfaceReturn.data.sum, createDate: interfaceReturn.data.createDate };
        } else {
          dispatchModifyState({ ...addState });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const getSelectList = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getSelectList`;
      const requestParam = {
        routeId: modifyState.routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerSlaveId: params.containerSlaveId,
        pageNum: params.pageNum,
        pageSize: application.pageSize,
        condition: params.condition,
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(requestParam))).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data.data };
        } else {
          dispatchModifyState({ ...interfaceReturn.data.data });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const onAdd = () => {
      const { commonModel } = props;
      const dataRow: any = {};
      dataRow.handleType = 'add';
      dataRow.id = commonUtils.newId();
      dataRow.key = dataRow.id;
      dataRow.groupId = commonModel.userInfo.groupId;
      dataRow.shopId = commonModel.userInfo.shopId;
      dataRow.routeId = modifyState.routeId;
      return dataRow;
    }
    const onModify = () => {
      const dataRow: any = {};
      dataRow.handleType = 'modify';
      return dataRow;
    };

    const onDel = () => {
      const dataRow: any = {};
      dataRow.handleType = 'del';
      return dataRow;
    };

    const onTableClick = (name, record, e, isWait = false) => {
      const { [name + 'Data']: dataOld, [name + 'DelData']: delDataOld }: any = stateRef.current;
      const data = [...dataOld];
      const delData = commonUtils.isEmptyArr(delDataOld) ? [] : [...delDataOld];
      const index = data.findIndex(item => item.id === record.id);
      if (index > -1) {
        data[index].handleType = 'del';
        delData.push(data[index]);
        data.splice(index, 1);
        if (isWait) {
          return { [name + 'Data']: data, [name + 'DelData']: delData };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'DelData']: delData });
        }
      }
    };

    const gotoError = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
    };

    const gotoSuccess = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoSuccess', payload: interfaceData });
    };

    const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
      dispatchModifyState({ [name + 'SelectedRowKeys']: selectedRowKeys, [name + 'SelectedRows']: selectedRows });
    }

    const onSwitchChange = (name, fieldName, record, checked, e) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = checked;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = checked;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const onCheckboxChange = (name, fieldName, record, e) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = e.target.checked;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = e.target.checked;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const onInputChange = (name, fieldName, record, e) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = e.target.value;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = e.target.value;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const onNumberChange = (name, fieldName, record, value) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = value;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = value;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const onSelectChange = (name, fieldName, record, assignField, value, option, isWait = false) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      const assignOption = commonUtils.isEmptyObj(option) || commonUtils.isEmptyObj(option.optionObj) ? {} : option.optionObj;

      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld, ...getAssignFieldValue(assignField, assignOption) };

        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = value;
        if (isWait) {
          return { [name + 'Data']: data };
        } else {
          dispatchModifyState({ [name + 'Data']: data });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data[index] = { ...data[index], ...getAssignFieldValue(assignField, assignOption) };
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = value;
          if (isWait) {
            return { [name + 'Data']: data };
          } else {
            dispatchModifyState({ [name + 'Data']: data });
          }
        }
      }
    }

    const onCascaderChange = (name, fieldName, record, fieldRelevance, value, selectedOptions) => {
      const { [name + 'Data']: dataOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        if (commonUtils.isNotEmpty(fieldRelevance)) {
          const assignField = fieldRelevance.split(',');
          assignField.forEach((field, fieldIndex) => {
            data[field] = value[fieldIndex];
          });
        }
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = value;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          if (commonUtils.isNotEmpty(fieldRelevance)) {
            const assignField = fieldRelevance.split(',');
            assignField.forEach((field, fieldIndex) => {
              data[index][field] = value[fieldIndex];
            });
          }
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = value;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const getAssignFieldValue = (assignField, option) => {
      const returnField = {};
      if (commonUtils.isNotEmptyObj(option) && commonUtils.isNotEmpty(assignField)) {
        assignField.split(',').forEach(item => {
          const arrAssign = item.split('=');
          returnField[arrAssign[0]] = option[arrAssign[1]];
        });
      }
      return returnField;
    }

    const onReachEnd = async (name) => {
      const { [name + 'Container']: container, [name + 'Data']: data, [name + 'PageNum']: pageNum, [name + 'IsLastPage']: isLastPage, [name + 'CreateDate']: createDate }: any = stateRef.current;
      if (!isLastPage && !container.isTree) {
        dispatchModifyState({[name + 'Loading']: true });
        const returnData: any = await getDataList({ containerId: container.id, pageNum: pageNum + 1, condition: {}, isWait: true, createDate });
        const addState = {...returnData};
        addState[name + 'Data'] = [...data, ...returnData[name + 'Data']];
        // addState[name + 'Data'] = [...data, ...returnData.list];
        // addState[name + 'PageNum'] = returnData.pageNum;
        // addState[name + 'IsLastPage'] = returnData.isLastPage;
        // addState[name + 'Loading'] = false;
        dispatchModifyState({...addState});
      }
    }

    return <Spin spinning={modifyState.pageLoading ? true : false}>
      <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
      getAllData={getAllData}
      getDataOne={getDataOne}
      getDataList={getDataList}
      getSelectList={getSelectList}
      getAssignFieldValue={getAssignFieldValue}
      onAdd={onAdd}
      onModify={onModify}
      onDel={onDel}
      onTableClick={onTableClick}
      gotoError={gotoError}
      gotoSuccess={gotoSuccess}
      onRowSelectChange={onRowSelectChange}
      onSwitchChange={onSwitchChange}
      onInputChange={onInputChange}
      onCheckboxChange={onCheckboxChange}
      onNumberChange={onNumberChange}
      onSelectChange={onSelectChange}
      onCascaderChange={onCascaderChange}
      onReachEnd={onReachEnd}
    />
    </Spin>
  };
};

export default commonBase;






