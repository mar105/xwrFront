import React, {useReducer} from 'react';
import {Divider, Form, Input, message, TreeSelect} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';
import { PlusOutlined, PlusSquareOutlined } from '@ant-design/icons';

export function TreeSelectComponent(params) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});
  const addProperty: any = {};
  addProperty.showSearch = true;
  addProperty.treeNodeFilterProp = params.config.treeColumnNameDrop;
  addProperty.multiple = params.config.multiple;
  if (params.config.dropType === 'const') {
    addProperty.treeData = typeof params.config.viewDrop === 'string' ?
      commonUtils.stringToObj(params.config.viewDrop) : params.config.viewDrop;
  } else {
    addProperty.treeData = commonUtils.isEmptyArr(modifySelfState.viewDrop) ? [] : modifySelfState.viewDrop;
  }

  if (params.config.multiple) {
    addProperty.value = commonUtils.isEmpty(addProperty.value) ? [] : typeof addProperty.value === 'string' ? addProperty.value.split(',') : addProperty.value;
  }

  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }

  const onDropdownVisibleChange = async (open) => {
    if (open) {
      const dropParam = { fieldName: params.config.fieldName, isWait: true, containerSlaveId: params.config.id, config: params.config };
      if (params.config.dropType === 'sql') {
        dispatchModifySelfState({ loading: true });
        const selectList = await params.event.getSelectList(dropParam);
        dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, loading: false });
      }
    }
  }

  const onChange = (value, label, extra) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, fieldType: params.config.fieldType, componentType: 'TreeSelect', record: params.record, assignField: params.config.assignField, value, extra});
    }
    dispatchModifySelfState({ searchValue: '' });
  }

  const onDropAddNameChange = (e) => {
    dispatchModifySelfState({ dropAddName: e.target.value });
  }

  const onClick = (name) => {
    if (name === 'addItem') {

    }
    else if (name === 'popup') {
      const dropParam = { name: params.name, type: 'popupAdd', config: params.config, record: params.record };
      params.event.onDropPopup(dropParam);
    }
  };

  const dropdownRender = menu => {
    return (
      <div>
        {menu}
        <Divider style={{ margin: '4px 0' }} />
        <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
          <Input style={{ flex: 'auto' }} value={modifySelfState.dropAddName} onChange={onDropAddNameChange} />
          <a style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }} onClick={onClick.bind(this, 'addItem')} > <PlusOutlined /> </a>
          <a style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }} onClick={onClick.bind(this, 'popup')} > <PlusSquareOutlined /> </a>
        </div>
      </div>
  )}

  const event = {
    onChange,
    onKeyUp,
    onDropdownVisibleChange,
  }
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }

  params.property.loading = modifySelfState.loading;
  params.property.allowClear = params.config.isDropEmpty;
  params.property.dropdownRender = params.config.isDropAdd ? dropdownRender : null;
  params.property.fieldNames = { label: params.config.treeColumnNameDrop, value: params.config.treeKeyDrop };
  if (params.componentType === componentType.Soruce) {
    return <TreeSelect treeDefaultExpandAll bordered={false} {...params.property} {...addProperty} { ...event } />;
  } else {
    return <Form.Item
      label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
      name={params.config.fieldName}
      rules={rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName] }
  }>
      <TreeSelect treeDefaultExpandAll {...params.property} {...addProperty} { ...event } />
    </Form.Item>;
  }

}
