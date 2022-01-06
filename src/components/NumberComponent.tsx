import React from 'react';
import {Form, InputNumber, message} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from "../utils/commonUtils";

export function NumberComponent(params) {
  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }
  const onChange = (value) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, componentType: 'Number', record: params.record, value});
    }
  }
  const event = {
    onChange,
    onKeyUp,
  }
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }
  const addState: any = {};
  if (params.config.fieldType === 'smallint' || params.config.fieldType === 'int') {
    addState.precision = 0;
  }
  if (commonUtils.isNotEmpty(params.config.maxValue)) {
    addState.max = params.config.maxValue.trim();
  }
  if (commonUtils.isNotEmpty(params.config.minValue)) {
    addState.min = params.config.minValue.trim();
  }

  if (params.componentType === componentType.Soruce) {
    return <InputNumber bordered={false} {...addState } {...params.property} { ...event }/>;
  } else {
    return <Form.Item
      label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
      name={params.config.fieldName}
      rules={rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
      }
      }>
      <InputNumber {...addState } {...params.property} { ...event }/>
    </Form.Item>;
  }

}
