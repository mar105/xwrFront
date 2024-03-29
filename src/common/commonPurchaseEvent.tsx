import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

const commonPurchaseEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const childDataChange = (name, returnData, container, slaveDataOld, slaveModifyData) => {
      const slaveData: any = [];
      slaveDataOld.forEach(slaveOld => {
        const taxData = { taxId: returnData[name + 'Data'].taxId, taxNo: returnData[name + 'Data'].taxNo, taxName: returnData[name + 'Data'].taxName, taxRate: returnData[name + 'Data'].taxRate };
        let slave = {...slaveOld, handleType: commonUtils.isEmpty(slaveOld.handleType) ? 'modify' : slaveOld.handleType, ...taxData};
        const type = container.containerModel.includes('/material') ? 'material' : 'process';
        const moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, slave, type, type + 'StdMoney');
        slave = {...slave, ...moneyCalcData};
        if (slave.handleType === 'modify') {
          const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
          if (indexModify > -1) {
            slaveModifyData[indexModify] = { ...slaveModifyData[indexModify], ...taxData, ...moneyCalcData };
          } else {
            slaveModifyData.push({ id: slave.id, handleType: slave.handleType, ...taxData, ...moneyCalcData });
          }
        }
        slaveData.push(slave);
      });
      return slaveData;
    }

    const onDataChange = (params) => {
      const { name, fieldName, record, isWait } = params;
      const { [name + 'Container']: container, slaveContainer } = props;
      let returnData = props.onDataChange({...params, isWait: true});
      if (typeof returnData[name + 'Data'] === 'object' && returnData[name + 'Data'].constructor === Object) {
        if (fieldName === 'supplyName') {
          const slaveDataOld = commonUtils.isNotEmptyArr(returnData.slaveData) ? returnData.slaveData : propsRef.current.slaveData;
          const slaveModifyDataOld = commonUtils.isNotEmptyArr(returnData.slaveModifyData) ? returnData.slaveModifyData : propsRef.current.slaveModifyData;
          const slaveData: any = [];
          const slaveModifyData: any = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          slaveDataOld.forEach(slaveOld => {
            const taxData = { taxId: returnData[name + 'Data'].taxId, taxNo: returnData[name + 'Data'].taxNo, taxName: returnData[name + 'Data'].taxName, taxRate: returnData[name + 'Data'].taxRate };
            let slave = {...slaveOld, handleType: commonUtils.isEmpty(slaveOld.handleType) ? 'modify' : slaveOld.handleType, ...taxData};
            let type = slaveContainer.containerModel.includes('/material') ? 'material' : 'process';
            const isWhole = slaveContainer.containerModel.includes('/productWhole');
            let moneyCalcData = {};
            if (isWhole) {
              type = 'product';
              moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, slave, type, type + 'StdMoney', isWhole);
              slave = {...slave, ...moneyCalcData};
            } else {
              moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, slave, type, type + 'StdMoney');
              slave = {...slave, ...moneyCalcData};
            }

            if (slave.handleType === 'modify') {
              const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
              if (indexModify > -1) {
                slaveModifyData[indexModify] = { ...slaveModifyData[indexModify], ...taxData, ...moneyCalcData };
              } else {
                slaveModifyData.push({ id: slave.id, handleType: slave.handleType, ...taxData, ...moneyCalcData });
              }
            }

            if (commonUtils.isNotEmpty(slaveOld.children)) {
              slave.children = childDataChange(name, returnData, container, slaveOld.children, slaveModifyData);
            }
            slaveData.push(slave);
          });
          returnData.slaveData = slaveData;
          returnData.slaveModifyData = slaveModifyData;
        }
      } else {
        if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle'
          || fieldName === 'materialQty' || fieldName === 'convertQty'
          || fieldName === 'materialName' || fieldName === 'materialStyle'
          || fieldName === 'materialStdPrice' || fieldName === 'costPrice'
          || fieldName === 'materialStdMoney' || fieldName === 'costMoney' || fieldName === 'taxName' )) {
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
              let dataRow = {
                ...dataRowOld,
                handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType
              };
              // 计算数量
              if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
                dataRow.measureQty = superiorRow.measureQty > 0 ?
                  (measureQty - dataRow.originalUnMeasureQty) > 0 && dataRowIndex !== superiorRow.children.length - 1 ? dataRow.originalUnMeasureQty : measureQty :
                  (measureQty - dataRow.originalUnMeasureQty) < 0 && dataRowIndex !== superiorRow.children.length - 1 ? dataRow.originalUnMeasureQty : measureQty;
                measureQty = superiorRow.measureQty > 0 ?
                  (measureQty - dataRow.originalUnMeasureQty) > 0 && dataRowIndex !== superiorRow.children.length - 1 ? measureQty - dataRow.originalUnMeasureQty : 0 :
                  (measureQty - dataRow.originalUnMeasureQty) < 0 && dataRowIndex !== superiorRow.children.length - 1 ? measureQty - dataRow.originalUnMeasureQty : 0;
                const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, dataRow, 'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
                dataRow = {...dataRow, ...qtyCalcData};
                const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, dataRow, 'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
                dataRow = {...dataRow, ...convertCalcData};

                if (dataRow.handleType === 'modify') {
                  const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                  if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                    returnData[name + 'ModifyData'][indexModify] = {...returnData[name + 'ModifyData'][indexModify], measureQty: dataRow.measureQty, ...qtyCalcData, ...convertCalcData};
                  } else {
                    returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, measureQty: dataRow.measureQty, ...qtyCalcData, ...convertCalcData});
                  }
                }
              }

              // 计算金额
              if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialQty' || fieldName === 'convertQty'
                || fieldName === 'materialName' || fieldName === 'materialStyle'
                || fieldName === 'materialStdPrice' || fieldName === 'costPrice')) {
                if (fieldName === 'materialStdPrice' || fieldName === 'costPrice') {
                  dataRow = { ...dataRow, [fieldName]: superiorRow[fieldName] };
                  if (dataRow.handleType === 'modify') {
                    const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                    if (indexModify > -1) {
                      returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], [fieldName]: superiorRow[fieldName] };
                    } else {
                      returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, [fieldName]: superiorRow[fieldName] });
                    }
                  }
                }

                const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'material', fieldName);
                dataRow = { ...dataRow, ...moneyCalcData};
                if (dataRow.handleType === 'modify') {
                  const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                  if (indexModify > -1) {
                    returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
                  } else {
                    returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, ...moneyCalcData });
                  }
                }
              }
              else if (container.containerModel.includes('/material') && (fieldName === 'materialStdMoney' || fieldName === 'costMoney' || fieldName === 'taxName')) {
                dataRow = { ...dataRow, materialStdPrice: superiorRow.materialStdPrice };
                if (dataRow.handleType === 'modify') {
                  const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                  if (indexModify > -1) {
                    returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], materialStdPrice: superiorRow.materialStdPrice };
                  } else {
                    returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, materialStdPrice: superiorRow.materialStdPrice });
                  }
                }
                //子数据同步更新
                if (fieldName === 'taxName') {
                  dataRow = { ...dataRow, [fieldName]: superiorRow[fieldName], ...returnData.assignValue };
                  if (dataRow.handleType === 'modify') {
                    const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                    if (indexModify > -1) {
                      returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], [fieldName]: superiorRow[fieldName], ...returnData.assignValue };
                    } else {
                      returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, [fieldName]: superiorRow[fieldName], ...returnData.assignValue });
                    }
                  }
                }
                // 此数还是通过价格算金额
                const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, dataRow,'material', fieldName);
                dataRow = { ...dataRow, ...moneyCalcData};
                if (dataRow.handleType === 'modify') {
                  const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === dataRow.id);
                  if (indexModify > -1) {
                    returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
                  } else {
                    returnData[name + 'ModifyData'].push({ id: dataRow.id, handleType: dataRow.handleType, ...moneyCalcData });
                  }
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
              const index = returnData[name + 'Data'].findIndex(item => item.id === record.allId.split(',')[0]);
              if (index > -1) {
                superiorRow = returnData[name + 'Data'][index];
              }
            }

            // 计算数量
            if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialName' || fieldName === 'materialStyle')) {
              let measureQty = 0;
              superiorRow.children.forEach((dataRow) => {
                measureQty = measureQty + commonUtils.isEmptyDefault(dataRow.measureQty, 0);
              });
              superiorRow = { ...superiorRow, handleType: commonUtils.isEmpty(superiorRow.handleType) ? 'modify' : superiorRow.handleType  };
              superiorRow.measureQty = measureQty;
              const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, superiorRow, 'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
              superiorRow = {...superiorRow, ...qtyCalcData};
              const convertCalcData = commonUtils.getMeasureQtyToConvertCalc(props.commonModel, superiorRow, 'material', 'measureQty', 'convertQty', 'measureToConvertFormulaId', 'measureToConvertCoefficient');
              superiorRow = {...superiorRow, ...convertCalcData};

              if (superiorRow.handleType === 'modify') {
                const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === superiorRow.id);
                if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
                  returnData[name + 'ModifyData'][indexModify] = {...returnData[name + 'ModifyData'][indexModify], ...qtyCalcData, ...convertCalcData};
                } else {
                  returnData[name + 'ModifyData'].push({ id: superiorRow.id, handleType: superiorRow.handleType, ...qtyCalcData, ...convertCalcData});
                }
              }
            }

            // 计算金额
            if (container.containerModel.includes('/material') && (fieldName === 'measureQty' || fieldName === 'materialQty' || fieldName === 'convertQty'
              || fieldName === 'materialName' || fieldName === 'materialStyle'
              || fieldName === 'materialStdPrice' || fieldName === 'costPrice')) {
              const moneyCalcData = commonUtils.getStdPriceToMoney(props.commonModel, propsRef.current.masterData, superiorRow,'material', fieldName);
              superiorRow = { ...superiorRow, ...moneyCalcData};
              if (superiorRow.handleType === 'modify') {
                const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === superiorRow.id);
                if (indexModify > -1) {
                  returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
                } else {
                  returnData[name + 'ModifyData'].push({ id: superiorRow.id, handleType: superiorRow.handleType, ...moneyCalcData});
                }
              }
            }
            else if (container.containerModel.includes('/material') && (fieldName === 'materialStdMoney' || fieldName === 'costMoney' || fieldName === 'taxName')) {
              const moneyCalcData = commonUtils.getStdMoneyToPrice(props.commonModel, propsRef.current.masterData, superiorRow,'product', fieldName);
              superiorRow = { ...superiorRow, ...moneyCalcData};
              if (superiorRow.handleType === 'modify') {
                const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === superiorRow.id);
                if (indexModify > -1) {
                  returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...moneyCalcData };
                } else {
                  returnData[name + 'ModifyData'].push({ id: superiorRow.id, handleType: superiorRow.handleType, ...moneyCalcData});
                }
              }
            }

            if (container.isTree) {
              props.setTreeNode(returnData[name + 'Data'], superiorRow, record.allId.split(',')[0]);
            } else {
              const index = returnData[name + 'Data'].findIndex(item => item.id === record.allId.split(',')[0]);
              if (index > -1) {
                returnData[name + 'Data'][index] = superiorRow;
              }
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






