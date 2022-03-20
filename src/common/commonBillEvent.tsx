import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

const commonBillEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    useEffect(() => {
      if (commonUtils.isNotEmptyObj(props.masterContainer)) {
        if (props.handleType === 'add') {
          const childParams = {};
          if (props.copyToData) {
            const masterData = {...commonUtils.getAssignFieldValue('master', props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
            childParams['masterData'] = masterData;
            for(const config of props.copyToData.config.children) {
              const fieldNameSplit = config.fieldName.split('.');
              const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
              if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
                const copyData: any = [];
                for(const data of props.copyToData[dataSetName + 'Data']) {
                  copyData.push({...commonUtils.getAssignFieldValue(dataSetName, config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
                }
                childParams[dataSetName + 'Data'] = copyData;
                childParams[dataSetName + 'ModifyData'] = [];
                childParams[dataSetName + 'DelData'] = [];
              }
            }
          }
          props.onButtonClick('addButton', null, null, childParams);
        }
        else if (props.handleType === 'modify') {
          props.onButtonClick('modifyButton', null, null);
        }
      }
    }, [props.masterContainer.dataSetName]);

    const onFinish = async (values: any) => {
      const { slaveData, slaveModifyData, slaveDelData } = props;
      const childCallback = (params) => {
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, false));
        return saveData;
      }
      props.onFinish(values, { childCallback });
    }


    const onButtonClick = async (key, config, e, childParams: any = undefined) => {
      if (key === 'delButton' || key === 'invalidButton' || key === 'examineButton'  || key === 'cancelExamineButton') {
        const { slaveData, slaveModifyData, slaveDelData } = props;
        const childCallback = (params) => {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, true));
          return saveData;
        }
        props.onButtonClick(key, config, e, { childCallback });
      } else {
        props.onButtonClick(key, config, e, childParams);
      }
    }

    const getButtonGroup = () => {
      const buttonAddGroup: any = props.getButtonGroup();
      buttonAddGroup.push({ key: 'copyFromButton', caption: '复制从', htmlType: 'button', onClick: onButtonClick, sortNum: 121, disabled: !props.enabled });
      return buttonAddGroup;
    }

    return <div>
      <WrapComponent
        {...props}
        getButtonGroup={getButtonGroup}
        onButtonClick={onButtonClick}
        onFinish={onFinish}
      />
    </div>
  };
};

export default commonBillEvent;






