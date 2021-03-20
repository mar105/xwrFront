import React from 'react';
import {Form, Tree} from 'antd';
import {componentType} from "../utils/commonTypes";

const FormItem = Form.Item;
export function TreeComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <Tree style={{ width: 300 }} {...params.property} {...params.event} />;
  } else {
    return <FormItem><Tree style={{ width: 300 }} {...params.property} {...params.event} /></FormItem>;
  }

}
