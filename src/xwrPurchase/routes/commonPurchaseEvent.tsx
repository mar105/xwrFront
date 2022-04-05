import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../../utils/commonUtils";

const commonPurchaseEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const onDataChange = (params) => {
      const { name, fieldName, record, isWait } = params;
      const { [name + 'Container']: container } = props;
      let returnData = props.onDataChange({...params, isWait: true});
      if (fieldName === 'measureQty') {
        if (commonUtils.isNotEmptyArr(record.children)) {
          //主数据输入

          let superiorRow: any = {};
          if (container.isTree) {
            superiorRow = props.getTreeNode(returnData[name + 'Data'], record.allId);
          } else {
            const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
            if (index > -1) {
              superiorRow = returnData[name + 'Data'][index];
            }
          }
          const childData: any = [];
          let measureQty = superiorRow.measureQty;
          superiorRow.children.forEach((dataRowOld, dataRowIndex) => {
            let dataRow = { ...dataRowOld, handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType };
            dataRow.measureQty = (measureQty - dataRow.originalUnMeasureQty) > 0 && dataRowIndex !== superiorRow.children.length - 1 ? dataRow.originalUnMeasureQty : measureQty;
            measureQty = (measureQty - dataRow.originalUnMeasureQty) > 0 && dataRowIndex !== superiorRow.children.length - 1 ? measureQty - dataRow.originalUnMeasureQty : 0;
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow, 'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
            dataRow = {...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow, 'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            dataRow = {...dataRow, ...convertCalcData};
            if (dataRow.handleType === 'modify') {
              const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
              if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                returnData[name + 'ModifyData'][indexModify] = {...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData};
              } else {
                returnData[name + 'ModifyData'].push({...dataRow, ...qtyCalcData, ...convertCalcData});
              }
            }
            childData.push(dataRow);
          });
          superiorRow.children = childData;
        }
        else if (record.allId.split(',').length >= 2) {
          let superiorRow: any = {};
          if (container.isTree) {
            superiorRow = props.getTreeNode(returnData[name + 'Data'], record.allId.split(',')[0]);
          } else {
            const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
            if (index > -1) {
              superiorRow = returnData[name + 'Data'][index];
            }
          }

          let measureQty = 0;
          superiorRow.children.forEach((dataRow) => {
            measureQty = measureQty + dataRow.measureQty;
          });
          superiorRow = { ...superiorRow, handleType: commonUtils.isEmpty(superiorRow.handleType) ? 'modify' : superiorRow.handleType  };
          superiorRow.measureQty = measureQty;
          const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, superiorRow, 'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
          superiorRow = {...superiorRow, ...qtyCalcData};
          const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, superiorRow, 'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
          superiorRow = {...superiorRow, ...convertCalcData};
          if (superiorRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
              returnData[name + 'ModifyData'][indexModify] = {...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData};
            } else {
              returnData[name + 'ModifyData'].push({...superiorRow, ...qtyCalcData, ...convertCalcData});
            }
          }

          if (container.isTree) {
            props.setTreeNode(returnData[name + 'Data'], superiorRow, record.allId);
          } else {
            const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
            if (index > -1) {
              returnData[name + 'Data'][index] = superiorRow;
            }
          }
        }
      }

      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
      />
    </div>
  };
};

export default commonPurchaseEvent;






