import React, {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import { componentType, searchType } from "../utils/commonTypes";
import {SelectComponent} from "../components/SelectComponent";
import {Form} from "antd";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";
const Search = (params) => {
  useEffect(() => {
    const { slaveContainer, dispatchModifyState } = params;
    const searchConfig = slaveContainer.slaveData.filter(item => item.isSearch === 1);
    const searchRowKeys: any = [];
    const searchData = {};
    const firstViewDrop: any = [];
    const secondViewDrop = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
      searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
        searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
          searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
            searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
    if (commonUtils.isNotEmptyArr(searchConfig)) {
      const key = commonUtils.newId();
      searchRowKeys.push(key);
      searchData['first' + key] = searchConfig[0].fieldName;
      searchData['second' + key] = secondViewDrop[0].value;
      searchConfig.forEach(item => {
        firstViewDrop.push({id: item.fieldName, value: item.viewName});
      });

    }
    dispatchModifyState({ searchConfig, searchRowKeys, searchData, firstViewDrop, secondViewDrop });
  }, []);

  const { searchData: searchDataOld, searchRowKeys: searchRowKeysOld, firstViewDrop, secondViewDrop, searchConfig } = params;
  const searchData = commonUtils.isEmptyObj(searchDataOld) ? {} : searchDataOld;
  const searchRowKeys = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : searchRowKeysOld;
  const searchComponent = searchRowKeys.map(key => {
    const firstConfig = {
      id: commonUtils.newId(),
      fieldName: 'first' + key,
      dropType: 'const',
      viewDrop: firstViewDrop,
    };

    const firstParams = {
      name: params.name,
      componentType: componentType.Soruce,
      config: firstConfig,
      property: {value: searchData['first' + key]},
      record: searchData,
      event: {onChange: params.onSelectChange, getSelectList: params.getSelectList }
    };

    const secondConfig = {
      id: commonUtils.newId(),
      fieldName: 'second' + key,
      dropType: 'const',
      viewDrop: secondViewDrop,
    };

    const secondParams = {
      name: params.name,
      componentType: componentType.Soruce,
      config: secondConfig,
      property: {value: searchData['second' + key]},
      record: searchData,
      event: {onChange: params.onSelectChange, getSelectList: params.getSelectList }
    };


    const index = searchConfig.findIndex(item => item.fieldName === searchData['first' + key]);
    const thirdConfig = index > -1 ? {
      ...searchConfig[index],
      id: commonUtils.newId(),
      fieldName: 'third' + key,
    } : {
      id: commonUtils.newId(),
      fieldName: 'third' + key,
    };

    const thirdParams = {
      name: params.name,
      componentType: componentType.Soruce,
      config: thirdConfig,
      property: {value: searchData['third' + key]},
      record: searchData,
      event: {onChange: params.onSelectChange, getSelectList: params.getSelectList }
    };

    const thirdInputParams = {
      name: params.name,
      componentType: componentType.Soruce,
      config: thirdConfig,
      property: {value: searchData['third' + key]},
      record: searchData,
      event: {onChange: params.onInputChange}
    };

    const firstComponent = <SelectComponent {...firstParams} />;
    const secondComponent = <SelectComponent {...secondParams}  />;
    let thirdComponent;
    if (thirdConfig.fieldType === 'varchar') {
      if (thirdConfig.dropType === 'sql' || thirdConfig.dropType === 'const') {
        thirdComponent = <SelectComponent {...thirdParams}  />;
      } else {
        thirdComponent = <InputComponent {...thirdInputParams}  />;
      }
    } else if (thirdConfig.fieldType === 'decimal' || thirdConfig.fieldType === 'smallint' || thirdConfig.fieldType === 'int') {
      thirdComponent = <NumberComponent {...thirdParams}  />;
    } else if (thirdConfig.fieldType === 'tinyint') {
      thirdComponent = <CheckboxComponent {...thirdParams}  />;
    } else if (thirdConfig.fieldType === 'datetime') {
      thirdComponent = <DatePickerComponent {...params}  />;
    }
    return <div>{firstComponent} {secondComponent} {thirdComponent}</div>;
  });
  return (<Form>{searchComponent}</Form>);
}

export default Search;