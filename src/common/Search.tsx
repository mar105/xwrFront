import React, {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import { componentType, searchType } from "../utils/commonTypes";
import {SelectComponent} from "../components/SelectComponent";
import {Form, Modal, Segmented, Tooltip} from "antd";
import {InputComponent} from "../components/InputComponent";
import {NumberComponent} from "../components/NumberComponent";
import {CheckboxComponent} from "../components/CheckboxComponent";
import {DatePickerComponent} from "../components/DatePickerComponent";
import {ButtonComponent} from "../components/ButtonComponent";
import { ClearOutlined, DeleteOutlined, PlusOutlined, MinusOutlined, EditOutlined, QuestionCircleOutlined, StarTwoTone } from '@ant-design/icons';
import moment from 'moment';
import * as application from "../application";
import * as request from "../utils/request";

const Search = (props) => {
  const [form] = Form.useForm();
  useEffect(() => {
    const { slaveContainer, searchData: searchDataOld, searchRowKeys: searchRowKeysOld, dispatchModifyState, searchSchemeData } = props;
    const searchConfig = slaveContainer.slaveData.filter(item => item.isSearch === 1);
    const searchRowKeys: any = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : [...searchRowKeysOld];
    const searchData = commonUtils.isEmptyArr(searchDataOld) ? {} : {...searchDataOld};
    const firstViewDrop: any = [];

    let addState = {};
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

    if (commonUtils.isNotEmpty(props.searchSchemeId)) {
      const index = searchSchemeData.findIndex(item => item.id === props.searchSchemeId);
      if (index > -1 && commonUtils.isNotEmpty(searchSchemeData[index].searchCondition)) {
        const searchCondition = JSON.parse(searchSchemeData[index].searchCondition);
        addState = { searchConfig, firstViewDrop, ...searchCondition };
        onButtonClick('searchButton', null, addState);
      }

    } else {
      dispatchModifyState({ searchConfig, searchRowKeys, searchData, firstViewDrop, ...addState });
    }

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

  const onButtonClick = async (key, e, newState) => {
    const name = 'slave';
    const { dispatch, commonModel, tabId, routeId, containerData, searchSchemeData, searchRowKeys: searchRowKeysOld, searchData: searchDataOld, dispatchModifyState,
      [name + 'Container']: container, [name + 'SorterInfo']: sorterInfo } = props;
    let searchData = commonUtils.isEmptyObj(searchDataOld) ? {} : {...searchDataOld};
    let searchRowKeys = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : [...searchRowKeysOld];
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
      if (commonUtils.isNotEmptyObj(newState)) {
        searchRowKeys = newState.searchRowKeys;
        searchData = newState.searchData;
        addState = {...addState, ...newState};
      }
      const searchCondition: any = [];
      searchRowKeys.forEach(key => {
        //-----方案设置取本月、今日，上月时，时间需要动态变化-------------------------------
        //-------------------------------
        if (searchData['second' + key] === 'today') {
          searchData['third' + key] = moment().format('YYYY-MM-DD');
        }
        else if (searchData['second' + key] === 'month') {
          searchData['third' + key] = moment().format("YYYY-MM");
        }
        else if (searchData['second' + key] === 'monthPre') {
          searchData['third' + key] = moment().startOf('month').subtract('month', 1).format('YYYY-MM');
        }
        //-----------------------------------------------------------------------
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
    else if (key === 'clearButton') {
      searchRowKeys = [];
      searchData = [];
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
      }
      addState.searchData = searchData;
      addState.searchRowKeys = searchRowKeys;
      addState[name + 'SearchCondition'] = [];
      addState.searchSchemeId = '';
      dispatchModifyState({[name + 'Loading']: true });
      const returnData: any = await props.getDataList({ name, containerId: container.id, pageNum: container.isTree === 1 ? undefined : 1, condition: { sorterInfo }, isWait: true });
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
            const returnData: any = await props.getDataList({ name: containerData[index].dataSetName, containerId: containerData[index].id, pageNum: undefined,
              condition: { searchCondition: searchNestCondition, sorterInfo: props[containerData[index].dataSetName + 'SorterInfo'] }, isWait: true });
            childData.push(...returnData[containerData[index].dataSetName + 'Data']);
          };
          addState = {...addState, [containerData[index].dataSetName + 'Data']: childData, [containerData[index].dataSetName + 'ModifyData']: [], [containerData[index].dataSetName + 'DelData']: []};
        }

      }

      dispatchModifyState({...addState});
    }
    else if (key === 'addSchemeButton') {
      form.setFieldsValue({searchSchemeName: ''});
      dispatchModifyState({ sechemeHandleType: 'add', schemeIsVisible: true });
    } else if (key === 'modifySchemeButton') {
      if (commonUtils.isEmpty(props.searchSchemeId)) {
        const index = commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseData');
        const pleaseChooseData = index > -1 ? commonModel.commonConstant[index].viewName : '请选择数据！';
        props.gotoError(dispatch, { code: '6001', msg: pleaseChooseData });
        return;
      }
      const index = searchSchemeData.findIndex(item => item.id === props.searchSchemeId);
      if (index > -1) {
        form.setFieldsValue({searchSchemeName: searchSchemeData[index].searchSchemeName});
        dispatchModifyState({ sechemeHandleType: 'modify', schemeIsVisible: true });
      } else {
        const index = commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseData');
        const pleaseChooseData = index > -1 ? commonModel.commonConstant[index].viewName : '请选择数据！';
        props.gotoError(dispatch, { code: '6001', msg: pleaseChooseData });
        return;
      }
    } else if (key === 'cancelSchemeButton') {
      dispatchModifyState({ schemeIsVisible: false });
    } else if (key === 'delSchemeButton') {
      let index = commonModel.commonConstant.findIndex(item => item.constantName === 'confirmVar');
      const confirmVar = index > -1 ? commonModel.commonConstant[index].viewName : '确定#var#吗？';
      index = commonModel.commonConstant.findIndex(item => item.constantName === 'delScheme');
      const delScheme = index > -1 ? commonModel.commonConstant[index].viewName : '删除方案';
      Modal.confirm({
        icon: <QuestionCircleOutlined />,
        content: confirmVar.replace('#var#', delScheme),
        onOk: async () => {
          const index = searchSchemeData.findIndex(item => item.id === props.searchSchemeId);
          if (index > -1) {
            const saveData: any = [];
            const searchScheme = { ...searchSchemeData[index], handleType: 'del' };
            saveData.push(commonUtils.mergeData('searchScheme', [searchScheme], [], [], true));
            const params = { id: searchScheme.id, tabId, routeId, groupId: commonModel.userInfo.groupId,
              shopId: commonModel.userInfo.shopId,  saveData, handleType: 'del' };
            const url: string = application.urlPrefix + '/search/saveSearchScheme';
            const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
            if (interfaceReturn.code === 1) {
              const urlRoute: string = application.urlPrefix + '/personal/getRouteContainer?id=' +
                routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&downloadPrefix=' + application.urlUpload + '/downloadFile';
              const interfaceRouteReturn = (await request.getRequest(urlRoute, commonModel.token)).data;
              if (interfaceRouteReturn.code === 1) {
                const addState = { routeId, ...interfaceRouteReturn.data };
                dispatchModifyState({ ...addState });
                //需要更新pane中的state，防止刷新还是老数据。
                props.callbackModifyPane(props.tabId, addState);
              } else {
                props.gotoError(dispatch, interfaceRouteReturn);
              }
            } else {
              props.gotoError(dispatch, interfaceReturn);
            }
          }
        },
      });
    } else if (key === 'setDefaultButton') {
      const params = { defaultSearchSchemeId: props.searchSchemeId, tabId, routeId,  groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId };
      const url: string = application.urlPrefix + '/search/saveSearchDefault';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const urlRoute: string = application.urlPrefix + '/personal/getRouteContainer?id=' +
          routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&downloadPrefix=' + application.urlUpload + '/downloadFile';
        const interfaceRouteReturn = (await request.getRequest(urlRoute, commonModel.token)).data;
        if (interfaceRouteReturn.code === 1) {
          const addState = { routeId, ...interfaceRouteReturn.data };
          dispatchModifyState({ ...addState });
          //需要更新pane中的state，防止刷新还是老数据。
          props.callbackModifyPane(props.tabId, addState);
          props.gotoSuccess(dispatch, interfaceReturn);
        } else {
          props.gotoError(dispatch, interfaceRouteReturn);
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }
  }

  const onChange = (value) => {
    let addState = {searchSchemeId: value};
    const index = searchSchemeData.findIndex(item => item.id === value);
    if (index > -1 && commonUtils.isNotEmpty(searchSchemeData[index].searchCondition)) {
      const searchCondition = JSON.parse(searchSchemeData[index].searchCondition);
      addState = { ...addState, ...searchCondition };
      onButtonClick('searchButton', null, addState);
    }
    // props.dispatchModifyState({ addState });
  }

  const onFinish = async (values: any) => {
    const { dispatch, tabId, commonModel, dispatchModifyState, routeId, searchSchemeId, sechemeHandleType, searchRowKeys, searchData } = props;
    const saveData: any = [];
    const searchCondition = {searchRowKeys, searchData};
    const searchScheme = {id: sechemeHandleType === 'add' ? commonUtils.newId() : searchSchemeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId, routeId,
      searchCondition: JSON.stringify(searchCondition), searchSchemeName: values.searchSchemeName, sortNum: searchSchemeData.length + 1, handleType: sechemeHandleType };
    saveData.push(commonUtils.mergeData('searchScheme', [searchScheme], [], [], true));
    const params = { id: searchScheme.id, tabId, routeId, groupId: commonModel.userInfo.groupId,
      shopId: commonModel.userInfo.shopId,  saveData, handleType: sechemeHandleType };
    const url: string = application.urlPrefix + '/search/saveSearchScheme';
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const urlRoute: string = application.urlPrefix + '/personal/getRouteContainer?id=' +
        routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&downloadPrefix=' + application.urlUpload + '/downloadFile';
      const interfaceRouteReturn = (await request.getRequest(urlRoute, commonModel.token)).data;
      if (interfaceRouteReturn.code === 1) {
        const addState = { routeId, ...interfaceRouteReturn.data, searchSchemeId };
        dispatchModifyState({ ...addState, schemeIsVisible: false });
        props.callbackModifyPane(props.tabId, addState);
      } else {
        props.gotoError(dispatch, interfaceRouteReturn);
      }
    } else {
      props.gotoError(dispatch, interfaceReturn);
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

  const { commonModel, searchSchemeData: searchSchemeDataOld, searchData: searchDataOld, searchRowKeys: searchRowKeysOld, firstViewDrop, searchConfig } = props;
  const searchSchemeData = commonUtils.isEmptyArr(searchSchemeDataOld) ? [] : searchSchemeDataOld;
  const searchData = commonUtils.isEmptyObj(searchDataOld) ? {} : searchDataOld;
  const searchRowKeys = commonUtils.isEmptyArr(searchRowKeysOld) ? [] : searchRowKeysOld;
  const searchSchemeComponent = commonUtils.isEmptyArr(searchSchemeData) ? '' :
    <Segmented value={props.searchSchemeId} onChange={onChange} options={searchSchemeData.map(scheme => {
      return {label: scheme.searchSchemeName, value: scheme.id}
    })}/>;
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
          thirdComponent = <div style={{width: 200}} className="input-search-dom"><InputComponent {...thirdParams}  /> </div>;
        }
      } else if (thirdConfig.fieldType === 'decimal' || thirdConfig.fieldType === 'smallint' || thirdConfig.fieldType === 'int') {
        thirdComponent = <NumberComponent {...thirdParams}  />;
      } else if (thirdConfig.fieldType === 'tinyint') {
        thirdComponent = <CheckboxComponent {...thirdParams}  />;
      } else if (thirdConfig.fieldType === 'datetime') {
        thirdComponent = <DatePickerComponent {...thirdParams} />;
      }

      return <div className="search-component-group">{firstComponent} {secondComponent} {thirdComponent}
        {searchRowKeys.length === 1 ? '' : <a onClick={onRemoveSearch.bind(this, key)}><DeleteOutlined /></a>}
      </div>;
    }

  });

  let index = commonModel.commonConstant.findIndex(item => item.constantName === 'addScheme');
  const addScheme = index > -1 ? commonModel.commonConstant[index].viewName : '增加方案';
  index = commonModel.commonConstant.findIndex(item => item.constantName === 'delScheme');
  const delScheme = index > -1 ? commonModel.commonConstant[index].viewName : '删除方案';
  index = commonModel.commonConstant.findIndex(item => item.constantName === 'modifyScheme');
  const modifyScheme = index > -1 ? commonModel.commonConstant[index].viewName : '修改方案';

  index = commonModel.commonConstant.findIndex(item => item.constantName === 'addCondition');
  const addCondition = index > -1 ? commonModel.commonConstant[index].viewName : '添加条件';
  index = commonModel.commonConstant.findIndex(item => item.constantName === 'search');
  const search = index > -1 ? commonModel.commonConstant[index].viewName : '搜索';

  index = commonModel.commonConstant.findIndex(item => item.constantName === 'clearScheme');
  const clearScheme = index > -1 ? commonModel.commonConstant[index].viewName : '清空方案';

  index = commonModel.commonConstant.findIndex(item => item.constantName === 'post');
  const post = index > -1 ? commonModel.commonConstant[index].viewName : '保存';
  index = commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseInputScheme');
  const pleaseInputScheme = index > -1 ? commonModel.commonConstant[index].viewName : '请输入方案名称';

  index = commonModel.commonConstant.findIndex(item => item.constantName === 'setDefault');
  const setDefault = index > -1 ? commonModel.commonConstant[index].viewName : '设置默认';

  const addConditionButton = {
    caption: addCondition,
    property: { name: 'addConditionButton', htmlType: 'button', className: 'add-condition-btn' },
    event: { onClick: onButtonClick.bind(this, 'addConditionButton') },
    componentType: componentType.Soruce,
  };

  const searchButton = {
    caption: search,
    property: { name: 'searchButton',type: 'primary', htmlType: 'button', className: 'search-btn' },
    event: { onClick: onButtonClick.bind(this, 'searchButton') },
    componentType: componentType.Soruce,
  };

  const schemePostButton = {
    caption: post,
    property: { name: 'schemePostButton', htmlType: 'submit' },
    componentType: componentType.Soruce,
  };
  const searchSchemeName = {
    config: { fieldName: 'searchSchemeName', isRequired: true },
    property: { placeholder:  pleaseInputScheme},
  };

  return (<div><Form >
    {commonUtils.isEmptyArr(searchRowKeys) ? '' :
      <div className="xwr-common-search-form-row">
        <div className="search-dom">
          {searchSchemeComponent}
          <div className="search-component">

          {searchComponent}
          </div>
         
          <ButtonComponent {...addConditionButton} />
          <ButtonComponent {...searchButton} />
        </div>
      

        <div className="basic-actions">
          <a onClick={onButtonClick.bind(this, 'addSchemeButton')}> <Tooltip placement="top" title={addScheme}><PlusOutlined /></Tooltip></a>
          <a onClick={onButtonClick.bind(this, 'delSchemeButton')}> <Tooltip placement="top" title={delScheme}><MinusOutlined /></Tooltip></a>
          <a onClick={onButtonClick.bind(this, 'modifySchemeButton')}> <Tooltip placement="top" title={modifyScheme}><EditOutlined /></Tooltip></a>
          <a onClick={onButtonClick.bind(this, 'setDefaultButton')}> <Tooltip placement="top" title={setDefault}><StarTwoTone /></Tooltip></a>
          <a onClick={onButtonClick.bind(this, 'clearButton')}> <Tooltip placement="top" title={clearScheme}><ClearOutlined /></Tooltip></a>
        </div>
        <Modal width={800} visible={props.schemeIsVisible} footer={null} onCancel={onButtonClick.bind(this, 'cancelSchemeButton')} >
          <Form form={form} onFinish={onFinish}>
            <InputComponent {...searchSchemeName} />
            <ButtonComponent {...schemePostButton} />
          </Form>
        </Modal>
      </div>
    }
  </Form></div>);
}

export default Search;