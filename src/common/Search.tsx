import React, {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import { componentType, searchType } from "../utils/commonTypes";
import {SelectComponent} from "../components/SelectComponent";
import {Form} from "antd";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";
import {ButtonComponent} from "../components/ButtonComponent";
import { DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

const Search = (props) => {
  useEffect(() => {
    const { slaveContainer, searchData: searchDataOld, searchRowKeys: searchRowKeysOld, dispatchModifyState } = props;
    const searchConfig = slaveContainer.slaveData.filter(item => item.isSearch === 1);
    const searchRowKeys: any = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : [...searchRowKeysOld];
    const searchData = commonUtils.isEmptyArr(searchDataOld) ? {} : {...searchDataOld};
    const firstViewDrop: any = [];

    if (commonUtils.isNotEmptyArr(searchConfig)) {
      if (commonUtils.isEmptyArr(searchRowKeys)) {
        const key = commonUtils.newId();
        searchRowKeys.push(key);
        searchData['first' + key] = searchConfig[0].fieldName;
        const secondViewDrop = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
          searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
            searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
              searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
                searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
        searchData['second' + key] = secondViewDrop[0].id;
      }
      searchConfig.forEach(item => {
        firstViewDrop.push({id: item.fieldName, value: item.viewName});
      });

    }
    dispatchModifyState({ searchConfig, searchRowKeys, searchData, firstViewDrop });
  }, []);

  const onDataChange = (params) => {
    const { fieldName, value } = params;
    const { searchConfig, dispatchModifyState }: any = props;
    const returnData = props.onDataChange({ ...params, isWait: true});
    if (fieldName.indexOf('first') > -1) {
      const index = searchConfig.findIndex(item => item.fieldName === value);
      if (index > -1) {
        const secondFieldName = fieldName.replace('first', 'second');
        const secondViewDrop = searchConfig[index].fieldType === 'varchar' ? searchType.varchar :
          searchConfig[index].fieldType === 'datetime' ? searchType.datetime :
            searchConfig[index].fieldType === 'tinyint' ? searchType.tinyint :
              searchConfig[index].fieldType === 'varchar' ? searchType.varchar :
                searchConfig[index].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
        returnData.searchData[secondFieldName] = secondViewDrop[0].id;
        dispatchModifyState({ ...returnData });
      }
    } else if (fieldName.indexOf('second') > -1) {
      const firstFieldName = fieldName.replace('second', 'first');
      const thirdFieldName = fieldName.replace('second', 'third');
      const index = searchConfig.findIndex(item => item.fieldName === returnData.searchData[firstFieldName]);
      if (index > -1 && searchConfig[index].fieldType === 'datetime') {
        // 防止月转=或者今天时日期格式不对
        returnData.searchData[thirdFieldName] = moment().format('YYYY-MM-DD');
      }
      //-------------------------------
      if (returnData.searchData[fieldName] === 'today') {
        returnData.searchData[thirdFieldName] = moment().format('YYYY-MM-DD');
      }
      else if (returnData.searchData[fieldName] === 'month') {
        returnData.searchData[thirdFieldName] = moment().format("YYYY-MM");
      }
      else if (returnData.searchData[fieldName] === 'monthPre') {
        returnData.searchData[thirdFieldName] = moment().startOf('month').subtract('month', 1).format('YYYY-MM');
      }
      dispatchModifyState({ ...returnData });
    } else {
      dispatchModifyState({ ...returnData });
    }
  }

  const onButtonClick = async (key, e) => {
    const name = 'slave';
    const { containerData, searchRowKeys: searchRowKeysOld, searchData: searchDataOld, dispatchModifyState, [name + 'Container']: container, [name + 'SorterInfo']: sorterInfo } = props;
    const searchData = {...searchDataOld};
    const searchRowKeys = [...searchRowKeysOld];
    let addState: any = {};
    const searchConfig = container.slaveData.filter(item => item.isSearch === 1);
    if (key === 'addConditionButton') {
      const key = commonUtils.newId();
      searchRowKeys.push(key);
      searchData['first' + key] = searchConfig[0].fieldName;
      const secondViewDrop = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
        searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
          searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
            searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
              searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
      searchData['second' + key] = secondViewDrop[0].id;
      dispatchModifyState({ searchRowKeys, searchData });
    } else if (key === 'searchButton') {
      const searchCondition: any = [];
      searchRowKeys.forEach(key => {
        searchCondition.push({ fieldName: searchData['first' + key], condition: searchData['second' + key], fieldValue: searchData['third' + key] });
      });
      addState[name + 'SearchCondition'] = searchCondition;
      dispatchModifyState({[name + 'Loading']: true });
      const returnData: any = await props.getDataList({ name, containerId: container.id, pageNum: container.isTree === 1 ? undefined : 1, condition: { searchCondition, sorterInfo }, isWait: true });
      addState = {...addState, ...returnData};

      const index = containerData.findIndex(item => item.superiorContainerId === container.id);
      if (index > -1) {
        //嵌套表不分页
        const superiorData = addState[container.dataSetName + 'Data'];
        if (commonUtils.isNotEmptyArr(superiorData)) {
          const childData: any = [];
          for (const superior of superiorData) {
            const searchNestCondition = commonUtils.isNotEmptyObj(props[containerData[index].dataSetName + 'SearchCondition']) ? [...props[containerData[index].dataSetName + 'SearchCondition']] : [];
            searchNestCondition.push({ fieldName: containerData[index].treeSlaveKey, condition: '=', fieldValue: superior[containerData[index].treeKey] });
            searchNestCondition.push(...searchCondition);
            const returnData: any = await props.getDataList({ name: containerData[index].dataSetName, containerId: containerData[index].id, pageNum: undefined,
              condition: { searchCondition: searchNestCondition, sorterInfo: props[containerData[index].dataSetName + 'SorterInfo'] }, isWait: true });
            childData.push(...returnData[containerData[index].dataSetName + 'Data']);
          };
          addState = {...addState, [containerData[index].dataSetName + 'Data']: childData, [containerData[index].dataSetName + 'ModifyData']: [], [containerData[index].dataSetName + 'DelData']: []};
        }

      }

      dispatchModifyState({...addState});
    }
  }

  const onRemoveSearch = (key) => {
    const { searchRowKeys: searchRowKeysOld, dispatchModifyState } = props;
    const searchRowKeys = [...searchRowKeysOld];
    const index = searchRowKeys.findIndex(item => item === key);
    if (index > -1) {
      searchRowKeys.splice(index, 1);
      dispatchModifyState({ searchRowKeys });
    }
  }

  const { searchData: searchDataOld, searchRowKeys: searchRowKeysOld, firstViewDrop, searchConfig } = props;
  const searchData = commonUtils.isEmptyObj(searchDataOld) ? {} : searchDataOld;
  const searchRowKeys = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : searchRowKeysOld;
  const searchComponent = searchRowKeys.map(key => {
    // 判断值要在下拉中存在的才显示出来。
    if (firstViewDrop && firstViewDrop.findIndex(item => item.id === searchData['first' + key]) > -1) {
      const firstConfig = {
        id: commonUtils.newId(),
        fieldName: 'first' + key,
        dropType: 'const',
        viewDrop: firstViewDrop,
      };

      const firstParams = {
        name: props.name,
        componentType: componentType.Soruce,
        config: firstConfig,
        property: {value: searchData['first' + key]},
        record: searchData,
        event: {onChange: onDataChange, getSelectList: props.getSelectList }
      };

      const index = commonUtils.isEmptyArr(searchConfig) ? -1 : searchConfig.findIndex(item => item.fieldName === searchData['first' + key]);
      const secondContainerConfig = index > -1 ? searchConfig[index] : {};
      const secondViewDrop = secondContainerConfig.fieldType === 'varchar' ? searchType.varchar :
        secondContainerConfig.fieldType === 'datetime' ? searchType.datetime :
          secondContainerConfig.fieldType === 'tinyint' ? searchType.tinyint :
            secondContainerConfig.fieldType === 'varchar' ? searchType.varchar :
              secondContainerConfig.fieldType === 'varchar' ? searchType.varchar : searchType.varchar;

      const secondConfig = {
        id: commonUtils.newId(),
        fieldName: 'second' + key,
        dropType: 'const',
        viewDrop: secondViewDrop,
      };

      const secondParams = {
        name: props.name,
        componentType: componentType.Soruce,
        config: secondConfig,
        property: {value: searchData['second' + key]},
        record: searchData,
        event: {onChange: onDataChange, getSelectList: props.getSelectList }
      };

      const thirdConfig = index > -1 ? {
        ...searchConfig[index],
        id: commonUtils.newId(),
        fieldName: 'third' + key,
      } : {
        id: commonUtils.newId(),
        fieldName: 'third' + key,
      };

      const thirdParams = {
        name: props.name,
        componentType: componentType.Soruce,
        // -----------------日期使用-----------------
        dateType: searchData['second' + key] === 'between' || searchData['second' + key] === 'betweenTime' ? 'RangePicker' : '',
        // ----------------------------------
        config: thirdConfig,
        property: {
          // -----------------日期使用-----------------
          showTime: searchData['second' + key] === 'betweenTime',
          picker: searchData['second' + key] === 'month' || searchData['second' + key] === 'monthPre' ? 'month' : undefined,
          // ----------------------------------
          value: searchData['third' + key]},
        record: searchData,
        event: {onChange: onDataChange, getSelectList: props.getSelectList }
      };

      // const thirdInputProps = {
      //   name: props.name,
      //   componentType: componentType.Soruce,
      //   config: thirdConfig,
      //   property: {value: searchData['third' + key]},
      //   record: searchData,
      //   event: {onChange: onDataChange}
      // };

      const firstComponent = <SelectComponent {...firstParams} />;
      const secondComponent = <SelectComponent {...secondParams}  />;
      let thirdComponent;
      if (thirdConfig.fieldType === 'varchar') {
        if (thirdConfig.dropType === 'sql' || thirdConfig.dropType === 'const') {
          thirdComponent = <SelectComponent {...thirdParams}  />;
        } else {
          thirdComponent = <div style={{width: 200}}><InputComponent {...thirdParams}  /> </div>;
        }
      } else if (thirdConfig.fieldType === 'decimal' || thirdConfig.fieldType === 'smallint' || thirdConfig.fieldType === 'int') {
        thirdComponent = <NumberComponent {...thirdParams}  />;
      } else if (thirdConfig.fieldType === 'tinyint') {
        thirdComponent = <CheckboxComponent {...thirdParams}  />;
      } else if (thirdConfig.fieldType === 'datetime') {
        thirdComponent = <DatePickerComponent {...thirdParams} />;
      }

      return <div>{firstComponent} {secondComponent} {thirdComponent}
        {searchRowKeys.length === 1 ? '' : <a onClick={onRemoveSearch.bind(this, key)}><DeleteOutlined /></a>}
      </div>;
    }

  });
  const addConditionButton = {
    caption: '添加条件',
    property: { name: 'addConditionButton', htmlType: 'button' },
    event: { onClick: onButtonClick.bind(this, 'addConditionButton') },
    componentType: componentType.Soruce,
  };

  const searchButton = {
    caption: '搜索',
    property: { name: 'searchButton', htmlType: 'button' },
    event: { onClick: onButtonClick.bind(this, 'searchButton') },
    componentType: componentType.Soruce,
  };

  return (<Form>
    {commonUtils.isEmptyArr(searchRowKeys) ? '' :
      <div>
        {searchComponent}
        <ButtonComponent {...addConditionButton} />
        <ButtonComponent {...searchButton} />
      </div>
    }
  </Form>);
}

export default Search;