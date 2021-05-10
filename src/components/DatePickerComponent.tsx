import React from 'react';
import {Form, DatePicker, message} from 'antd';
import { componentType } from '../utils/commonTypes';

export function DatePickerComponent(params) {
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
    return <DatePicker {...params.property} { ...event }/>;
  } else {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
      }
      }>
      <DatePicker {...params.property} { ...event }/>
    </Form.Item>;
  }

}
