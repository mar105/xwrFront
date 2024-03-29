import React from 'react';
import {Form, DatePicker, message} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from "../utils/commonUtils";
import moment from 'moment';

const { RangePicker } = DatePicker;

export function DatePickerComponent(params) {
  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }
  const onChange = (date, dateString) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, fieldType: params.config.fieldType,
        componentType: params.dateType === 'RangePicker' ? 'RangePicker' : 'DatePicker', record: params.record, value: dateString});
    }
  }
  let value: any = null;
  if (params.dateType === 'RangePicker') {
    value = [];
    if (commonUtils.isNotEmpty(params.property.value)) {
      params.property.value.split(',').forEach(child => {
        value.push(moment(child).isValid() ? moment(child) : null);
      });
    }
  } else {
    value = moment(params.property.value).isValid() ? moment(params.property.value) : null;
  }

  const event = {
    onChange,
    onKeyUp,
  }
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }
  if (params.dateType === 'RangePicker') {
    if (params.componentType === componentType.Soruce) {
      return <RangePicker bordered={false} {...params.property} value={value} { ...event }/>;
    } else {
      return <Form.Item
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
        }
        }>
        <RangePicker {...params.property} { ...event }/>
      </Form.Item>;
    }
  } else {
    if (params.componentType === componentType.Soruce) {
      return <DatePicker bordered={false} {...params.property} value={value} { ...event }/>;
    } else {
      return <Form.Item
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
        }
        }>
        <DatePicker {...params.property} { ...event }/>
      </Form.Item>;
    }
  }


}
