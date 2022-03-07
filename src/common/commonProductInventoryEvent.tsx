import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

const commonProductInventoryEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);


    const onDataChange = (params) => {
      const { name, fieldName, record, isWait } = params;
      const { [name + 'Container']: container } = props;

      // 开始修改数据
      let returnData = props.onDataChange({...params, isWait: true});
      if (name === 'slave') {
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
        if (fieldName === 'measureQty' || fieldName === 'productQty' || fieldName === 'giveQty' || fieldName === 'stockUpQty' ||
          fieldName === 'perPackage' || fieldName === 'perBox' || fieldName === 'packageQty' || fieldName === 'boxQty' ||
          fieldName === 'packageRemnantQty' || fieldName === 'boxRemnantQty') {
          let packageCalcData: any = {};
          const qty = commonUtils.isEmptyDefault(dataRow.measureQty, 0) +
            commonUtils.isEmptyDefault(dataRow.giveQty, 0) +
            commonUtils.isEmptyDefault(dataRow.stockUpQty, 0);
          if (fieldName === 'measureQty' || fieldName === 'productQty' || fieldName === 'giveQty' || fieldName === 'stockUpQty' ||
            fieldName === 'perPackage' || fieldName === 'perBox') {
            if (commonUtils.isEmptyDefault(dataRow.perPackage, 0) > 0) {
              dataRow.packageQty = Math.floor(qty / dataRow.perPackage);
              dataRow.packageRemnantQty = qty - dataRow.packageQty * dataRow.perPackage;
            }
            if (commonUtils.isEmptyDefault(dataRow.perBox, 0) > 0) {
              dataRow.boxQty = Math.floor(dataRow.packageQty / dataRow.perBox);
              dataRow.boxRemnantQty = dataRow.packageQty - dataRow.boxQty * dataRow.perBox;
            }
            packageCalcData = {packageQty: dataRow.packageQty, packageRemnantQty: dataRow.packageRemnantQty,
              boxQty: dataRow.boxQty, boxRemnantQty: dataRow.boxRemnantQty};
          } else if (fieldName === 'packageQty') {
            dataRow.perPackage = commonUtils.isEmptyorZero(dataRow.packageQty) ? 0 :  Math.floor(qty / dataRow.packageQty);
            dataRow.packageRemnantQty = qty - dataRow.packageQty * dataRow.perPackage;
            if (commonUtils.isEmptyDefault(dataRow.perBox, 0) > 0) {
              dataRow.boxQty = Math.floor(dataRow.packageQty / dataRow.perBox);
              dataRow.boxRemnantQty = dataRow.packageQty - dataRow.boxQty * dataRow.perBox;
            }
            packageCalcData = { perPackage: dataRow.perPackage, packageRemnantQty: dataRow.packageRemnantQty,
              boxQty: dataRow.boxQty, boxRemnantQty: dataRow.boxRemnantQty};
          } else if (fieldName === 'boxQty') {
            dataRow.perBox = commonUtils.isEmptyorZero(dataRow.boxQty) ? 0 :  Math.floor(commonUtils.isEmptyDefault(dataRow.packageQty, 0) / dataRow.boxQty);
            dataRow.boxRemnantQty = commonUtils.isEmptyDefault(dataRow.packageQty, 0) - dataRow.boxQty * dataRow.perBox;
            packageCalcData = { perBox: dataRow.perBox, packageRemnantQty: dataRow.packageRemnantQty };
          } else if (fieldName === 'packageRemnantQty') {
            dataRow.measureQty = dataRow.packageQty * commonUtils.isEmptyDefault(dataRow.perPackage, 0) + dataRow.packageRemnantQty;
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            packageCalcData = { ...qtyCalcData, ...convertCalcData, measureQty: dataRow.measureQty };
          } else if (fieldName === 'boxRemnantQty') {
            dataRow.packageQty = dataRow.boxQty * dataRow.perBox + dataRow.boxRemnantQty;
            dataRow.measureQty = dataRow.packageQty * commonUtils.isEmptyDefault(dataRow.perPackage, 0) + commonUtils.isEmptyDefault(dataRow.packageRemnantQty, 0);
            const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow,'product', 'measureQty', 'productQty', 'measureToProductFormulaId', 'measureToProductCoefficient');
            dataRow = { ...dataRow, ...qtyCalcData};
            const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow,'product', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
            packageCalcData = { ...qtyCalcData, ...convertCalcData, measureQty: dataRow.measureQty, packageQty: dataRow.packageQty };
          }

          if (container.isTree) {
            dataRow = { ...dataRow, ...packageCalcData, handleType: commonUtils.isEmpty(dataRow.handleType) ? 'modify' : dataRow.handleType };
            props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
          } else {
            const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
            if (index > -1) {
              dataRow = { ...returnData[name + 'Data'][index], ...packageCalcData, handleType: commonUtils.isEmpty(returnData[name + 'Data'][index].handleType) ? 'modify' : returnData[name + 'Data'][index].handleType };
              returnData[name + 'Data'][index] = dataRow;
            }
          }

          if (dataRow.handleType === 'modify') {
            const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...packageCalcData };
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

export default commonProductInventoryEvent;






