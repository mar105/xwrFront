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
            const url: string = `${application.urlCommon}/verify/removeModifying`;
            const params = {id: masterData.id, tabId};
            const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
            if (interfaceReturn.code === 1) {
            } else {
              props.gotoError(dispatch, interfaceReturn);
            }
          }
          clearModifying();
        }
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






