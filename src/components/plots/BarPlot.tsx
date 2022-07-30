import React from 'react';
import { Bar } from '@ant-design/charts';

export function BarPlot(params) {
  const config = {
    legend: {
      position: 'top-left',
    },
    ...params,
  }

  return <Bar {...config} />;

}
