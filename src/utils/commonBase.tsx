import React, {useEffect, useReducer, useRef} from 'react';
import * as commonUtils from "./commonUtils";
import * as application from "../application";
import * as request from "./request";



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
      console.log('onRowSelectChange', selectedRowKeys);
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
          console.log('option', option);
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    return <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
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






