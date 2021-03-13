import React from 'react';
import { Tree } from 'antd';


export function TreeComponent(params) {
  return <Tree treeData={params.treeData} height={params.height} />;
}
