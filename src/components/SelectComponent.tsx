import React from 'react';
import { Form, Select } from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';

const { Option } = Select;
export function SelectComponent(params) {
  let dropOptions: any = [];
  if (params.dropType === 'const') {
    const array: any = commonUtils.objectToArr(commonUtils.stringToObj(params.dropOptions));
    for (const optionObj of array) {
      const option: any = (<Option value={optionObj.id}>{optionObj.value}</Option>);
      dropOptions.push(option);
    };
  }
  if (params.componentType === componentType.Soruce) {
    return <Select {...params.property}>{dropOptions}</Select>;
  } else {
    return <Form.Item
      label={params.label}
    name={params.fieldName}
    rules={params.rules}
    shouldUpdate={(prevValues, currentValues) => { return prevValues[params.fieldName] !== currentValues[params.fieldName]
    }
  }>
      <Select {...params.property}>{dropOptions}</Select>
    </Form.Item>;
  }

}
