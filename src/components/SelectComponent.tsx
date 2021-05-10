import React from 'react';
import {Form, message, Select} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';

const { Option } = Select;
export function SelectComponent(params) {
  let dropOptions: any = [];
  const addProperty: any = {};
  if (params.dropType === 'const') {
    const array: any = commonUtils.objectToArr(commonUtils.stringToObj(params.viewDrop));
    for (const optionObj of array) {
      const option: any = (<Option key={optionObj.id} value={optionObj.id}>{optionObj.value}</Option>);
      dropOptions.push(option);
    };
    addProperty.showSearch = true;
    addProperty.optionFilterProp = 'children';
    addProperty.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

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
    return <Select {...params.property} {...addProperty} { ...event }>{dropOptions}</Select>;
  } else {
    return <Form.Item
      label={params.label}
      name={params.fieldName}
      rules={params.rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName] }
  }>
      <Select {...params.property} {...addProperty} { ...event }>{dropOptions}</Select>
    </Form.Item>;
  }

}
