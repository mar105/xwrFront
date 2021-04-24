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
      if (commonUtils.isNotEmptyArr(selectedRows)) {
        dispatchModifyState({ [name + 'SelectedRowKeys']: selectedRowKeys });
      }
    }

    const onSwitchChange = (name, fieldName, checked, e) => {
      if (name === 'master') {
        const { masterData: masterDataOld } = modifyState;
        const masterData = { ...masterDataOld };
        masterData[fieldName] = checked;
        dispatchModifyState({ masterData });
      }
    }


    const onInputChange = (name, fieldName, e) => {
      if (name === 'master') {
        const { masterData: masterDataOld } = modifyState;
        const masterData = { ...masterDataOld };
        masterData[fieldName] = e.target.value;
        console.log(name, fieldName, masterData);
        dispatchModifyState({ masterData });
      }
    }



    return <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
      onAdd={onAdd}
      onModify={onModify}
      onRowClick={onRowClick}
      // onMasterChange={handleMasterChange}
      gotoError={gotoError}
      onRowSelectChange={onRowSelectChange}
      onSwitchChange={onSwitchChange}
      onInputChange={onInputChange}
    />
  };
};

export default commonBase;






