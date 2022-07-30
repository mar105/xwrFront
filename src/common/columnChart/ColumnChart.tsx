/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-07-28 23:49:58
 * @FilePath: \xwrFront\src\xwrSale\routes\saleOrder\SaleOrder.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { connect } from 'dva';
import React, { useMemo} from 'react';
import commonBase from "../commonBase";
import * as commonUtils from "../../utils/commonUtils";

import {ColumnPlot} from "../../components/plots/ColumnPlot";

const ColumnChart = (props) => {
  const { slaveContainer, slaveData } = props;
  if (commonUtils.isNotEmptyObj(slaveContainer) && commonUtils.isNotEmpty(slaveContainer.virtualCondition)) {
    const virtualCondition = JSON.parse(slaveContainer.virtualCondition);
    const meta = {};
    let xField = '';
    let yField = '';
    virtualCondition.groupBy.split(',').forEach((keyOld, index) => {
      const key = keyOld.trim();
      const configIndex = slaveContainer.slaveData.findIndex(item => item.fieldName === key);
      if (configIndex > -1) {
        meta[key] = { alias: slaveContainer.slaveData[configIndex].viewName };
      }
      if (index === 0) {
        xField = key;
        const sumIndex = slaveContainer.slaveData.findIndex(item => item.isSum);
        if (sumIndex > -1) {
          yField = slaveContainer.slaveData[sumIndex].fieldName;
          meta[yField] = { alias: slaveContainer.slaveData[sumIndex].viewName };
        }
      }

    });

    const config = { data: slaveData, xField, yField, meta };

    const component = useMemo(()=>{ return (
      <ColumnPlot {...config} />)}, [slaveData]);
    return (
      <div>
        {component}
      </div>
    );
  } else {
    return '';
  }

}

export default connect(commonUtils.mapStateToProps)(commonBase(ColumnChart));