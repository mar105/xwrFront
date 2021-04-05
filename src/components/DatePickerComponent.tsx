import React from 'react';
import { Form, DatePicker } from 'antd';
import { componentType } from '../utils/commonTypes';

export function DatePickerComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <DatePicker {...params.property} />;
  } else {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
      }
      }>
      <DatePicker {...params.property} />
    </Form.Item>;
  }

}
