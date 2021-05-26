import React, {useMemo} from "react";
import * as commonUtils from "../utils/commonUtils";
import { componentType, searchType } from "../utils/commonTypes";
import {SelectComponent} from "../components/SelectComponent";
const Search = (params) => {
  const { slaveContainer } = params;
  const searchConfig = slaveContainer.slaveData.filter(item => item.isSearch === 1);
  const searchRowKeys: any = [];
  const searchData = {};
  const firstViewDrop = {};
  if (commonUtils.isNotEmptyArr(searchConfig)) {
    const key = commonUtils.newId();
    searchRowKeys.push(key);
    searchData['first' + key] = searchConfig[0].fieldName;
    searchData['second' + key] = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
      searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
        searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
          searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
            searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
    searchConfig.forEach(item => {
      firstViewDrop[item.fieldName] = item.viewName;
    })

  }
  const searchComponent = searchRowKeys.map(key => {
    const firstConfig = {
      id: commonUtils.newId(),
      fieldName: 'first' + key,
      dropType: 'const',
      viewDrop: JSON.stringify(firstViewDrop),
    };

    const firstParams = {
      name: params.name,
      componentType: componentType.Soruce,
      config: firstConfig,
      property: {value: searchData['first' + key]},
      record: searchData,
      event: {onChange: params.onSelectChange, getSelectList: params.getSelectList }
    };

    const firstComponent = useMemo(() => {
      return (<SelectComponent {...firstParams}  />
      )
    }, [searchData['first' + key]]);
    return firstComponent;
  });
  return (<div>{searchComponent}</div>);
}

export default Search;