import React, {useEffect, useReducer, useRef} from 'react';
import * as commonUtils from "./commonUtils";
import * as application from "../xwrManage/application";
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
          if (commonUtils.isNotEmpty(masterData.handleType)) {
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

    const onRowClick = (name, record, rowKey) => {
      const addState: any = {};
      addState[name + 'SelectedRowKeys'] = [record[rowKey]];
      dispatchModifyState({...addState});
    }

    const gotoError = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
    };

    const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
      dispatchModifyState({ [name + 'SelectedRowKeys']: selectedRowKeys });
    }

    const onSwitchChange = (name, fieldName, checked, e) => {
      const { [name + 'Data']: dataOld, [name + 'SelectedRowKeys']: dataSelectedRowKeys }: any = modifyState;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = checked;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === dataSelectedRowKeys.toString());
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = checked;
          dispatchModifyState({ [name + 'Data']: data });
        }
      }
    }

    const onInputChange = (name, fieldName, e) => {
      const { [name + 'Data']: dataOld, [name + 'SelectedRowKeys']: dataSelectedRowKeys }: any = modifyState;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = e.target.value;
        dispatchModifyState({ [name + 'Data']: data });
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === dataSelectedRowKeys.toString());
        if (index > -1) {
          data[index].handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index][fieldName] = e.target.value;
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
      onRowClick={onRowClick}
      gotoError={gotoError}
      onRowSelectChange={onRowSelectChange}
      onSwitchChange={onSwitchChange}
      onInputChange={onInputChange}
    />
  };
};

export default commonBase;






