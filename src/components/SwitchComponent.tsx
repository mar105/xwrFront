import React from 'react';
import {Form, Switch} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from "../utils/commonUtils";

export function SwitchComponent(params) {
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }
  const onChange = (checked) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, fieldType: params.config.fieldType, componentType: 'Switch', record: params.record, value: checked});
    }
  }
  if (params.componentType === componentType.Soruce) {
    return <SwitchComponent {...params.property} onChange={onChange} />;
  } else {
    return <Form.Item
      label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
      name={params.config.fieldName}
      rules={rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]}}
    >
      <Switch {...params.property} onChange={onChange} />
    </Form.Item>;
  }

}
