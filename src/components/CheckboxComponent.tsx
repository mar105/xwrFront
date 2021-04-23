import React from 'react';
import { Form, Checkbox } from 'antd';
import { componentType } from '../utils/commonTypes';

export function CheckboxComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <Checkbox {...params.property} />;
  } else {
    return <Form.Item
      label={params.label}
    name={params.fieldName}
    rules={params.rules}
    shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
    }
  }>
    <Checkbox {...params.property} />
    </Form.Item>;
  }

}
