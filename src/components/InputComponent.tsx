import React from 'react';
import { Form, Input } from 'antd';
import { componentType } from '../utils/commonTypes';

export function InputComponent(params) {
  if (params.password) {
    if (params.componentType === componentType.Soruce) {
      return <Input.Password {...params.property} />;
    } else {
      return <Form.Item
        label={params.label}
        name={params.fieldName}
        rules={params.rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.fieldName] !== currentValues[params.fieldName]
        }
        }>
        <Input.Password {...params.property} />
      </Form.Item>;
    }
  } else {
    if (params.componentType === componentType.Soruce) {
      return <Input {...params.property} />;
    } else {
      return <Form.Item
        label={params.label}
        name={params.fieldName}
        rules={params.rules}
        shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
        }
        }>
        <Input {...params.property} />
      </Form.Item>;
    }
  }

}
