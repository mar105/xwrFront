import React from 'react';
import {Form, Input, message} from 'antd';
import { componentType } from '../utils/commonTypes';

export function InputComponent(params) {
  if (params.password) {
    if (params.componentType === componentType.Soruce) {
      return <Input.Password {...params.property} visibilityToggle={false} />;
    } else {
      return <Form.Item
        label={params.label}
        name={params.fieldName}
        rules={params.rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.fieldName] !== currentValues[params.fieldName]
        }
        }>
        <Input.Password {...params.property} visibilityToggle={false} />
      </Form.Item>;
    }
  } else if (params.search) {
    if (params.componentType === componentType.Soruce) {
      return <Input.Search {...params.property} {...params.event} />;
    } else {
      return <Form.Item
        label={params.label}
        name={params.fieldName}
        rules={params.rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.fieldName] !== currentValues[params.fieldName]
        }
        }>
        <Input.Search {...params.property} {...params.event} />
      </Form.Item>;
    }
  } else {
    const onKeyUp = (e) => {
      if (e.key === 'F2') {
        message.info(params.fieldName);
      }
    }
    const event = {
      onChange: params.event && params.event.onChange ? params.event.onChange.bind(this, params.name, params.fieldName, params.record) : null,
      onKeyUp,
    }
    if (params.componentType === componentType.Soruce) {
      return <Input {...params.property} { ...event } />;
    } else {
      return <Form.Item
        label={params.label}
        name={params.fieldName}
        rules={params.rules}
        shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
        }
        }>
        <Input {...params.property} { ...event }/>
      </Form.Item>;
    }
  }

}
