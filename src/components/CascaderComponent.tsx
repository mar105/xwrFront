import React from 'react';
import {Cascader, Form, message} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from "../utils/commonUtils";


export function CascaderComponent(params) {
  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }
  const onChange = (value, option) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, componentType: 'Cascader', record: params.record, value, fieldRelevance: params.config.fieldRelevance});
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
  params.property.placeholder = '';
  params.property.showSearch = (inputValue, path) => path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);
  if (params.componentType === componentType.Soruce) {
    return <Cascader bordered={false} {...params.property} {...event}>{params.caption}</Cascader>;
  }
  return (<Form.Item
    label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
    name={params.config.fieldName}
    rules={rules}
    shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName] }
    }>
    <Cascader {...params.property} {...event}>{params.caption}</Cascader>
  </Form.Item>);
}
