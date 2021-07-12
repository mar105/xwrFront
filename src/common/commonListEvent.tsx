import * as React from "react";
import * as commonUtils from "../utils/commonUtils";

const commonListEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    // @ts-ignore
    let form;
    const onSetForm = (formNew) => {
      form = formNew;
    }

    const onButtonClick = async (key, config, e) => {
      const { dispatch, dispatchModifyState, ['slaveContainer']: container, slaveSelectedRowKeys } = props;
      if (key === 'addButton') {
        props.callbackAddPane(config.popupSelectId, {handleType: 'add'});
      } else if (key === 'modifyButton') {
        const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
        if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
            return;
          }
          props.callbackAddPane(container.slaveData[index].popupSelectId, { handleType: 'modify', dataId: slaveSelectedRowKeys[0] });
        }
      } else if (key === 'refreshButton') {
        dispatchModifyState({ pageLoading: true });
        const returnState = await props.getAllData({ pageNum: 1});
        dispatchModifyState({ ...returnState });
      }
    }

    const onRowDoubleClick = async (name, record, e) => {
      const {[name + 'Container']: container } = props;
      const index = container.slaveData.findIndex(item => item.fieldName === 'addButton');
      if (index > -1 && commonUtils.isNotEmpty(container.slaveData[index].popupSelectId)) {
        const key = commonUtils.isEmpty(container.slaveData[index].popupSelectKey) ? container.tableKey : container.slaveData[index].popupSelectKey;
        props.callbackAddPane(container.slaveData[index].popupSelectId, { dataId: record[key] });
      }
    }

    const getButtonGroup = () => {
      const buttonGroup: any = [];
      buttonGroup.push({ key: 'addButton', caption: '增加', htmlType: 'button', sortNum: 10, disabled: props.enabled });
      buttonGroup.push({ key: 'modifyButton', caption: '修改', htmlType: 'button', sortNum: 30, disabled: props.enabled });
      buttonGroup.push({ key: 'postButton', caption: '保存', htmlType: 'submit', sortNum: 40, disabled: !props.enabled });
      buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: !props.enabled });
      buttonGroup.push({ key: 'delButton', caption: '删除', htmlType: 'button', sortNum: 60, disabled: props.enabled });
      buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 100, disabled: props.enabled });
      return buttonGroup;
    }

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onButtonClick={onButtonClick}
      onRowDoubleClick={onRowDoubleClick}
      getButtonGroup={getButtonGroup}
    />
  };
};

export default commonListEvent;