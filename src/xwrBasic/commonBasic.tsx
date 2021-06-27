import * as React from "react";
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

const commonBasic = (WrapComponent) => {
  return function ChildComponent(props) {
    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
        && props.commonModel.stompClient.connected) {
        props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId, saveDataReturn);
      }
      return () => {
        if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
          && props.commonModel.stompClient.connected) {
          props.commonModel.stompClient.unsubscribe('/xwrUser/topic-websocket/saveDataReturn' + props.tabId);
        }
      };
    }, [props.commonModel.stompClient]);

    const saveDataReturn = async (data) => {
      const { dispatch, dispatchModifyState, masterData } = props;
      const returnBody = JSON.parse(data.body);
      if (returnBody.code === 1) {
        const returnState: any = await props.getAllData({ dataId: masterData.id });
        dispatchModifyState({...returnState});
        props.gotoSuccess(dispatch, returnBody);
      } else {
        dispatchModifyState({ pageLoading: false });
        props.gotoError(dispatch, returnBody);
      }
    }

    return <WrapComponent
      {...props}
    />
  };
};

export default commonBasic;






