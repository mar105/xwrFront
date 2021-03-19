import React from 'react';
import {Form, Tree} from 'antd';

const FormItem = Form.Item;
export function TreeComponent(params) {
  console.log(111111122222, params.treeData);
  return <FormItem><Tree treeData={params.treeData} height={params.height} {...params.event} /></FormItem>;
}
