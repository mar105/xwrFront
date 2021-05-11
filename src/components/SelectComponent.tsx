import React, {useReducer} from 'react';
import {Form, message, Select} from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';
import debounce from 'lodash/debounce';

const { Option } = Select;
export function SelectComponent(params) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});
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
  } else {
    const array: any = commonUtils.isEmptyArr(modifySelfState.viewDrop) ? [] : modifySelfState.viewDrop;
    for (const optionObj of array) {
      const option: any = (<Option key={optionObj.id} value={optionObj.id}>{optionObj.value}</Option>);
      dropOptions.push(option);
    };
    if (modifySelfState.isLastPage) {
      addProperty.showSearch = true;
      addProperty.optionFilterProp = 'children';
      addProperty.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  }

  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.fieldName);
    }
  }

  const onDropdownVisibleChange = async (open) => {
    if (open) {
      const dropParam = { pageNum: 1, isWait: true, containerSlaveId: params.containerSlaveId };
      if (params.dropType === 'sql') {
        const selectList = await params.event.getSelectList(dropParam);
        dispatchModifySelfState({ ...selectList, viewDrop: selectList.list});
      }
    }
  }

  const onPopupScroll = async (e) => {
    const { target } = e;
    if (Math.ceil(target.scrollTop + target.offsetHeight) >= target.scrollHeight && params.dropType === 'sql' && !modifySelfState.isLastPage) {
      const dropParam = { pageNum: modifySelfState.pageNum + 1, isWait: true, containerSlaveId: params.containerSlaveId };
      const selectList = await params.event.getSelectList(dropParam);
      dispatchModifySelfState({ ...selectList, viewDrop: [...modifySelfState.viewDrop, ...selectList.list]});
    }
  };

  const onSearch = (value) => {
    debounce(debounceSearch(value), 500);
  }
  const debounceSearch = async (value) => {
    const dropParam = { pageNum: modifySelfState.pageNum + 1, isWait: true, containerSlaveId: params.containerSlaveId, condition: {} };
    const selectList = await params.event.getSelectList(dropParam);
    dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, searchValue: value});
  };


  const event = {
    onChange: params.event && params.event.onChange ? params.event.onChange.bind(this, params.name, params.fieldName, params.record) : null,
    onKeyUp,
    onDropdownVisibleChange,
    onPopupScroll,
    onSearch,
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
