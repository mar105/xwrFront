import React from 'react';
import { Form, InputNumber } from 'antd';
import { componentType } from '../utils/commonTypes';

export function NumberComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <InputNumber {...params.property} onChange={ params.event && params.event.onChange ? params.event.onChange.bind(this, params.name, params.fieldName, params.record) : null }/>;
  } else {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
      }
      }>
      <InputNumber {...params.property} onChange={ params.event && params.event.onChange ? params.event.onChange.bind(this, params.name, params.fieldName, params.record) : null }/>
    </Form.Item>;
  }

}
