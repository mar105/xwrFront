import React, { useEffect, useReducer } from 'react';
import * as commonUtils from "./commonUtils";
import * as application from "../xwrManage/application";
import * as request from "./request";



const commonBase = (WrapComponent) => {
  return function ChildComponent(props) {
    const [modifyState, dispatchModifyState] = useReducer((state, action) => {
      return {...state, ...action };
    },{});
    useEffect(() => {
      console.log('11');
      const listenerBeforeunload = (ev) => {
        ev.preventDefault();
        if (commonUtils.isNotEmpty(modifyState.masterData.handleType)) {
          ev.returnValue='数据未保存，确定离开吗？';
        }
      };
      window.addEventListener('beforeunload', listenerBeforeunload);
      return () => {
        window.removeEventListener('beforeunload', listenerBeforeunload)
      }

      const listenerUnload = async ev => {
        const {commonModel, dispatch} = props;
        ev.preventDefault();
        const url: string = `${application.urlCommon}/verify/isExistModifying`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({id: modifyState.masterData.id}))).data;
        console.log('interfaceReturn', interfaceReturn);
        if (interfaceReturn.code === 1) {
          dispatchModifyState({ enabled: true });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      };
      window.addEventListener('unload', listenerUnload);
      return () => {
        window.removeEventListener('unload', listenerUnload)
      }

    }, []);

    useEffect(() => {

    }, []);

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






