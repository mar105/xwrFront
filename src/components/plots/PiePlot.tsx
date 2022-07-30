import React from 'react';
import { Pie } from '@ant-design/charts';

export function PiePlot(params) {
  const config = {
    appendPadding: 10,
    radius: 0.75,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    interactions: [
      {
        type: 'element-selected',
      },
      {
        type: 'element-active',
      },
    ],
    ...params,
  };

  return <Pie {...config} />;

}
