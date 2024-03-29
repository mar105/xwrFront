import React, {useReducer} from 'react';
import {Divider, Form, Input, message, Select, Row, Col } from 'antd';
import { componentType } from '../utils/commonTypes';
import * as commonUtils from '../utils/commonUtils';
import debounce from 'lodash/debounce';
import { SaveOutlined, PlusSquareOutlined, SelectOutlined } from '@ant-design/icons';

const { Option } = Select;
export function SelectComponent(params) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action };
  },{});

  let dropOptions: any = [];
  const addProperty: any = {};
  addProperty.showSearch = true;
  addProperty.optionFilterProp = 'children';
  addProperty.mode = params.config.isMultiChoise ? 'multiple' : '';
  addProperty.optionLabelProp = 'label';
  addProperty.value = params.config.isMultiChoise ?
    commonUtils.isEmpty(params.property.value) ? undefined : params.property.value.split(',') : params.property.value;
  if (params.config.dropWidth > 0) {
    addProperty.dropdownMatchSelectWidth = params.config.dropWidth;
  }


  const onPopup = () => {
    if (params.config.dropType === 'popup') {
      const dropParam = { name: params.name, type: 'popupActive', config: params.config, record: params.record };
      params.event.onDropPopup(dropParam);
    }
  };

  if (params.config.dropType === 'const') {
    const array: any = typeof params.config.viewDrop === 'string' ?
      commonUtils.objectToArr(commonUtils.stringToObj(params.config.viewDrop)) : params.config.viewDrop;
    if (commonUtils.isNotEmptyArr(array)) {
      for (const optionObj of array) {
        const option: any = (<Option key={optionObj.id} value={optionObj.id} label={optionObj.value}>{optionObj.value}</Option>);
        dropOptions.push(option);
      };
    }

    addProperty.filterOption = (input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  } else if (params.config.dropType === 'sql' || params.config.dropType === 'current') {
    const array: any = commonUtils.isEmptyArr(modifySelfState.viewDrop) ? [] : modifySelfState.viewDrop;
    for (const optionObj of array) {
      const viewValue = commonUtils.isEmpty(params.config.keyUpFieldDrop) ? optionObj.id : optionObj[params.config.keyUpFieldDrop];
      let viewOption = viewValue;
      if (params.config.viewColumnDrop) {
        let rowView: any = '';
        const count = Math.floor(24 / params.config.viewColumnDrop.split(',').length);
        params.config.viewColumnDrop.split(',').forEach((key) => {
          rowView = optionObj[key.trim()] ? <>{rowView}<Col span={count}>{optionObj[key.trim()]}</Col></> : <>{rowView}<Col span={count}></Col></>
        });
        viewOption = <div><Row>{rowView}</Row></div>;
      }
      const option: any = (<Option key={optionObj.id} value={optionObj.id} label={optionObj[params.config.keyUpFieldDrop]} optionObj={optionObj}>{viewOption}</Option>);
      dropOptions.push(option);
    };
    addProperty.filterOption = (input, option) => {
      return !modifySelfState.isLastPage || commonUtils.isEmpty(option.children) ? true : option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  } else if (params.config.dropType === 'popup') {
    addProperty.open = false;
    addProperty.suffixIcon = <SelectOutlined onClick={onPopup} />
  }

  const onKeyUp = (e) => {
    if (e.key === 'F2') {
      message.info(params.config.fieldName);
    }
  }

  const onDropdownVisibleChange = async (open) => {
    if (open) {
      const dropParam = { name: params.name, record: params.record, pageNum: 1, fieldName: params.config.fieldName, isWait: true,
        containerSlaveId: params.config.id, config: params.config };
      if (params.config.dropType === 'sql' || params.config.dropType === 'current') {
        dispatchModifySelfState({ loading: true });
        const selectList = await params.event.getSelectList(dropParam);
        dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, loading: false, open });
      }
    }
  }

  const onPopupScroll = async (e) => {
    const { target } = e;
    if (Math.ceil(target.scrollTop + target.offsetHeight) >= target.scrollHeight && params.config.dropType === 'sql' && !modifySelfState.isLastPage) {
      const dropParam = { name: params.name, record: params.record, pageNum: modifySelfState.pageNum + 1, fieldName: params.config.fieldName, isWait: true,
        containerSlaveId: params.config.id, config: params.config, condition: { searchValue: modifySelfState.searchValue } };
      const selectList = await params.event.getSelectList(dropParam);
      dispatchModifySelfState({ ...selectList, viewDrop: [...modifySelfState.viewDrop, ...selectList.list]});
    }
  };
  const debounceSearch = async (value) => {
    const dropParam = { name: params.name, record: params.record, pageNum: 1, fieldName: params.config.fieldName, isWait: true,
      containerSlaveId: params.config.id, config: params.config, condition: { searchValue: value } };
    const selectList = await params.event.getSelectList(dropParam);
    dispatchModifySelfState({ ...selectList, viewDrop: selectList.list, searchValue: value});
  };

  const callDebounceSearch = debounce(debounceSearch, 500);
  const onSearch = (value) => {
    if (params.config.dropType === 'sql' || params.config.dropType === 'current') {
      callDebounceSearch(value);
    }
  }

  const onChange = (value, option) => {
    if (params.event && params.event.onChange) {
      params.event.onChange({name: params.name, fieldName: params.config.fieldName, fieldType: params.config.fieldType, componentType: 'Select', record: params.record, assignField: params.config.assignField, value, option});
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
        {params.config.isDropAdd ?
          <div>
            <Divider style={{ margin: '4px 0' }} />
            <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
              <Input style={{ flex: 'auto' }} value={modifySelfState.dropAddName} onChange={onDropAddNameChange} />
              <a style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }} onClick={onClick.bind(this, 'addItem')} > <SaveOutlined /> </a>
              <a style={{ flex: 'none', padding: '8px', display: 'block', cursor: 'pointer' }} onClick={onClick.bind(this, 'popup')} > <PlusSquareOutlined /> </a>
            </div>
          </div>
          : '' }
      </div>
    )
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
  params.property.allowClear = params.config.isDropEmpty;
  params.property.dropdownRender = ((params.config.dropType === 'sql' || params.config.dropType === 'current') && commonUtils.isNotEmpty(params.config.viewColumnDrop)) || params.config.isDropAdd ? dropdownRender : null;

  if (params.componentType === componentType.Soruce) {
    return <Select bordered={false} {...params.property} {...addProperty} { ...event }>{dropOptions}</Select>;
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
