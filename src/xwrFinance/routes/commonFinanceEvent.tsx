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


    const onDataChange = (params) => {
      const { name, fieldName, isWait } = params;
      const { commonModel, slaveData: slaveDataOld, slaveModifyData: slaveModifyDataOld } = propsRef.current;
      const moneyPlace = commonModel.userInfo.shopInfo ? commonModel.userInfo.shopInfo.moneyPlace : 6;
      // 开始修改数据
      const addState: any = {};
      let returnData = props.onDataChange({...params, isWait: true});
      if (name === 'master') {
        if (fieldName === 'totalInvoiceMoney' || fieldName === 'totalReceiptMoney' || fieldName === 'totalPaymentMoney') {
          const typeLower = fieldName === 'totalInvoiceMoney' ? 'invoice' : fieldName === 'totalReceiptMoney' ? 'receipt' : 'payment';
          const typeUpper = fieldName === 'totalInvoiceMoney' ? 'Invoice' : fieldName === 'totalReceiptMoney' ? 'Receipt' : 'Payment';
          let negativeMoney = 0; // 负数金额
          let positiveMoney = 0; // 正数金额
          const slaveData = [...slaveDataOld];
          const slaveModifyData = commonUtils.isEmptyArr(slaveModifyDataOld) ? [] : slaveModifyDataOld;
          slaveData.forEach(slave => {
            if (slave.originalUnMoney > 0) {
              positiveMoney = positiveMoney + slave.originalUnMoney;
            } else {
              negativeMoney = negativeMoney + slave.originalUnMoney;
            }
          });
          // 当总金额 > 正数与负数金额时 明细金额与未清金额直接一致，剩余为预收。
          if (returnData.masterData['total' + typeUpper + 'Money'] - Math.abs(positiveMoney + negativeMoney) >= 0) {
            slaveDataOld.forEach((slaveOld, index) => {
              const slave = { ...slaveOld };
              slave.handleType = commonUtils.isEmpty(slave.handleType) ? 'modify' : slave.handleType;
              slave[typeLower + 'Money'] = slave.originalUnMoney;
              slaveData[index] = slave;
              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = {...slaveModifyData[indexModify], [typeLower + 'Money']: slave[typeLower + 'Money'] };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, [typeLower + 'Money']: slave[typeLower + 'Money'] })
                }
              }
            });
            addState.slaveData = slaveData;
            addState.slaveModifyData = slaveModifyData;
            const exchangeRate = commonUtils.isEmptyorZeroDefault(returnData.masterData.exchangeRate, 1);
            returnData.masterData['pre' + typeUpper + 'Money'] = returnData.masterData['total' + typeUpper + 'Money'] - (positiveMoney + negativeMoney);
            returnData.masterData['pre' + typeUpper + 'BaseMoney'] = returnData.masterData['pre' + typeUpper + 'Money'] / exchangeRate;
            const modifyData = { ['pre' + typeUpper + 'Money']: returnData.masterData['pre' + typeUpper + 'Money'],
              ['pre' + typeUpper + 'BaseMoney'] : returnData.masterData['pre' + typeUpper + 'BaseMoney']};

            returnData.masterModifyData = returnData.masterData.handleType === 'modify' ?
              commonUtils.isEmptyObj(returnData.masterModifyData) ?
                { id: returnData.masterData.id, handleType: returnData.masterData.handleType, ...modifyData } :
                { ...returnData.masterModifyData, id: returnData.masterData.id, ...modifyData } : returnData.masterModifyData;
          } else {
            let isNegative = false;
            let minusMoney = 0;
            if (returnData.masterData['total' + typeUpper + 'Money'] + Math.abs(negativeMoney) > positiveMoney) {
              isNegative = true;
              minusMoney = returnData.masterData['total' + typeUpper + 'Money'] + positiveMoney;
            } else {
              minusMoney = returnData.masterData['total' + typeUpper + 'Money'] + Math.abs(negativeMoney);
            }

            // 当总金额 < 正数与负数金额时
            // 1、总金额 + 绝对值(负数金额) > 正数金额时
            //     说明负数金额冲不完，负数金额只能使用（总金额+正数金额）一个个相减到0。
            //      正数金额直接=未清金额
            // 2、总金额 + 绝对值(负数金额) < 正数金额时
            //     说明负数金额能全部冲完，正数金额只能使用（总金额+正数金额）一个个相减到0。
            //      负数金额直接=未清金额
            slaveData.forEach((slaveOld, index) => {
              const slave = {...slaveOld};
              slave.handleType = commonUtils.isEmpty(slave.handleType) ? 'modify' : slave.handleType;
              if (isNegative) {
                if (slave.originalUnMoney < 0) {
                  slave[typeLower + 'Money'] = commonUtils.round(minusMoney - Math.abs(slave.originalUnMoney) > 0 ? slave.originalUnMoney : -minusMoney, moneyPlace);
                  minusMoney = commonUtils.round(minusMoney - Math.abs(slave.originalUnMoney) > 0 ? -(minusMoney - Math.abs(slave.originalUnMoney)) : 0, moneyPlace);
                } else {
                  slave[typeLower + 'Money'] = slave.originalUnMoney;
                }
              } else {
                if (slave.originalUnMoney > 0) {
                  slave[typeLower + 'Money'] = commonUtils.round(minusMoney - Math.abs(slave.originalUnMoney) > 0 ? slave.originalUnMoney : minusMoney, moneyPlace);
                  minusMoney = commonUtils.round(minusMoney - Math.abs(slave.originalUnMoney) > 0 ? minusMoney - Math.abs(slave.originalUnMoney) : 0, moneyPlace);
                } else {
                  slave[typeLower + 'Money'] = slave.originalUnMoney;
                }
              }
              slaveData[index] = slave;


              if (slave.handleType === 'modify') {
                const indexModify = slaveModifyData.findIndex(item => item.id === slave.id);
                if (indexModify > -1) {
                  slaveModifyData[indexModify] = {...slaveModifyData[indexModify], [typeLower + 'Money']: slave[typeLower + 'Money'] };
                } else {
                  slaveModifyData.push({ id: slave.id, handleType: slave.handleType, [typeLower + 'Money']: slave[typeLower + 'Money'] })
                }
              }
            });

            addState.slaveData = slaveData;
            addState.slaveModifyData = slaveModifyData;
            returnData.masterData['pre' + typeUpper + 'Money'] = 0;
            returnData.masterData['pre' + typeUpper + 'BaseMoney'] = 0;
            const modifyData = { ['pre' + typeUpper + 'Money']: returnData.masterData['pre' + typeUpper + 'Money'],
              ['pre' + typeUpper + 'BaseMoney'] : returnData.masterData['pre' + typeUpper + 'BaseMoney']};

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

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
        onSetForm={onSetForm}
      />
    </div>
  };
};

export default commonFinanceEvent;






