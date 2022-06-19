import React from 'react';
import { Form, Checkbox } from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from "../utils/commonUtils";

export function CheckboxComponent(params) {
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }
  const onChange = (e) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, fieldType: params.config.fieldType, componentType: 'Checkbox', record: params.record, value: e.target.checked});
    }
  }
  if (params.componentType === componentType.Soruce) {
    return <Checkbox {...params.property} onChange={onChange} />;
  } else {
    return <Form.Item
      label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
      name={params.config.fieldName}
      rules={rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
    }
  }>
    <Checkbox {...params.property} onChange={onChange} />
    </Form.Item>;
  }

}
