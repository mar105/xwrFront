import React from 'react';
import { Form, Select } from 'antd';
import { componentType } from '../utils/commonTypes';

export function SelectComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <Select {...params.property} />;
  } else {
    return <Form.Item
      label={params.label}
    name={params.fieldName}
    rules={params.rules}
    shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
    }
  }>
    <Select {...params.property} />
    </Form.Item>;
  }

}
