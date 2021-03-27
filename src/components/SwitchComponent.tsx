import React from 'react';
import {Form, Switch} from 'antd';
import { componentType } from '../utils/commonTypes';

export function SwitchComponent(params) {
  if (params.componentType === componentType.Soruce) {
    return <SwitchComponent {...params.property} />;
  } else {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
      }
      }>
      <Switch {...params.property} />
    </Form.Item>;
  }

}
