import React from 'react';
import { Form, Input } from 'antd';
import { componentType } from '../utils/commonTypes';

// export type paramProps = {
//   form: any,
//   fieldName: string,
//   property: string,
//   rules: object,
// }
//
// const InputComponent: React.FC<paramProps> = (params: paramProps) => {
//   const { getFieldDecorator } = params.form;
//   return (
//     getFieldDecorator(params.fieldName, { rules: [{ ...params.rules }] })(
//       <Input id={params.fieldName} {...params.property} />)
// );
//
// }
// export default InputComponent;

function InputFieldDecoratorComponent(params) {
  const { getFieldDecorator } = params.form;
  return (
    getFieldDecorator(params.fieldName, { rules: [{ ...params.rules }] })(
      <Input id={params.fieldName} {...params.property} />)
  );
}

export function InputComponent(params) {
  if (params.componentType === componentType.FieldDecorator) {
    return InputFieldDecoratorComponent(params);
  } if (params.componentType === componentType.Soruce) {
    return <Input {...params.property} />;
  }
  return <Form.Item>{InputFieldDecoratorComponent(params)}</Form.Item>;
}
