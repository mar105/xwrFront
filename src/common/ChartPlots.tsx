/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-08-02 20:18:18
 * @FilePath: \xwrFront\src\xwrSale\routes\saleOrder\SaleOrder.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { connect } from 'dva';
import React, { useMemo} from 'react';
import commonBase from "./commonBase";
import * as commonUtils from "../utils/commonUtils";

import {ColumnPlot} from "../components/plots/ColumnPlot";
import {PiePlot} from "../components/plots/PiePlot";
// import {LinePlot} from "../components/plots/LinePlot";
// import {AreaPlot} from "../components/plots/AreaPlot";
// import {BarPlot} from "../components/plots/BarPlot";

const ChartPlots = (props) => {
  const { slaveContainer, slaveData } = props;
  if (commonUtils.isNotEmptyObj(slaveContainer) && commonUtils.isNotEmpty(slaveContainer.virtualCondition)) {
    const virtualCondition = JSON.parse(slaveContainer.virtualCondition);
    let config = {};
    let component: any = '';
    if (virtualCondition.chartType === 'ColumnChart') {  //柱形图
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

      config = { data: slaveData || [], xField, yField, meta };
      component = useMemo(()=>{ return (
        <ColumnPlot {...config} />)}, [slaveData]);
    }
    else if (virtualCondition.chartType === 'PieChart') { //饼图
      let angleField = '';
      let colorField = '';
      virtualCondition.groupBy.split(',').forEach((keyOld, index) => {
        const key = keyOld.trim();
        if (index === 0) {
          colorField = key;
          const sumIndex = slaveContainer.slaveData.findIndex(item => item.isSum);
          if (sumIndex > -1) {
            angleField = slaveContainer.slaveData[sumIndex].fieldName;
          }
        }
      });

      config = { data: slaveData ||[], angleField, colorField };

      component = useMemo(()=>{ return (
        <PiePlot {...config} />)}, [slaveData]);
    }
    // else if (virtualCondition.chartType === 'LineChart') { //折线图
    //   let xField = '';
    //   let yField = '';
    //   virtualCondition.groupBy.split(',').forEach((keyOld, index) => {
    //     const key = keyOld.trim();
    //     if (index === 0) {
    //       xField = key;
    //       const sumIndex = slaveContainer.slaveData.findIndex(item => item.isSum);
    //       if (sumIndex > -1) {
    //         yField = slaveContainer.slaveData[sumIndex].fieldName;
    //       }
    //     }

    //   });

    //   config = { data: slaveData ||[], xField, yField };

    //   component = useMemo(()=>{ return (
    //     <LinePlot {...config} />)}, [slaveData]);
    // }

    // else if (virtualCondition.chartType === 'AreaChart') { //面积图
    //   let xField = '';
    //   let yField = '';
    //   virtualCondition.groupBy.split(',').forEach((keyOld, index) => {
    //     const key = keyOld.trim();
    //     if (index === 0) {
    //       xField = key;
    //       const sumIndex = slaveContainer.slaveData.findIndex(item => item.isSum);
    //       if (sumIndex > -1) {
    //         yField = slaveContainer.slaveData[sumIndex].fieldName;
    //       }
    //     }

    //   });

    //   config = { data: slaveData || [], xField, yField };

    //   component = useMemo(()=>{ return (
    //     <AreaPlot {...config} />)}, [slaveData]);
    // }

    // else if (virtualCondition.chartType === 'BarChart') { //条形图
    //   let xField = '';
    //   let yField = '';
    //   virtualCondition.groupBy.split(',').forEach((keyOld, index) => {
    //     const key = keyOld.trim();
    //     if (index === 0) {
    //       yField = key;
    //       const sumIndex = slaveContainer.slaveData.findIndex(item => item.isSum);
    //       if (sumIndex > -1) {
    //         xField = slaveContainer.slaveData[sumIndex].fieldName;
    //       }
    //     }

    //   });

    //   config = { data: slaveData, xField, yField, seriesField: yField };

    //   component = useMemo(()=>{ return (
    //     <BarPlot {...config} />)}, [slaveData]);
    // }


    return (
      <div>
        {component}
      </div>
    );
  } else {
    return '';
  }

}

export default connect(commonUtils.mapStateToProps)(commonBase(ChartPlots));