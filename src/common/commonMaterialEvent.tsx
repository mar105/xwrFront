import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";

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
        if (fieldName === 'outWarehouseLocationName') {
          const { slaveData: slaveDataOld, slaveModifyData: slaveModifyDataOld } = propsRef.current;
          const slaveData: any = [];
          const slaveModifyData: any = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          if (commonUtils.isNotEmptyObj(slaveDataOld)) {
            slaveDataOld.forEach(slaveOld => {
              const outWarehoseLocationData = { outWarehouseLocationName: returnData[name + 'Data'].outWarehouseLocationName, outWarehouseLocationCode: returnData[name + 'Data'].outWarehouseLocationCode, outWarehouseLocationId: returnData[name + 'Data'].outWarehouseLocationId };
              const slave = {...slaveOld, handleType: commonUtils.isEmpty(slaveOld.handleType) ? 'modify' : slaveOld.handleType, ...outWarehoseLocationData};
              slaveData.push(slave);
              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = { ...slaveModifyData[indexModify], ...outWarehoseLocationData };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, ...outWarehoseLocationData });
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

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
      />
    </div>
  };
};

export default commonMaterialEvent;






