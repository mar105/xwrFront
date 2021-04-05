import React, { useReducer } from 'react';
import * as commonUtils from "./commonUtils";



const commonBase = (WrapComponent) => {
  return function ChildComponent(props) {
    const [modifyState, dispatchModifyState] = useReducer((state, action) => {
      return {...state, ...action };
    },[]);
    const handleAdd = () => {
      const dataRow: any = {};
      dataRow.handleType = 'add';
      dataRow.id = commonUtils.newId();
      dataRow.key = dataRow.id;
      return dataRow;
    }
    const handleModify = () => {
      const dataRow: any = {};
      dataRow.handleType = 'modify';
      return dataRow;
    };

    const handleMasterChange = (e) =>  {
      const dataRow: any = {};
      dataRow.handleType = 'modify';
      return dataRow;
    }

    const gotoError = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
    }

    return <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
      onAdd={handleAdd}
      onModify={handleModify}
      onMasterChange={handleMasterChange}
      gotoError={gotoError}
    />
  }
};

export default commonBase;






