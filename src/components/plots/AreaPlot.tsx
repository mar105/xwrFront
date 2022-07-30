import React from 'react';
import { Area } from '@ant-design/charts';

export function AreaPlot(params) {
  const config = {
    xAxis: {
      range: [0, 1],
    },
    ...params,
  }

  return <Area {...config} />;

}
