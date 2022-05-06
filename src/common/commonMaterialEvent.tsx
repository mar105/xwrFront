import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../xwrMaterialInventory/application";
import * as request from "../utils/request";

const commonMaterialEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const onDataChange = (params) => {
      const { name, fieldName, isWait } = params;
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

export default commonMaterialEvent;






