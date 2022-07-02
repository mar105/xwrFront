import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import {Tooltip} from "antd";
import { UpSquareOutlined, DownSquareOutlined } from '@ant-design/icons';

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
      const { dispatch, slaveContainer, slaveData, slaveModifyData, slaveDelData } = props;
      if (commonUtils.isEmptyArr(slaveData) && commonUtils.isNotEmptyObj(slaveContainer)) {
        const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'tableNotNull');
        if (index > -1) {
          props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
        } else {
          props.gotoError(dispatch, {code: '6001', msg: '从表不能为空！'});
        }
        return;
      }
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

    const getLastColumnButton = (text,record, index)=> {
      const { commonModel } = props;
      const upperIndex = commonModel.commonConstant.findIndex(item => item.constantName === 'upperButton');
      const upperButton = upperIndex > -1 ? commonModel.commonConstant[upperIndex].viewName : '上查';
      const lowerIndex = commonModel.commonConstant.findIndex(item => item.constantName === 'lowerButton');
      const lowerButton = lowerIndex > -1 ? commonModel.commonConstant[lowerIndex].viewName : '下查';
      return <div>
        { commonUtils.isEmpty(record.originalId) ? '' : <a onClick={props.onLastColumnClick.bind(this, 'slave', 'upperButton', record)}> <Tooltip placement="top" title={upperButton}><UpSquareOutlined /> </Tooltip></a>}
        { <a onClick={props.onLastColumnClick.bind(this, 'slave', 'lowerButton', record)}> <Tooltip placement="top" title={lowerButton}><DownSquareOutlined /> </Tooltip></a>}
      </div>
      {props.getLastColumnButton(text, record, index)}
    }



    return <div>
      <WrapComponent
        {...props}
        getButtonGroup={getButtonGroup}
        onButtonClick={onButtonClick}
        onFinish={onFinish}
        getLastColumnButton={getLastColumnButton}
      />
    </div>
  };
};

export default commonBillEvent;






