import React, {useEffect, useReducer, useRef} from 'react';
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";



const commonBase = (WrapComponent) => {
  return function ChildComponent(props) {
    const stateRef = useRef();
    const [modifyState, dispatchModifyState] = useReducer((state, action) => {
      return {...state, ...action };
    },{});
    useEffect(() => {
      stateRef.current = modifyState;
    }, [modifyState]);

    useEffect(() => {
      if (commonUtils.isNotEmpty(props.routeId)) {
        getAllData({ dataId: props.dataId });
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
              props.gotoError(dispatch, interfaceReturn);
            }
          }
        }
        clearModifying();
      }
    }, []);

    const getAllData = async (params) => {
      const { containerData } = props;
      if (commonUtils.isNotEmptyArr(containerData)) {
        let addState = { enabled: false };
        containerData.forEach(async container => {
          if (commonUtils.isNotEmpty(container.dataSetName)) {
            addState[container.dataSetName + 'Container'] = container;
          }
          if (commonUtils.isNotEmpty(params.dataId)) {
            if (container.isTable) {
              const returnData: any = await getDataList({ routeId: props.routeId, containerId: container.id, condition: { dataCondition: { dataId: params.dataId } }, isWait: true });
              addState = {...addState, ...returnData};
            } else {
              const returnData: any = await getDataOne({ routeId: props.routeId, containerId: container.id, condition: { dataCondition: { dataId: params.dataId } }, isWait: true });
              addState = {...addState, ...returnData};
            }
          }
        });
        dispatchModifyState({...addState});
      }
    }
    const getDataOne = async (params) => {
      const { commonModel, dispatch, dispatchModifyState } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataOne?routeId=` + params.routeId + '&containerId=' + params.containerId + '&dataId=' + params.dataId;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { data: interfaceReturn.data };
        } else {
          dispatchModifyState({ data: interfaceReturn.data });
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

    const getDataList = async (params) => {
      const { commonModel, dispatch, dispatchModifyState } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataList?routeId=` +
        params.routeId + '&containerId=' + params.containerId + '&pageNum=1' + '&pageSize=' + application.pageSize;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { data: interfaceReturn.data };
        } else {
          dispatchModifyState({ data: interfaceReturn.data });
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }



    const onAdd = () => {
      const dataRow: any = {};
      dataRow.handleType = 'add';
      dataRow.id = commonUtils.newId().toString();
      dataRow.key = dataRow.id;
      return dataRow;
    }
    const onModify = () => {
      const dataRow: any = {};
      dataRow.handleType = 'modify';
      return dataRow;
    };

    const gotoError = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
    };

    const gotoSuccess = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoSuccess', payload: interfaceData });
    };

    const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
      dispatchModifyState({ [name + 'SelectedRowKeys']: selectedRowKeys });
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

    const onSelectChange = (name, fieldName, record, value, option) => {
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

    return <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
      getAllData={getAllData}
      getDataOne={getDataOne}
      getDataList={getDataList}
      onAdd={onAdd}
      onModify={onModify}
      gotoError={gotoError}
      gotoSuccess={gotoSuccess}
      onRowSelectChange={onRowSelectChange}
      onSwitchChange={onSwitchChange}
      onInputChange={onInputChange}
      onCheckboxChange={onCheckboxChange}
      onNumberChange={onNumberChange}
      onSelectChange={onSelectChange}
    />
  };
};

export default commonBase;






