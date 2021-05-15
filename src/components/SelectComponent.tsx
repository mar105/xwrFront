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
  addProperty.showSearch = true;
  addProperty.optionFilterProp = 'children';
  if (params.config.dropType === 'const') {
    const array: any = commonUtils.objectToArr(commonUtils.stringToObj(params.config.viewDrop));
    for (const optionObj of array) {
      const option: any = (<Option key={optionObj.id} value={optionObj.id}>{optionObj.value}</Option>);
      dropOptions.push(option);
    };
    addProperty.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  } else {
    const array: any = commonUtils.isEmptyArr(modifySelfState.viewDrop) ? [] : modifySelfState.viewDrop;
    for (const optionObj of array) {
      const viewOption = commonUtils.isEmpty(params.config.keyUpFieldDrop) ? optionObj.id : optionObj[params.config.keyUpFieldDrop];
      const option: any = (<Option key={optionObj.id} value={optionObj.id} optionObj={optionObj}>{viewOption}</Option>);
      dropOptions.push(option);
    };
    addProperty.filterOption = (input, option) => {
      return !modifySelfState.isLastPage || commonUtils.isEmpty(option.children) ? true : option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  }

  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }

  const onDropdownVisibleChange = async (open) => {
    if (open) {
      const dropParam = { pageNum: 1, isWait: true, containerSlaveId: params.config.id };
      if (params.config.dropType === 'sql') {
        dispatchModifySelfState({ loading: true });
        const selectList = await params.event.getSelectList(dropParam);
        dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, loading: false });
      }
    }
  }

  const onPopupScroll = async (e) => {
    const { target } = e;
    if (Math.ceil(target.scrollTop + target.offsetHeight) >= target.scrollHeight && params.config.dropType === 'sql' && !modifySelfState.isLastPage) {
      const dropParam = { pageNum: modifySelfState.pageNum + 1, isWait: true, containerSlaveId: params.config.id, condition: { searchValue: modifySelfState.searchValue } };
      const selectList = await params.event.getSelectList(dropParam);
      dispatchModifySelfState({ ...selectList, viewDrop: [...modifySelfState.viewDrop, ...selectList.list]});
    }
  };
  const debounceSearch = async (value) => {
    const dropParam = { pageNum: 1, isWait: true, containerSlaveId: params.config.id, condition: { searchValue: value } };
    const selectList = await params.event.getSelectList(dropParam);
    dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, searchValue: value});
  };

  const callDebounceSearch = debounce(debounceSearch, 500);
  const onSearch = (value) => {
    if (params.config.dropType === 'sql') {
      callDebounceSearch(value);
    }
  }

  const onChange = (value, option) => {
    if (params.event && params.event.onChange) {
      params.event.onChange(params.name, params.config.fieldName, params.record, params.config.assignField, value, option);
    }
    dispatchModifySelfState({ searchValue: '' });
  }

  const event = {
    onChange,
    onKeyUp,
    onDropdownVisibleChange,
    onPopupScroll,
    onSearch,
  }
  const rules: any = [];
  if (params.config.isRequired) {
    rules.push({ required: params.config.isRequired, message: commonUtils.isEmpty(params.property.placeholder) ? '请输入' + params.config.viewName : params.property.placeholder })
  }
  params.property.loading = modifySelfState.loading;
  if (params.componentType === componentType.Soruce) {
    return <Select {...params.property} {...addProperty} { ...event }>{dropOptions}</Select>;
  } else {
    return <Form.Item
      label={commonUtils.isEmpty(params.property.placeholder) ? params.config.viewName : ''}
      name={params.config.fieldName}
      rules={rules}
      shouldUpdate={(prevValues, currentValues) => { return prevValues[params.config.fieldName] !== currentValues[params.config.fieldName] }
  }>
      <Select {...params.property} {...addProperty} { ...event }>{dropOptions}</Select>
    </Form.Item>;
  }

}
