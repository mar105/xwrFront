import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

const commonProductionEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const calcPaper = (params) => {
      const {name, fieldName, record, returnData } = params;
      const { [name + 'Container']: container } = props;
      let dataRow: any = {};
      if (container.isTree) {
        dataRow = props.getTreeNode(returnData[name + 'Data'], record.allId);
        props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
      } else {
        const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (index > -1) {
          dataRow = returnData[name + 'Data'][index];
        }
      }
      if (fieldName === 'singlePQty' || fieldName === 'totalPQty' || fieldName === 'printType' ||
        fieldName === 'frontColor' || fieldName === 'frontSpecialColor' || fieldName === 'backColor' || fieldName === 'backSpecialColor') {
        if (dataRow.totalPQty >= 4) {
          dataRow.plateQty = Math.ceil(dataRow.totalPQty / commonUtils.isEmptyorZeroDefault(dataRow.singlePQty, 1));
          if (dataRow.printType === 'frontBack') { // 样本正反
            if (dataRow.plateQty < 2) {
              dataRow.plateQty = 2;
              dataRow.splitQty = 1;
            } else {
              dataRow.splitQty = Math.ceil(dataRow.plateQty);
            }
            dataRow.totalPlateQty = dataRow.splitQty * (
              commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0) +
              commonUtils.isEmptyDefault(dataRow.backColor, 0) + commonUtils.isEmptyDefault(dataRow.backSpecialColor, 0));
          } else if (dataRow.printType === 'leftRight' || dataRow.printType === 'heavenEarth') { //左右翻 天地翻
            dataRow.splitQty = Math.ceil(dataRow.plateQty);
            dataRow.totalPlateQty = dataRow.splitQty * (
              commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
          } else { //单面
            dataRow.plateQty = commonUtils.isEmptyDefault(dataRow.totalPQty, 0) / 2 / dataRow.singlePQty;
            dataRow.splitQty = Math.ceil(dataRow.plateQty);
            dataRow.totalPlateQty = dataRow.splitQty * (
              commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
          }
          if (dataRow.splitQty > 0 && dataRow.singlePQty > 0) {
            dataRow.machineQty = Math.ceil(commonUtils.isEmptyDefault(dataRow.partQty, 0) * commonUtils.isEmptyDefault(dataRow.totalPQty, 0) / 2 / dataRow.singlePQty / dataRow.splitQty);
            dataRow.totalMachineQty = dataRow.machineQty * dataRow.splitQty;
          }
        } else {
          if (dataRow.printType === 'frontBack') {
            dataRow.plateQty = 2;
            dataRow.totalPlateQty = dataRow.splitQty * (
              commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0) +
              commonUtils.isEmptyDefault(dataRow.backColor, 0) + commonUtils.isEmptyDefault(dataRow.backSpecialColor, 0));
          } else {
            dataRow.plateQty = 1;
            dataRow.totalPlateQty = dataRow.splitQty * (
              commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
          }
          dataRow.splitQty = 1;
          if (dataRow.singlePQty > 0) {
            dataRow.machineQty = Math.ceil(commonUtils.isEmptyDefault(dataRow.partQty, 0) * commonUtils.isEmptyorZeroDefault(dataRow.magnification, 1) / dataRow.singlePQty);
            dataRow.totalMachineQty = dataRow.machineQty * dataRow.splitQty;
          }
        }

        if (dataRow.handleType === 'modify') {
          const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
          if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
            returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify],
              plateQty: dataRow.plateQty,
              splitQty: dataRow.splitQty,
              totalPlateQty: dataRow.totalPlateQty,
              machineQty: dataRow.machineQty,
              totalMachineQty: dataRow.totalMachineQty
            };
          }
        }
      }
      if (container.isTree) {
        props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
      } else {
        const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (index > -1) {
          returnData[name + 'Data'][index] = dataRow;
        }
      }
      return returnData;
    };

    const onDataChange = (params) => {
      const { name, fieldName, record, isWait } = params;
      let returnData = props.onDataChange({...params, isWait: true});
      if(name === 'part') {
        returnData = calcPaper({name, fieldName, record, returnData});


      }

      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }



    const onLastColumnClick = (name, key, record, e, isWait = false) => {
      let addState: any = {};
      if (name === 'slave') {
        //部件
        addState = { ...addState, ...props.delTableData('part', 'slaveId', record.id) };

        //材料
        addState = { ...addState, ...props.delTableData('material', 'slaveId', record.id) };

        //工艺
        addState = { ...addState, ...props.delTableData('process', 'slaveId', record.id) };
      } else if (name === 'part') {
        //材料
        addState = { ...addState, ...props.delTableData('material', 'partId', record.id) };

        //工艺
        addState = { ...addState, ...props.delTableData('process', 'partId', record.id) };
      }
      const returnData = props.onLastColumnClick(name, key, record, e, true);
      if (isWait) {
        return { ...returnData, ...addState  };
      } else {
        props.dispatchModifyState({ ...returnData, ...addState });
      }
    }

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
        onLastColumnClick={onLastColumnClick}
      />
    </div>
  };
};

export default commonProductionEvent;






