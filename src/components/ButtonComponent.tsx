import React from 'react';
import { Form, Dropdown, Button } from 'antd';
import { componentType } from '../utils/commonTypes';

const FormItem = Form.Item;

export function ButtonComponent(params) {
  if (params.componentType === componentType.Soruce) {
    if (params.isDropDown) {
      return <Dropdown.Button {...params.property} {...params.event}>{params.caption}</Dropdown.Button>;
    } else {
      return <Button {...params.property} {...params.event}>{params.caption}</Button>;
    }
  } else {
    if (params.isDropDown) {
      return <FormItem><Dropdown.Button {...params.property} {...params.event}>{params.caption}</Dropdown.Button></FormItem>;
    } else {
      return <FormItem><Button {...params.property} {...params.event}>{params.caption}</Button></FormItem>;
    }
  }

}
