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
const Search = (props) => {
  useEffect(() => {
    const { slaveContainer, dispatchModifyState } = props;
    const searchConfig = slaveContainer.slaveData.filter(item => item.isSearch === 1);
    const searchRowKeys: any = [];
    const searchData = {};
    const firstViewDrop: any = [];

    if (commonUtils.isNotEmptyArr(searchConfig)) {
      const key = commonUtils.newId();
      searchRowKeys.push(key);
      searchData['first' + key] = searchConfig[0].fieldName;
      const secondViewDrop = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
        searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
          searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
            searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
              searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
      searchData['second' + key] = secondViewDrop[0].id;
      searchConfig.forEach(item => {
        firstViewDrop.push({id: item.fieldName, value: item.viewName});
      });

    }
    dispatchModifyState({ searchConfig, searchRowKeys, searchData, firstViewDrop });
  }, []);

  // const onSelectChange = (name, fieldName, record, assignField, value, option) => {
  //   const { dispatchModifyState }: any = props;
  //   const returnData = props.onSelectChange(name, fieldName, record, assignField, value, option, true);
  //   if (fieldName.indexOf('first') > -1) {
  //     returnData.secondViewDrop = searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
  //       searchConfig[0].fieldType === 'datetime' ? searchType.datetime :
  //         searchConfig[0].fieldType === 'tinyint' ? searchType.tinyint :
  //           searchConfig[0].fieldType === 'varchar' ? searchType.varchar :
  //             searchConfig[0].fieldType === 'varchar' ? searchType.varchar : searchType.varchar;
  //     dispatchModifyState({ secondViewDrop });
  //   }
  // }

  const onButtonClick = async (key, e) => {
    const name = 'slave';
    const { searchRowKeys: searchRowKeysOld, searchData: searchDataOld, dispatchModifyState, [name + 'Container']: container } = props;
    const searchData = {...searchDataOld};
    const searchRowKeys = [...searchRowKeysOld];
    const addState = {};
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
      dispatchModifyState({[name + 'Loading']: true });
      const returnData: any = await props.getDataList({ containerId: container.id, pageNum: container.isTree === 1 ? undefined : 1, condition: { searchCondition }, isWait: true });
      addState[name + 'Data'] = returnData.list;
      addState[name + 'Sum'] = returnData.sum;
      addState[name + 'PageNum'] = returnData.pageNum;
      addState[name + 'IsLastPage'] = returnData.isLastPage;
      addState[name + 'Loading'] = false;
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
      event: {onChange: props.onSelectChange, getSelectList: props.getSelectList }
    };

    const index = searchConfig.findIndex(item => item.fieldName === searchData['first' + key]);
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
      event: {onChange: props.onSelectChange, getSelectList: props.getSelectList }
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
      config: thirdConfig,
      property: {value: searchData['third' + key]},
      record: searchData,
      event: {onChange: props.onSelectChange, getSelectList: props.getSelectList }
    };

    const thirdInputprops = {
      name: props.name,
      componentType: componentType.Soruce,
      config: thirdConfig,
      property: {value: searchData['third' + key]},
      record: searchData,
      event: {onChange: props.onInputChange}
    };

    const firstComponent = <SelectComponent {...firstParams} />;
    const secondComponent = <SelectComponent {...secondParams}  />;
    let thirdComponent;
    if (thirdConfig.fieldType === 'varchar') {
      if (thirdConfig.dropType === 'sql' || thirdConfig.dropType === 'const') {
        thirdComponent = <SelectComponent {...thirdParams}  />;
      } else {
        thirdComponent = <div style={{width: 200}}><InputComponent {...thirdInputprops}  /> </div>;
      }
    } else if (thirdConfig.fieldType === 'decimal' || thirdConfig.fieldType === 'smallint' || thirdConfig.fieldType === 'int') {
      thirdComponent = <NumberComponent {...thirdParams}  />;
    } else if (thirdConfig.fieldType === 'tinyint') {
      thirdComponent = <CheckboxComponent {...thirdParams}  />;
    } else if (thirdConfig.fieldType === 'datetime') {
      thirdComponent = <DatePickerComponent {...props}  />;
    }

    return <div>{firstComponent} {secondComponent} {thirdComponent}
      {searchRowKeys.length === 1 ? '' : <a onClick={onRemoveSearch.bind(this, key)}><DeleteOutlined /></a>}
    </div>;
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