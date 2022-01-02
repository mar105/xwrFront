import React, {useEffect, useReducer, useRef} from 'react';
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import {Spin} from "antd";
import arrayMove from "array-move";
import reqwest from 'reqwest';
import {Md5} from "ts-md5";
import {replacePath, routeInfo} from "../routeInfo";


const commonBase = (WrapComponent) => {
  return function ChildComponent(props) {
    const stateRef: any = useRef();
    let form;
    const [modifyState, dispatchModifyState] = useReducer((state, action) => {
      return {...state, ...action };
    },{ masterContainer: {}, ...props.commonModel.activePane, ...props.modalState });
    useEffect(() => {
      stateRef.current = modifyState;
    }, [modifyState]);

    useEffect(() => {
      if (commonUtils.isNotEmpty(modifyState.routeId)) {
        const fetchData = async () => {
          const returnState: any = await getAllData({ pageNum: 1, dataId: modifyState.dataId, handleType: modifyState.handleType });
          dispatchModifyState({...returnState});
        }
        fetchData();
      }
      return () => {};
    }, []);

    useEffect(() => {
      //刷新走两次这方法原因：一次是主路由，第二次子路由。
      return ()=> {
        const clearModifying = async () => {
          const {dispatch, commonModel, tabId} = props;
          //为什么要用stateRef.current？是因为 masterData数据改变后，useEffect使用的是[]不重新更新state，为老数据,使用 useRef来存储变量。
          const { masterData }: any = stateRef.current;
          if (commonUtils.isNotEmptyObj(masterData) && commonUtils.isNotEmpty(masterData.handleType)) {
            const url: string = `${application.urlCommon}/verify/removeModifying`;
            const params = {id: masterData.id, tabId, groupId: commonModel.userInfo.groupId,
              shopId: commonModel.userInfo.shopId};
            const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
            if (interfaceReturn.code === 1) {
            } else {
              gotoError(dispatch, interfaceReturn);
            }
          }
        }
        clearModifying();
      }
    }, []);

    const onSetForm = (formNew) => {
      form = formNew;
    }

    const getAllData = async (paramsOld) => {
      const { containerData } = modifyState;
      const params = commonUtils.isEmptyObj(paramsOld) ? {} : paramsOld;
      if (commonUtils.isNotEmptyArr(containerData)) {
        let addState = { enabled: false, pageLoading: false };
        for(const container of containerData) {
        // containerData.forEach(async container => { //foreach不能使用await
          if (params.testMongo) {
            // 如果有虚拟名称时，保存后不获取数据，等待任务推送数据。
            if (commonUtils.isNotEmpty(container.virtualName)) {
              continue;
            }
          }
          if (commonUtils.isNotEmpty(container.dataSetName) && commonUtils.isEmptyObj(modifyState[container.dataSetName + 'Columns'])) {
            addState[container.dataSetName + 'Container'] = container;
            if (container.isTable && commonUtils.isEmptyArr(modifyState[container.dataSetName + 'Columns'])) {
              const columns: any = [];
              container.slaveData.filter(item => (item.containerType === 'field' || item.containerType === 'relevance' || item.containerType === 'spare' || item.containerType === 'cascader') && item.isVisible).forEach(item => {
                const column = { title: item.viewName, dataIndex: item.fieldName, fieldType: item.fieldType, sortNum: item.sortNum, width: item.width };
                columns.push(column);
              });
              addState[container.dataSetName + 'Columns'] = columns;
            }
          }
          //dataId，列表传入，isSelect 配置传入， handleType 列表传入
          if (commonUtils.isNotEmpty(params.dataId) && container.isSelect) {
            //单据获取
            if (params.handleType !== 'add')  {
              if (container.isTable) {
                const returnData: any = await getDataList({ name: container.dataSetName, containerId: container.id, condition: { dataId: params.dataId }, isWait: true });
                addState = {...addState, ...returnData, [container.dataSetName + 'ModifyData']: [], [container.dataSetName + 'DelData']: []};
              } else if (container.isSelect) {
                const returnData: any = await getDataOne({ name: container.dataSetName, containerId: container.id, condition: { dataId: params.dataId }, isWait: true });
                addState[container.dataSetName + 'Data'] = returnData;
                addState[container.dataSetName + 'ModifyData'] = [];
                if (form) {
                  form.resetFields();
                  form.setFieldsValue(commonUtils.setFieldsValue(returnData, container));
                }
              }
            }
          } else if (params.handleType !== 'add' && container.isSelect) {
            //列表获取
            if (container.isTable) {
              const returnData: any = await getDataList({ name: container.dataSetName, containerId: container.id, pageNum: container.isTree === 1 ? undefined : params.pageNum,
                condition: { searchCondition: modifyState[container.dataSetName + 'SearchCondition'], sorterInfo: modifyState[container.dataSetName + 'SorterInfo'] }, isWait: true });
              addState = {...addState, ...returnData, [container.dataSetName + 'ModifyData']: [], [container.dataSetName + 'DelData']: []};
            }
          }
        };
        return addState;
      }
    }
    const getDataOne = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataOne?routeId=` + modifyState.routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId +
        '&containerId=' + params.containerId + '&dataId=' + params.condition.dataId;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data };
        } else {
          dispatchModifyState({ ...interfaceReturn.data });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const getDataList = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const url: string = `${application.urlPrefix}/getData/getDataList`;
      const addState = {};
      const requestParam = {
        routeId: modifyState.routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerId: params.containerId,
        pageNum: params.pageNum,
        isNotViewTree: params.isNotViewTree,
        pageSize: params.pageSize ? params.pageSize : application.pageSize,
        condition: params.condition,
        createDate: params.createDate,
      }

      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(requestParam))).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          addState[params.name + 'Data'] = interfaceReturn.data.data.list;
          if (params.pageNum === 1 || commonUtils.isEmpty(params.pageNum)) {
            addState[params.name + 'Sum'] = interfaceReturn.data.sum;
          }
          addState[params.name + 'PageNum'] = interfaceReturn.data.data.pageNum;
          addState[params.name + 'IsLastPage'] = interfaceReturn.data.data.isLastPage;
          if (commonUtils.isNotEmpty(interfaceReturn.data.createDate)) {
            addState[params.name + 'CreateDate'] = interfaceReturn.data.createDate;
          }
          addState[params.name + 'Loading'] = false;
          return { ...addState } //{ ...interfaceReturn.data.data, sum: interfaceReturn.data.sum, createDate: interfaceReturn.data.createDate };
        } else {
          dispatchModifyState({ ...addState });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const getSelectList = async (params) => {
      const { commonModel, dispatch } = props;
      const { isWait } = params;
      const modifyStateNew = stateRef.current ? stateRef.current : modifyState;
      const url: string = `${application.urlPrefix}/getData/getSelectList`;
      let record = params.record;
      if (modifyStateNew[params.name + 'Data']) {
        if (typeof modifyStateNew[params.name + 'Data'] === 'object' && modifyStateNew[params.name + 'Data'].constructor === Object) {
          record = modifyStateNew[params.name + 'Data'];
        } else {
          const index = modifyStateNew[params.name + 'Data'].findIndex(item => item.id === params.record.id);
          record = modifyStateNew[params.name + 'Data'][index];
        }
      }
      const condition = commonUtils.getCondition(params.name, record, params.sqlCondition, modifyStateNew);
      const requestParam = {
        routeId: modifyState.routeId,
        groupId: commonModel.userInfo.groupId,
        shopId: commonModel.userInfo.shopId,
        containerSlaveId: params.containerSlaveId,
        pageNum: params.pageNum,
        pageSize: application.pageSize,
        condition: { ...condition, ...params.condition},
      }
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(requestParam))).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data.data };
        } else {
          dispatchModifyState({ ...interfaceReturn.data.data });
        }
      } else {
        gotoError(dispatch, interfaceReturn);
        return {};
      }
    }

    const onAdd = (containerOld?) => {
      const { commonModel } = props;
      const container = commonUtils.isEmpty(containerOld) ? modifyState.masterContainer : containerOld;
      const dataRow: any = {...commonUtils.getDefaultValue(container, commonUtils.isEmptyObj(stateRef.current) ? modifyState: stateRef.current)};
      dataRow.handleType = 'add';
      dataRow.id = commonUtils.newId();
      dataRow.key = dataRow.id;
      dataRow.groupId = commonModel.userInfo.groupId;
      dataRow.shopId = commonModel.userInfo.shopId;
      dataRow.routeId = modifyState.routeId;
      dataRow.createUserId = commonModel.userInfo.userId;
      dataRow.createUserName = commonModel.userInfo.userName;
      dataRow.sortNum = 1;
      return dataRow;
    }
    const onModify = () => {
      const dataRow: any = {};
      dataRow.handleType = 'modify';
      return dataRow;
    };

    const onDel = () => {
      const dataRow: any = {};
      dataRow.handleType = 'del';
      return dataRow;
    };

    const onLastColumnClick = (name, key, record, e, isWait = false) => {
      const { [name + 'Data']: dataOld, [name + 'DelData']: delDataOld, [name + 'SelectedRows']: dataSelectedRows, [name + 'SelectedRowKeys']: dataSelectedRowKeys }: any = stateRef.current;
      if (key === 'delButton') {
        const data = [...dataOld];
        const delData = commonUtils.isEmptyArr(delDataOld) ? [] : [...delDataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          if (data[index].handleType !== 'add') {
            data[index].handleType = 'del';
            delData.push(data[index]);
          }
          data.splice(index, 1);
          if (isWait) {
            return { [name + 'Data']: data, [name + 'DelData']: delData };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'DelData']: delData });
          }
        }
      } else if (key === 'delSelectButton') {
        const data = [...dataSelectedRows];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          data.splice(index, 1);
        }
        const dataKeys = [...dataSelectedRowKeys];
        const indexKeys = dataKeys.findIndex(item => item === record.id);
        if (indexKeys > -1) {
          dataKeys.splice(indexKeys, 1);
        }
        if (isWait) {
          return { [name + 'SelectedRows']: data, [name + 'SelectedRowKeys']: dataKeys };
        } else {
          dispatchModifyState({ [name + 'SelectedRows']: data, [name + 'SelectedRowKeys']: dataKeys });
        }
      }

    };

    const onTableConfigSaveClick = async (name, e, isWait = false) => {
      const { [name + 'Container']: container, [name + 'Columns']: columns }: any = stateRef.current;
      const { dispatch, commonModel, tabId } = props;
      const saveData: any = [];
      const slaveData: any = [];
      saveData.push(commonUtils.mergeData('master', [], [{ id: container.id, sortNum: container.sortNum, handleType: 'modify' }], [], false));
      container.slaveData.filter(item => item.isVisible === 1).forEach(config => {
        const index = columns.findIndex(item => item.dataIndex === config.fieldName);
        if (index > -1) {
          slaveData.push({id: config.id, width: commonUtils.round(columns[index].width, 0), sortNum: index + 1,  handleType: 'modify'});
        }
      });
      saveData.push(commonUtils.mergeData('slave', [], slaveData, [], false));
      const params = { id: container.id, tabId, saveData };
      const url: string = `${application.urlManage}/container/saveContainer`;
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        gotoSuccess(dispatch, interfaceReturn);
      } else {
        gotoError(dispatch, interfaceReturn);
      }
    };

    const onTableAddClick = (name, e, isWait = false) => {
      const { [name + 'Data']: dataOld, masterData, [name + 'Container']: container }: any = stateRef.current;
      const tableData = dataOld === undefined ? [] : [...dataOld];

      const data = onAdd(container);
      data.superiorId = masterData.id;
      data.sortNum = tableData.length + 1;
      tableData.push(data);

      if (isWait) {
        return { [name + 'Data']: tableData, data };
      } else {
        dispatchModifyState({ [name + 'Data']: tableData });
      }
    };

    const onTableAddChildClick = (name, e, isWait = false) => {
      const { [name + 'Data']: dataOld, masterData, [name + 'Container']: container, [name + 'ExpandedRowKeys']: expandedRowKeysOld, [name + 'SelectedRowKeys']: selectedRowKeysOld, commonModel }: any = stateRef.current;
      const { dispatch } = props;
      const tableData = dataOld === undefined ? [] : [...dataOld];
      const expandedRowKeys = commonUtils.isEmptyArr(expandedRowKeysOld) ? [] : [...expandedRowKeysOld];
      const selectedRowKeys = commonUtils.isEmptyArr(selectedRowKeysOld) ? [] : [...selectedRowKeysOld];

      if (commonUtils.isEmptyArr(selectedRowKeys)) {
        const index = commonModel.commonConstant.filter(item => item.constantName === 'pleaseChooseData');
        if (index > -1) {
          props.gotoError(dispatch, { code: '6001', msg: commonModel.constantData[index].viewName });
        } else {
          props.gotoError(dispatch, { code: '6001', msg: '请选择数据！' });
        }
        return;
      }

      const data = onAdd(container);
      const index = tableData.findIndex(item => item.id === selectedRowKeys[0]);
      const addState = {};

      data.superiorId = masterData.id;
      data.sortNum = tableData.length + 1;
      data.allId = tableData[index].allId + ',' + data.id;
      data[container.treeSlaveKey] = tableData[index].id;

      if (commonUtils.isEmptyArr(tableData[index].children)) {
        tableData[index].children = [data];
      } else {
        tableData[index].children.push(data);
      }
      addState[name + 'SelectedRowKeys'] = [data.id];
      expandedRowKeys.push(tableData[index].id);
      addState[name + 'ExpandedRowKeys'] = expandedRowKeys;

      if (isWait) {
        return { [name + 'Data']: tableData, data, ...addState };
      } else {
        dispatchModifyState({ [name + 'Data']: tableData, ...addState });
      }
    };

    const gotoError = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoError', payload: interfaceData });
    };

    const gotoSuccess = (dispatch, interfaceData) => {
      dispatch({ type: 'commonModel/gotoSuccess', payload: interfaceData });
    };

    const getTreeNode = (treeData, allId) => {
      let treeNode: any = {};
      allId.split(',').forEach((key, allIdIndex) => {
        if (allIdIndex === 0) {
          const index = treeData.findIndex(item => item.id === key);
          if (index > -1) {
            treeNode = treeData[index];
          }
        } else if (commonUtils.isNotEmptyArr(treeNode.children)) {
          treeNode = getChildTreeNode(treeNode.children, key);
        }
      });
      return treeNode;
    }

    const getChildTreeNode = (treeNode, key) => {
      if (commonUtils.isNotEmptyArr(treeNode)) {
        const index = treeNode.findIndex(item => item.id === key);
        if (index > -1) {
          return treeNode[index];
        }
      }
    }

    const setTreeNode = (treeData, dataRow, allId) => {
      let treeNode: any = {};
      allId.split(',').forEach((key, allIdIndex) => {
        if (allIdIndex === 0) {
          const index = treeData.findIndex(item => item.id === key);
          if (index > -1) {
            treeNode = treeData[index];
          }
        } else if (commonUtils.isNotEmptyArr(treeNode.children)) {
          treeNode = setChildTreeNode(treeNode.children, dataRow, key);
        }
      });
    }

    const setChildTreeNode = (treeNode, dataRow, key) => {
      if (commonUtils.isNotEmptyArr(treeNode)) {
        const index = treeNode.findIndex(item => item.id === key);
        if (index > -1) {
          treeNode[index] = dataRow;
        }
      }
    }



    const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
      dispatchModifyState({ [name + 'SelectedRowKeys']: selectedRowKeys, [name + 'SelectedRows']: selectedRows });
    }

    const onSwitchChange = (name, fieldName, record, checked, e, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = checked;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify }
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }

      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = checked;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onCheckboxChange = (name, fieldName, record, e, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = e.target.checked;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify }
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = e.target.checked;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }

        }
      }
    }

    const onInputChange = (name, fieldName, record, e, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = e.target.value;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = e.target.value;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onNumberChange = (name, fieldName, record, valueOld, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      const moneyPlace = props.commonModel.userInfo.shopInfo ? props.commonModel.userInfo.shopInfo.moneyPlace : 6;
      const pricePlace = props.commonModel.userInfo.shopInfo ? props.commonModel.userInfo.shopInfo.pricePlace : 6;
      const value = fieldName.endsWith('Money') ? commonUtils.round(valueOld, moneyPlace) : fieldName.endsWith('Price') ? commonUtils.round(valueOld, pricePlace) : valueOld;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = value;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = value;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        } else {
          const dataRow = getTreeNode(data, record.allId);
          const rowData = { ...dataRow, [fieldName]: value };
          rowData.handleType = commonUtils.isEmpty(rowData.handleType) ? 'modify' : rowData.handleType;
          setTreeNode(data, rowData, record.allId);
          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (rowData.handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = rowData[fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: rowData.handleType, [fieldName]: rowData[fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onSelectChange = (name, fieldName, record, assignField, valueOld, option, isWait = false) => {
      const value = valueOld === undefined ? '' : Array.isArray(valueOld) ? valueOld.toString() : valueOld;
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      const assignOption = commonUtils.isEmptyObj(option) || commonUtils.isEmptyObj(option.optionObj) ? {} : option.optionObj;

      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const assignValue = commonUtils.getAssignFieldValue(name, assignField, assignOption);
        const data = { ...dataOld, [fieldName]: value, ...assignValue };
        if (form) {
          form.setFieldsValue(commonUtils.setFieldsValue(assignValue, modifyState[name + 'Container']));
        }
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName], ...assignValue } :
            { ...dataModifyOld, id: data.id, [fieldName]: value, ...assignValue } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        let index = data.findIndex(item => item.id === record.id);
        if (index > -1) { // 正常数据
          const assignValue = commonUtils.getAssignFieldValue(name, assignField, assignOption);
          const rowData = { ...data[index], [fieldName]: value, ...assignValue };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          data[index] = rowData;
          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify] = {...dataModify[indexModify], ...dataModify[index], [fieldName]: value, ...assignValue };
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: value, ...assignValue })
            }
          }

          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        } else if (commonUtils.isNotEmpty(record.allId)) { // 树型数据
          const dataRow = getTreeNode(data, record.allId);
          const assignValue = commonUtils.getAssignFieldValue(name, assignField, assignOption);
          const rowData = { ...dataRow, [fieldName]: value, ...assignValue };
          rowData.handleType = commonUtils.isEmpty(rowData.handleType) ? 'modify' : rowData.handleType;
          setTreeNode(data, rowData, record.allId);
          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (rowData.handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify] = {...dataModify[indexModify], ...dataModify[index], [fieldName]: value, ...assignValue };
            } else {
              dataModify.push({ id: record.id, handleType: rowData.handleType, [fieldName]: value, ...assignValue })
            }
          }

          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onTreeSelectChange = (name, fieldName, record, config, valueOld, extra, isWait = false) => {
      const value = valueOld === undefined ? '' : valueOld.toString();
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      const assignOption = commonUtils.isEmptyObj(extra) || commonUtils.isEmptyObj(extra.triggerNode) || commonUtils.isEmptyObj(extra.triggerNode.props) ? {} : extra.triggerNode.props;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const assignValue = commonUtils.getAssignFieldValue(name, config.assignField, assignOption);
        const data = { ...dataOld, ...assignValue };
        if (form) {
          form.setFieldsValue(commonUtils.setFieldsValue(assignValue, modifyState[name + 'Container']));
        }
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: value, ...assignValue } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName], ...assignValue } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const assignValue = commonUtils.getAssignFieldValue(name, config.assignField, assignOption);
          const rowData = { ...data[index], ...assignValue };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = value;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify] = { ...dataModify[indexModify], ...dataModify[index], [fieldName]: value, ...assignValue };
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: value, ...assignValue })
            }
          }

          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onCascaderChange = (name, fieldName, record, fieldRelevance, value, selectedOptions, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        if (commonUtils.isNotEmpty(fieldRelevance)) {
          const assignField = fieldRelevance.split(',');
          assignField.forEach((field, fieldIndex) => {
            data[field] = value[fieldIndex];
          });
        }

        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = value;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          if (commonUtils.isNotEmpty(fieldRelevance)) {
            const assignField = fieldRelevance.split(',');
            assignField.forEach((field, fieldIndex) => {
              data[index][field] = value[fieldIndex];
            });
          }
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = value;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onDatePickerChange = (name, fieldName, record, value, dateString, isWait) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
      if (typeof dataOld === 'object' && dataOld.constructor === Object) {
        const data = { ...dataOld };
        data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;
        data[fieldName] = dateString;

        const dataModify = data.handleType === 'modify' ?
          commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName] } :
            { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName] } : dataModifyOld;
        if (isWait) {
          return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
        } else {
          dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
        }
      } else {
        const data = [...dataOld];
        const index = data.findIndex(item => item.id === record.id);
        if (index > -1) {
          const rowData = { ...data[index] };
          rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
          rowData[fieldName] = dateString;
          data[index] = rowData;

          const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
          if (data[index].handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === record.id);
            if (indexModify > -1) {
              dataModify[indexModify][fieldName] = data[index][fieldName];
            } else {
              dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: data[index][fieldName] })
            }
          }
          if (isWait) {
            return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
          } else {
            dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
          }
        }
      }
    }

    const onReachEnd = async (name) => {
      const { [name + 'Container']: container, [name + 'Data']: data, [name + 'PageNum']: pageNum, [name + 'IsLastPage']: isLastPage, [name + 'CreateDate']: createDate }: any = stateRef.current;
      if (!isLastPage && !container.isTree) {
        dispatchModifyState({[name + 'Loading']: true });
        const returnData: any = await getDataList({ name, containerId: container.id, pageNum: pageNum + 1, condition: {}, isWait: true, createDate });
        const addState = {...returnData};
        addState[name + 'Data'] = commonUtils.isEmptyArr(returnData[name + 'Data']) ? addState[name + 'Data'] : [...data, ...returnData[name + 'Data']];
        dispatchModifyState({...addState});
      }
    }

    const draggableBodyRow = (name, rowKey, SortableItem, className, style, restProps ) => {
      const { [name + 'Data']: data } = stateRef.current;
      // const { dataSource: dataSourceOld }: any = params.property;
      // function findIndex base on Table rowKey props and should always be a right array index
      const dataSource = commonUtils.isEmptyArr(data) ? [] : data;
      const index = dataSource.findIndex((x: any) => x[rowKey] === restProps['data-row-key']);
      return <SortableItem index={index} {...restProps} />;
    };

    // 数据行拖动
    const onSortEnd = (name, oldIndex, newIndex) => {
      const { [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld } = stateRef.current;
      if (oldIndex !== newIndex) {
        const data: any = [];
        const newData = arrayMove([].concat(dataOld), oldIndex, newIndex).filter(el => !!el);
        const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
        newData.forEach((itemData: any, index) => {
          const rowData = { ...itemData };
          rowData.handleType = commonUtils.isEmpty(rowData.handleType) ? 'modify' : rowData.handleType;
          rowData.sortNum = index + 1;
          data.push(rowData);
          if (rowData.handleType === 'modify') {
            const indexModify = dataModify.findIndex(item => item.id === rowData.id);
            if (indexModify > -1) {
              dataModify[indexModify].sortNum = rowData.sortNum;
            } else {
              dataModify.push({id: rowData.id, handleType: rowData.handleType, sortNum: rowData.sortNum})
            }
          }
        });
        dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify });
      }
    };

    const onUpload = async (name) => {
      const { [name + 'FileList']: fileList, [name + 'DelFileList']: delfileListOld }: any = stateRef.current;
      const { dispatch, commonModel } = props;
      const delFileList = commonUtils.isEmptyArr(delfileListOld) ? [] : delfileListOld;
      if (commonUtils.isNotEmptyArr(delFileList)) {
        // 先删除文件
        const formData = new FormData();
        formData.append('fileListStr', JSON.stringify(delFileList));
        formData.append('routeId', modifyState.routeId);
        formData.append('groupId', commonModel.userInfo.groupId);
        formData.append('shopId', commonModel.userInfo.shopId);
        formData.append('dataId', modifyState.dataId);
        await reqwest({
          url: application.urlUpload + '/delFileList',
          method: 'post',
          processData: false,
          data: formData,
          success: (data) => {
            if (data.code === 1) {
              if (data.data === -1) {
                // gotoSuccess(dispatch, data);
              } else {
                gotoError(dispatch, data);
              }
            }
          }
        });
      }


      // 第二步上传文件
      if (commonUtils.isNotEmptyArr(fileList)) {
        fileList.filter(item => item.status !== 'done').forEach(async fileObj => {
          fileObj.percent = 1;
          fileObj.status = 'uploading';
          const file = fileObj.originFileObj;
          const formData = new FormData();
          const size = file.size;
          //文件分片 以10MB去分片
          const shardSize: any = 10 * 1024 * 1024;
          //总片数
          const shardTotal: any = Math.ceil(size / shardSize);
          //文件的后缀名
          const fileName = file.name;
          const suffix = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
          //把视频的信息存储为一个字符串
          const fileDetails = file.name + file.size + file.type + file.lastModifiedDate;
          //使用当前文件的信息用md5加密生成一个key 这个加密是根据文件的信息来加密的 如果相同的文件 加的密还是一样的
          const key: any = Md5.hashAsciiStr(Md5.hashAsciiStr(fileDetails).toString());
          formData.append('fileName', fileName);
          formData.append('suffix', suffix);
          formData.append('shardSize', shardSize);
          formData.append('shardTotal', shardTotal);
          formData.append('size', size);
          formData.append('routeId', modifyState.routeId);
          formData.append('groupId', commonModel.userInfo.groupId);
          formData.append('shopId', commonModel.userInfo.shopId);
          formData.append('dataId', modifyState.dataId);
          formData.append('key', key);
          await reqwest({
            url: application.urlUpload + '/checkFile',
            method: 'post',
            processData: false,
            data: formData,
            headers: {
              authorization: commonModel.token,
            },
            success: (data) => {
              if (data.code === 1) {
                if (data.data === -1) {
                  gotoSuccess(dispatch, data);
                  fileObj.percent = 100;
                  fileObj.status = 'done';
                  dispatchModifyState({[name + 'FileList']: fileList, pageLoading: false});
                } else {
                  // 通过分片文件继续上传。
                  uploadFile(name, fileObj, modifyState.routeName, modifyState.dataId, data.data);
                }
              }
            }
          });

        });
      }

      dispatchModifyState({ pageLoading: true, [name + 'FileList']: fileList, [name + 'DelFileList']: [] });
    };

    const uploadFile = (name, fileObj, routeName, dataId, shardIndex) => {
      const file = fileObj.originFileObj;
      const { dispatch, commonModel } = props;
      const formData = new FormData();

      // formData.append('files[]', file);

      //文件分片 以10MB去分片
      const shardSize: any = 10 * 1024 * 1024;
      //定义分片索引
      // const shardIndex = shardIndex;
      //定义分片的起始位置
      const start = shardIndex * shardSize;
      //定义分片结束的位置 file哪里来的?
      const end = Math.min(file.size, start + shardSize);
      //从文件中截取当前的分片数据
      const fileShard = file.slice(start, end);
      //分片的大小
      const size = file.size;
      //总片数
      const shardTotal: any = Math.ceil(size / shardSize);
      //文件的后缀名
      const fileName = file.name;
      const suffix = fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length).toLowerCase();
      //把视频的信息存储为一个字符串
      const fileDetails = file.name + file.size + file.type + file.lastModifiedDate;
      //使用当前文件的信息用md5加密生成一个key 这个加密是根据文件的信息来加密的 如果相同的文件 加的密还是一样的
      const key: any = Md5.hashAsciiStr(Md5.hashAsciiStr(fileDetails).toString());
      //前面的参数必须和controller层定义的一样
      formData.append('file', fileShard);
      formData.append('fileName', fileName);
      formData.append('suffix', suffix);
      formData.append('shardIndex',shardIndex);
      formData.append('shardSize', shardSize);
      formData.append('shardTotal', shardTotal);
      formData.append('size', size);
      formData.append('routeId', modifyState.routeId);
      formData.append('groupId', commonModel.userInfo.groupId);
      formData.append('shopId', commonModel.userInfo.shopId);
      formData.append('dataId', dataId);
      formData.append('key', key);

      // You can use any AJAX library you like
      reqwest({
        url: application.urlUpload + '/uploadFile',
        method: 'post',
        processData: false,
        data: formData,
        success: () => {
          if(shardIndex < shardTotal - 1) {
            shardIndex += 1;
            const fileList = [...modifyState[name + 'FileList']];
            const index = fileList.findIndex(item => item.uid === fileObj.uid);
            fileList[index].percent = Math.ceil(100  * (shardIndex / shardTotal));
            dispatchModifyState({ [name + 'FileList']: fileList, pageLoading: false });
            uploadFile(name, fileObj, routeName, dataId, shardIndex);
          } else {
            const fileList = [...modifyState[name + 'FileList']];
            const index = fileList.findIndex(item => item.uid === fileObj.uid);
            fileList[index].percent = 100;
            fileList[index].status = 'done';
            dispatchModifyState({ [name + 'FileList']: fileList, pageLoading: false });
            gotoSuccess(dispatch, {code: '1', msg: '上传成功！'});
          }
        },
        error: () => {
          dispatchModifyState({ pageLoading: false });
          gotoError(dispatch, {code: '5000', msg: '上传失败！'});
        },
      });
    };

    const onDropPopup = async (params) => {
      const { dispatch, commonModel } = props;
      const { config, type } = params;
      if (commonUtils.isEmpty(config.popupActiveId)) {
        gotoError(dispatch, { code: '6002', msg: '路由Id不能为空！' });
        return;
      }
      const url: string = `${application.urlPrefix}/getData/getRouteContainer?id=` + config.popupActiveId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        const state = { routeId: config.popupActiveId, ...interfaceReturn.data, handleType: type === 'popupAdd' ? 'add' : undefined, isModal: true, modalParams: params };
        const path = replacePath(state.routeData.routeName);
        const route: any = commonUtils.getRouteComponent(routeInfo, path);
        dispatchModifyState({ modalVisible: true, modalTitle: state.routeData.viewName, modalPane: commonUtils.panesComponent({key: commonUtils.newId()}, route, null, onModalOk, state).component });
      } else {
        gotoError(dispatch, interfaceReturn);
      }
    }

    const onModalCancel = () => {
      dispatchModifyState({ modalVisible: false });
    }

    const onModalOk = (params, isWait) => {
      if (commonUtils.isEmpty(params)) {
        dispatchModifyState({ modalVisible: false });
      } else if (params.type === 'popupAdd') {
        setTimeout(async () => { //延时2秒的原因是等待rocket任务处理完成。
          const dropParam = { name: params.name, record: params.record, pageNum: 1, fieldName: params.config.fieldName, isWait: true, containerSlaveId: params.config.id, sqlCondition: params.config.sqlCondition, condition: { newRecordId: params.newRecord.id } };
          const selectList = await getSelectList(dropParam);
          if (commonUtils.isNotEmpty(selectList) && commonUtils.isNotEmptyArr(selectList.list)) {
            const returnData: any = onSelectChange(params.name, params.config.fieldName, params.record, params.config.assignField, selectList.list[0].id, { optionObj: selectList.list[0] }, true);
            dispatchModifyState({ ...returnData, modalVisible: false });
            if (form && typeof returnData[params.name + 'Data'] === 'object' && returnData[params.name + 'Data'].constructor === Object) {
              form.resetFields();
              form.setFieldsValue(commonUtils.setFieldsValue(returnData[params.name + 'Data'], modifyState[params.name + 'Container']));
            }
          } else {
            dispatchModifyState({ modalVisible: false });
          }
        }, 2000);
      } else if (params.type === 'popupActive') {
        if (commonUtils.isNotEmptyArr(params.selectList)) {
          const name = params.name;
          const { [name + 'Container']: container, masterData, [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld }: any = stateRef.current;
          const assignOption = params.selectList[0];
          const assignField = params.config.assignField;
          const fieldName = params.config.fieldName;
          const value = params.selectList[0].id;
          const record = params.record;

          if (typeof dataOld === 'object' && dataOld.constructor === Object) {
            const assignValue = commonUtils.getAssignFieldValue(name, assignField, assignOption);
            const data = { ...dataOld, [fieldName]: value, ...assignValue };
            if (form) {
              form.setFieldsValue(commonUtils.setFieldsValue(assignValue, modifyState[params.name + 'Container']));
            }
            data.handleType = commonUtils.isEmpty(data.handleType) ? 'modify' : data.handleType;

            const dataModify = data.handleType === 'modify' ?
              commonUtils.isEmptyObj(dataModifyOld) ? { id: data.id, handleType: data.handleType, [fieldName]: data[fieldName], ...assignValue } :
                { ...dataModifyOld, id: data.id, [fieldName]: data[fieldName], ...assignValue } : dataModifyOld;
            if (isWait) {
              return { [name + 'Data']: data, [name + 'ModifyData']: dataModify, modalVisible: false };
            } else {
              dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify, modalVisible: false });
            }
          } else {
            const data = [...dataOld];
            const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
            params.selectList.forEach((selectItem, selectIndex) => {
              const index = data.findIndex(item => item.id === record.id);
              if (selectIndex === 0 && ((params.selectList.length === 1) || (index > -1 && commonUtils.isEmpty(data[index][fieldName])))) {
                const assignValue = commonUtils.getAssignFieldValue(name, assignField, selectItem);
                const rowData = { ...data[index], [fieldName]: value, ...assignValue };
                rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
                data[index] = rowData;
                if (data[index].handleType === 'modify') {
                  const indexModify = dataModify.findIndex(item => item.id === record.id);
                  if (indexModify > -1) {
                    dataModify[indexModify] = {...dataModify[indexModify], ...dataModify[index], [fieldName]: value, ...assignValue };
                  } else {
                    dataModify.push({ id: record.id, handleType: data[index].handleType, [fieldName]: value, ...assignValue })
                  }
                }
              } else {
                const assignValue = commonUtils.getAssignFieldValue(name, assignField, selectItem);
                const rowData = { ...onAdd(container), [fieldName]: value, ...assignValue, superiorId: masterData.id };
                data.push(rowData);
              }
            });
            if (isWait) {
              return { [name + 'Data']: data, [name + 'ModifyData']: dataModify, modalVisible: false };
            } else {
              dispatchModifyState({ [name + 'Data']: data, [name + 'ModifyData']: dataModify, modalVisible: false });
            }
          }

        }
      }

    }

    const onExpand = (name, expanded, record) => {
      const { [name + 'ExpandedRowKeys']: expandedRowKeysOld } = stateRef.current;
      const expandedRowKeys = commonUtils.isEmptyArr(expandedRowKeysOld) ? [] : [...expandedRowKeysOld];
      if (expanded) {
        expandedRowKeys.push(record.id);
      } else {
        const index = expandedRowKeys.findIndex(item => item.id === record.id);
        expandedRowKeys.splice(index, 1);
      }
      dispatchModifyState({ [name + 'ExpandedRowKeys']: expandedRowKeys });
    }

    return <Spin spinning={modifyState.pageLoading ? true : false}>
      <WrapComponent
      {...props}
      {...modifyState}
      dispatchModifyState={dispatchModifyState}
      getAllData={getAllData}
      getDataOne={getDataOne}
      getDataList={getDataList}
      getSelectList={getSelectList}
      onAdd={onAdd}
      onModify={onModify}
      onDel={onDel}
      onTableAddClick={onTableAddClick}
      onTableAddChildClick={onTableAddChildClick}
      onTableConfigSaveClick={onTableConfigSaveClick}
      onLastColumnClick={onLastColumnClick}
      gotoError={gotoError}
      gotoSuccess={gotoSuccess}
      onRowSelectChange={onRowSelectChange}
      onSwitchChange={onSwitchChange}
      onInputChange={onInputChange}
      onCheckboxChange={onCheckboxChange}
      onNumberChange={onNumberChange}
      onSelectChange={onSelectChange}
      onTreeSelectChange={onTreeSelectChange}
      onCascaderChange={onCascaderChange}
      onDatePickerChange={onDatePickerChange}
      onReachEnd={onReachEnd}
      onSetForm={onSetForm}
      onSortEnd={onSortEnd}
      draggableBodyRow={draggableBodyRow}
      onUpload={onUpload}
      onDropPopup={onDropPopup}
      onModalCancel={onModalCancel}
      onExpand={onExpand}
    />
    </Spin>
  };
};

export default commonBase;






