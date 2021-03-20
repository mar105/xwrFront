import React from 'react';
import { Form, Button } from 'antd';
import { componentType } from '../utils/commonTypes';

const FormItem = Form.Item;

export function ButtonComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <Button {...params.property} {...params.event}>{params.caption}</Button>;
  }
  return <FormItem><Button {...params.property} {...params.event}>{params.caption}</Button></FormItem>;
}
