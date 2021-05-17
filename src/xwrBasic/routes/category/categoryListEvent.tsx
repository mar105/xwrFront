import * as React from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";

const categoryListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }

    const onButtonClick = (key, e) => {
      const { dispatchModifyState } = props;
      if (key === 'addButton') {
        const masterData = props.onAdd();
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(masterData));
        dispatchModifyState({ masterData, masterIsVisible: true, enabled: true });
      }
    }
    const onModalCancel = (e) => {
      const { dispatchModifyState } = props;
      dispatchModifyState({ masterIsVisible: false, enabled: false });
    }

    const onModalOk = async (e) => {
      const { dispatchModifyState, name } = props;
      try {
        const values = await form.validateFields();
        const { commonModel, dispatch, masterData, tabId } = props;
        const saveData: any = [];
        console.log('dddd', name);
        saveData.push(commonUtils.mergeData("master", [{ ...masterData, ...values, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType  }], []));
        const params = { id: masterData.id, tabId, routeId: props.routeId,  saveData };
        const url: string = `${application.urlMain}/getData/saveData`;
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
          props.getAllData();
          dispatchModifyState({ masterIsVisible: false, enabled: false });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      } catch (errorInfo) {
        console.log('Failed:', errorInfo);
      }
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onModalOk={onModalOk}
      onModalCancel={onModalCancel}
      onButtonClick={onButtonClick}
      />
  };
};

export default categoryListEvent;