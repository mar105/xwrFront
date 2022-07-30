import React from 'react';
import { Line } from '@ant-design/charts';

export function LinePlot(params) {
  const config = {
    padding: 'auto',
    xAxis: {
      // type: 'timeCat',
      tickCount: 5,
    },
    ...params,
  }

  return <Line {...config} />;

}
