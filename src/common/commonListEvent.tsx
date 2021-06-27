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
      if (key === 'addButton') {
        props.callbackAddPane(config.popupSelectId, {handleType: 'add'});
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

    return <WrapComponent
      {...props}
      onSetForm={onSetForm}
      onButtonClick={onButtonClick}
      onRowDoubleClick={onRowDoubleClick}
    />
  };
};

export default commonListEvent;