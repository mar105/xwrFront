import React from 'react';
import { Column } from '@ant-design/charts';

export function ColumnPlot(params) {
  const config = {
    label: {
      // 可手动配置 label 数据标签位置
      position: 'middle',
      // 'top', 'bottom', 'middle',
      // 配置样式
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    ...params,
  }

  return <Column {...config} />;

}
