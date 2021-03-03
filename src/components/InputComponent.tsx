import React from 'react';
import { Form, Input } from 'antd';
import { componentType } from '../utils/commonTypes';

export function InputComponent(params) {
  if (params.componentType === componentType.Soruce) {
    if (params.password) {
      return <Input.Password {...params.property} />;
    } else {
      return <Input {...params.property} />;
    }
  } else if (params.password) {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
      }
      }>
      <Input.Password {...params.property} />
    </Form.Item>;
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
