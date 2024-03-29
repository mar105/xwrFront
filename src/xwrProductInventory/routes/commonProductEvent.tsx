import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../../utils/commonUtils";

const commonProductEvent = (WrapComponent) => {
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
      if (typeof returnData[name + 'Data'] === 'object' && returnData[name + 'Data'].constructor === Object) {
        if (fieldName === 'inWarehouseLocationName') {
          const { slaveData: slaveDataOld, slaveModifyData: slaveModifyDataOld } = propsRef.current;
          const slaveData: any = [];
          const slaveModifyData: any = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          if (commonUtils.isNotEmptyObj(slaveDataOld)) {
            slaveDataOld.forEach(slaveOld => {
              const inWarehouseLocationData = { inWarehouseLocationName: returnData[name + 'Data'].inWarehouseLocationName, inWarehouseLocationCode: returnData[name + 'Data'].inWarehouseLocationCode, inWarehouseLocationId: returnData[name + 'Data'].inWarehouseLocationId };
              const slave = {...slaveOld, handleType: commonUtils.isEmpty(slaveOld.handleType) ? 'modify' : slaveOld.handleType, ...inWarehouseLocationData};
              slaveData.push(slave);
              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = { ...slaveModifyData[indexModify], ...inWarehouseLocationData };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, ...inWarehouseLocationData });
                }
              }
            });
            returnData.slaveData = slaveData;
            returnData.slaveModifyData = slaveModifyData;
          }
        }
      } else if (name === 'slave') {
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

    const onButtonClick = async (key, config, e, childParams: any = undefined) => {
      if (key === 'inventoryButton') {
        const { dispatch, slaveData: slaveDataOld, slaveContainer: container, masterContainer, slaveDelData: slaveDelDataOld, masterData } = propsRef.current;
        const slaveDelData: any = commonUtils.isEmptyArr(slaveDelDataOld) ? [] : slaveDelDataOld;
        const slaveData: any = [];

        if (commonUtils.isEmpty(masterData.warehouseLocationId)) {
          let notNull = '';
          let index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'notNull');
          if (index > -1) {
            notNull = props.commonModel.commonConstant[index].viewName;
          } else {
            notNull = '不能为空！';
          }
          index = masterContainer.slaveData.findIndex(item => item.fieldName === 'warehouseLocationName');
          if (index > -1) {
            props.gotoError(dispatch, {code: '6001', msg: masterContainer.slaveData[index].viewName + notNull });
          } else {
            props.gotoError(dispatch, {code: '6001', msg: '仓库不能为空！'});
          }
          return;
        }

        const name = 'slave';
        props.dispatchModifyState({ [name + 'Loading']: true });
        let returnData = await props.getSelectList({name, record: masterData, containerSlaveId: config.id, pageNum: 1, isWait: true, config });
        if (commonUtils.isNotEmptyArr(returnData.list)) {
          returnData.list.forEach(select => {
            const assignValue = commonUtils.getAssignFieldValue(name, config.assignField, select, propsRef.current);
            slaveData.push({ ...props.onAdd(container), ...assignValue, superiorId: masterData.id })
          });
        }
        while (!returnData.isLastPage) {
          returnData = await props.getSelectList({name, record: masterData, containerSlaveId: config.id, pageNum: returnData.pageNum + 1, isWait: true, config });
          if (commonUtils.isNotEmptyArr(returnData.list)) {
            returnData.list.forEach(select => {
              const assignValue = commonUtils.getAssignFieldValue(name, config.assignField, select, propsRef.current);
              slaveData.push({ ...props.onAdd(container), ...assignValue, superiorId: masterData.id })
            });
          }
        }

        if (commonUtils.isNotEmptyArr(slaveData)) {
          slaveDataOld.forEach(slave => {
            if (slave.handleType !== 'add') {
              slave.handleType = 'del';
              slaveDelData.push(slave);
            }

          });
          props.dispatchModifyState({slaveData, slaveDelData, [name + 'Loading']: false });
        }
      } else {
        props.onButtonClick(key, config, e, childParams);
      }
    }

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
        onButtonClick={onButtonClick}
      />
    </div>
  };
};

export default commonProductEvent;






