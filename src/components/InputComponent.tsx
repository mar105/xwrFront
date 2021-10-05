import React from 'react';
import {Form, Input, message} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';

export function InputComponent(params) {
  const rules: any = [];
  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }
  const event = {
    onChange: params.event && params.event.onChange ? params.event.onChange.bind(this, params.name, params.config.fieldName, params.record) : null,
    onKeyUp,
  }
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired,
      message: commonUtils.isNotEmpty(params.config.message) ? params.config.message :
        commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder,
      pattern: params.config.pattern,
    })
  }
  if (params.password) {
    if (params.componentType === componentType.Soruce) {
      return <Input.Password {...params.property} visibilityToggle={false} />;
    } else {
      return <Form.Item
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
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
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
        }
        }>
        <Input.Search {...params.property} {...params.event} />
      </Form.Item>;
    }
  } else if (params.text) {
    if (params.componentType === componentType.Soruce) {
      return <Input.TextArea {...params.property} {...params.event} />;
    } else {
      return <Form.Item
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
        }
        }>
        <Input.TextArea {...params.property} { ...event } />
      </Form.Item>;
    }
  } else {
    if (params.componentType === componentType.Soruce) {
      return <Input bordered={false} {...params.property} { ...event } />;
    } else {
      return <Form.Item
        label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
        name={params.config.fieldName}
        rules={rules}
        shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName]
        }
        }>
        <Input {...params.property} { ...event }/>
      </Form.Item>;
    }
  }

}
