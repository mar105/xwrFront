import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../../utils/commonUtils";

const commonFinanceEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    let form;
    const onSetForm = (formNew) => {
      form = formNew;
      props.onSetForm(form);
    }

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

    const onDataChange = (params) => {
      const { name, fieldName, isWait } = params;
      const { slaveData: slaveDataOld, slaveModifyData: slaveModifyDataOld } = propsRef.current;

      // 开始修改数据
      const addState: any = {};
      let returnData = props.onDataChange({...params, isWait: true});
      if (name === 'master') {
        if (fieldName === 'totalInvoiceMoney') {
          let negativeMoney = 0; // 负数金额
          let positiveMoney = 0; // 正数金额
          const slaveData = [...slaveDataOld];
          const slaveModifyData = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          slaveData.forEach(slave => {
            if (slave.balanceMoney > 0) {
              positiveMoney = positiveMoney + slave.balanceMoney;
            } else {
              negativeMoney = negativeMoney + slave.balanceMoney;
            }
          });
          if (returnData.masterData.totalInvoiceMoney - Math.abs(positiveMoney + negativeMoney) >= 0) {
            slaveDataOld.forEach((slaveOld, index) => {
              const slave = { ...slaveOld };
              slave.handleType = commonUtils.isEmpty(slave.handleType) ? 'modify' : slave.handleType;
              slave.invoiceMoney = slave.balanceMoney;
              slaveData[index] = slave;
              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = {...slaveModifyData[indexModify], invoiceMoney: slave.invoiceMoney };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, invoiceMoney: slave.invoiceMoney })
                }
              }
            });
            addState.slaveData = slaveData;
            addState.slaveModifyData = slaveModifyData;
            const exchangeRate = commonUtils.isEmptyorZeroDefault(returnData.masterData.exchangeRate, 1);
            returnData.masterData.preInvoiceMoney = returnData.masterData.totalInvoiceMoney - (positiveMoney + negativeMoney);
            returnData.masterData.preInvoiceBaseMoney = returnData.masterData.preInvoiceMoney / exchangeRate;
            const modifyData = { preInvoiceMoney: returnData.masterData.preInvoiceMoney,
              preInvoiceBaseMoney : returnData.masterData.preInvoiceBaseMoney};

            returnData.masterModifyData = returnData.masterData.handleType === 'modify' ?
              commonUtils.isEmptyObj(returnData.masterModifyData) ?
                { id: returnData.masterData.id, handleType: returnData.masterData.handleType, ...modifyData } :
                { ...returnData.masterModifyData, id: returnData.masterData.id, ...modifyData } : returnData.masterModifyData;
          } else {
            let isNegative = false;
            let minusMoney = 0;
            if (returnData.masterData.totalInvoiceMoney + Math.abs(negativeMoney) > positiveMoney) {
              isNegative = true;
              //当发票
              minusMoney = returnData.masterData.totalInvoiceMoney + positiveMoney;
            } else {
              minusMoney = returnData.masterData.totalInvoiceMoney + Math.abs(negativeMoney);
            }

              // returnData.masterData.totalInvoiceMoney + Math.abs(negativeMoney);
            slaveData.forEach((slaveOld, index) => {
              const slave = {...slaveOld};
              slave.handleType = commonUtils.isEmpty(slave.handleType) ? 'modify' : slave.handleType;
              if (isNegative) {
                if (slave.balanceMoney < 0) {
                  slave.invoiceMoney = minusMoney - Math.ceil(slave.balanceMoney) > 0 ? slave.balanceMoney : -minusMoney;
                  minusMoney = minusMoney - Math.ceil(slave.balanceMoney) > 0 ? -(minusMoney - Math.ceil(slave.balanceMoney)) : 0;
                } else {
                  slave.invoiceMoney = slave.balanceMoney;
                }
              } else {
                if (slave.balanceMoney > 0) {
                  slave.invoiceMoney = minusMoney - Math.ceil(slave.balanceMoney) > 0 ? slave.balanceMoney : minusMoney;
                  minusMoney = minusMoney - Math.ceil(slave.balanceMoney) > 0 ? minusMoney - Math.ceil(slave.balanceMoney) : 0;
                } else {
                  slave.invoiceMoney = slave.balanceMoney;
                }
              }
              slaveData[index] = slave;

              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = {...slaveModifyData[indexModify], invoiceMoney: slave.invoiceMoney };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, invoiceMoney: slave.invoiceMoney })
                }
              }
            });

            addState.slaveData = slaveData;
            addState.slaveModifyData = slaveModifyData;
            returnData.masterData.preInvoiceMoney = 0;
            returnData.masterData.preInvoiceBaseMoney = 0;
            const modifyData = { preInvoiceMoney: returnData.masterData.preInvoiceMoney,
              preInvoiceBaseMoney : returnData.masterData.preInvoiceBaseMoney};

            returnData.masterModifyData = returnData.masterData.handleType === 'modify' ?
              commonUtils.isEmptyObj(returnData.masterModifyData) ?
                { id: returnData.masterData.id, handleType: returnData.masterData.handleType, ...modifyData } :
                { ...returnData.masterModifyData, id: returnData.masterData.id, ...modifyData } : returnData.masterModifyData;
          }
        }
        form.setFieldsValue(commonUtils.setFieldsValue(returnData[params.name + 'Data'], props[params.name + 'Container']));
      }

      if (isWait) {
        return { ...returnData, ...addState };
      } else {
        props.dispatchModifyState({ ...returnData, ...addState });
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
        onDataChange={onDataChange}
        onSetForm={onSetForm}
      />
    </div>
  };
};

export default commonFinanceEvent;






