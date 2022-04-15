import {connect} from "react-redux";
import commonBase from "../../../common/commonBase";
import {Col, Form, Row} from "antd";
import {ButtonGroup} from "../../../common/ButtonGroup";
import React, {useEffect, useMemo} from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import TreeModule from "../TreeModule";
import commonManage from "../../commonManage";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";
import {SwitchComponent} from "../../../components/SwitchComponent";
import SlaveContainer from "./SlaveContainer";
import SyncContainer from "./SyncContainer";
import {TreeSelectComponent} from "../../../components/TreeSelectComponent";

const Container = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  useEffect(() => {
    const fetchData = async () => {
      const {dispatchModifyState} = props;
      const returnRoute: any = await getAllContainer({isWait: true});
      if (commonUtils.isNotEmptyObj(returnRoute) && commonUtils.isNotEmptyArr(returnRoute.treeData)) {
        const {treeData} = returnRoute;
        const selectedKeys = [treeData[0].id];
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(treeData[0]));
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], masterModifyData: {}, enabled: false});
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
      && props.commonModel.stompClient.connected) {
      const syncToMongo = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/syncToMongo', syncToMongoResult);
      const syncToMongoIndex = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/syncToMongoIndex', syncToMongoResult);
      const dropCollectionMongo = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/dropCollectionMongo', syncToMongoResult);
      return () => {
        syncToMongo.unsubscribe();
        syncToMongoIndex.unsubscribe();
        dropCollectionMongo.unsubscribe();
      };
    }

  }, [props.commonModel.stompClient]);

  const syncToMongoResult = (data) => {
    const { dispatch } = props;
    const returnBody = JSON.parse(data.body);
    if (returnBody.code === 1) {
      props.gotoSuccess(dispatch, returnBody);
    } else {
      props.gotoError(dispatch, returnBody);
    }
  }

  const getAllContainer = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = application.urlPrefix + '/container/getAllContainer';
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      if (isWait) {
        return { treeData: interfaceReturn.data };
      } else {
        dispatchModifyState({ treeData: interfaceReturn.data });
      }
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onFinish = async (values: any) => {
    const { commonModel, dispatch, masterData, masterModifyData, slaveData, slaveModifyData, slaveDelData, dispatchModifyState, tabId, syncData, syncModifyData, syncDelData } = props;
    const saveData: any = [];
    saveData.push(commonUtils.mergeData('master', [{ ...masterData, handleType: commonUtils.isEmpty(masterData.handleType) ? 'modify' : masterData.handleType }],
      commonUtils.isNotEmptyObj(masterModifyData) ? [masterModifyData] : [], [], false));
    saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, false));
    saveData.push(commonUtils.mergeData('sync', syncData, syncModifyData, syncDelData, false));
    const params = { id: masterData.id, tabId, saveData };
    const url: string = application.urlPrefix + '/container/saveContainer';
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
    if (interfaceReturn.code === 1) {
      const returnRoute: any = await getAllContainer({isWait: true});
      const addState: any = {};
      const url: string = application.urlPrefix + '/container/getContainerSlaveList?superiorId=' + masterData.id;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        addState.slaveData = interfaceReturn.data;
        addState.slaveModifyData = [];
        addState.slaveDelData = [];
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

      const urlSync: string = application.urlPrefix + '/container/getContainerSyncList?superiorId=' + masterData.id;
      const interfaceReturnSync = (await request.getRequest(urlSync, commonModel.token)).data;
      if (interfaceReturnSync.code === 1) {
        addState.syncData = interfaceReturnSync.data;
        addState.syncModifyData = [];
        addState.syncDelData = [];
      } else {
        props.gotoError(dispatch, interfaceReturnSync);
      }

      addState.masterData = {...props.getTreeNode(returnRoute.treeData, masterData.allId) };
      addState.masterModifyData = {};
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
      dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [masterData.id], ...addState });
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  };

  const onClick = async (key, e) => {
    const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    if (key === 'addButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6002', msg: '同级容器界面，才可增加同级' });
        return;
      }
      const data = props.onAdd();
      const allList = commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId.split(',') : [''];
      allList.splice(allList.length - 1, 1);
      const masterData = { ...data, key: data.id, superiorId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.superiorId : '',
        allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? allList.join() === '' ? data.id : allList.join() + ',' + data.id : data.id,
        isVisible: 1, isRowNum: 1, isSelect: 1, virtualCondition: '', virtualIndex: '', entitySelect: '', entityWhere: '', entitySort: '' };
      let treeData = commonUtils.isNotEmptyArr(treeSelectedKeys) ? [...treeDataOld] : [];
      treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
      const addState: any = {};
      addState.slaveData = [];
      addState.slaveModifyData = [];
      addState.slaveSelectedRows = [];
      addState.slaveSelectedRowKeys = [];
      addState.syncData = [];
      addState.syncModifyData = [];
      addState.syncSelectedRows = [];
      addState.syncSelectedRowKeys = [];
      addState.syncDelData = [];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true, ...addState });
    } else if (key === 'addChildButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.routeName) || masterDataOld.routeName.split('/').length < 2) {
        props.gotoError(dispatch, { code: '6003', msg: '请选择路由子节点' });
        return;
      }
      const data = props.onAdd();
      const masterData = { ...data, key: data.id, superiorId: masterDataOld.id, allId: masterDataOld.allId + ',' + data.id,
        isVisible: 1, isRowNum: 1, isSelect: 1, virtualCondition: '', virtualIndex: '', entitySelect: '', entityWhere: '', entitySort: '' };
      let treeData = [...treeDataOld];
      let treeExpandedKeys;
      treeData = props.setNewTreeNode(treeData, masterDataOld.allId, masterData);
      if (commonUtils.isNotEmptyArr(treeExpandedKeysOld)) {
        treeExpandedKeys = [...treeExpandedKeysOld];
        treeExpandedKeys.push(masterDataOld.id);
      } else {
        treeExpandedKeys = [masterDataOld.id];
      }
      const addState: any = {};
      addState.slaveData = [];
      addState.slaveModifyData = [];
      addState.slaveSelectedRows = [];
      addState.slaveSelectedRowKeys = [];
      addState.slaveDelData = [];
      addState.syncModifyData = [];
      addState.syncSelectedRows = [];
      addState.syncSelectedRowKeys = [];
      addState.syncDelData = [];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(masterData));
      dispatchModifyState({ masterData, masterModifyData: {}, treeData, treeSelectedKeys: [masterData.key], treeSelectedOldKeys: treeSelectedKeys, enabled: true, treeExpandedKeys, ...addState });

    } else if (key === 'modifyButton') {
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6003', msg: '容器界面才可修改' });
        return;
      }
      const data = props.onModify();
      const masterData = {...masterDataOld, ...data };
      const url: string = application.urlCommon + '/verify/isExistModifying';
      const params = {id: masterData.id, tabId};
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ masterData, masterModifyData: {}, enabled: true });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }

    } else if (key === 'cancelButton') {
      let treeData = [...treeDataOld];
      const addState: any = {};
      if (masterData.handleType === 'add') {
        const allList = masterDataOld.allId.split(',');
        allList.splice(allList.length - 1, 1);
        treeData = props.setNewTreeNode(treeData, allList.join(), masterData, masterData.id);
        addState.masterData = {...props.getTreeNode(treeData, allList.join()) };
        addState.treeSelectedKeys = [addState.masterData.id];
        addState.slaveData = [];
        addState.slaveModifyData = [];
        addState.slaveSelectedRows = [];
        addState.slaveSelectedRowKeys = [];
        addState.slaveDelData = [];
        addState.syncModifyData = [];
        addState.syncSelectedRows = [];
        addState.syncSelectedRowKeys = [];
        addState.syncDelData = [];
        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
      } else if (masterData.handleType === 'modify' || masterData.handleType === 'copyToAdd') {
        const {dispatch, commonModel, tabId, masterData} = props;
        const url: string = application.urlCommon + '/verify/removeModifying';
        const params = {id: masterData.id, tabId};
        let interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
        if (interfaceReturn.code === 1) {
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
        const urlSlave = application.urlPrefix + '/container/getContainerSlaveList?superiorId=' + masterData.id;
        const interfaceReturnSlave = (await request.getRequest(urlSlave, commonModel.token)).data;
        if (interfaceReturnSlave.code === 1) {
          addState.slaveData = interfaceReturnSlave.data;
          addState.slaveModifyData = [];
          addState.slaveSelectedRows = [];
          addState.slaveSelectedRowKeys = [];
          addState.slaveDelData = [];
        } else {
          props.gotoError(dispatch, interfaceReturnSlave);
        }

        const urlSync = application.urlPrefix + '/container/getContainerSyncList?superiorId=' + masterData.id;
        const interfaceReturnSync = (await request.getRequest(urlSync, commonModel.token)).data;
        if (interfaceReturnSync.code === 1) {
          addState.syncData = interfaceReturnSync.data;
          addState.syncModifyData = [];
          addState.syncSelectedRows = [];
          addState.syncSelectedRowKeys = [];
          addState.syncDelData = [];
        } else {
          props.gotoError(dispatch, interfaceReturnSync);
        }
      }
      dispatchModifyState({...addState, treeData, enabled: false});

    } else if (key === 'delButton') {
      const { commonModel, dispatch, masterData, slaveData, dispatchModifyState } = props;
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      if (commonUtils.isNotEmptyArr(masterData.children)) {
        props.gotoError(dispatch, { code: '6001', msg: '请先删除子节点' });
        return;
      }
      if (commonUtils.isEmpty(masterDataOld.containerName)) {
        props.gotoError(dispatch, { code: '6003', msg: '容器界面才可删除' });
        return;
      }
      const url: string = application.urlPrefix + '/container/saveContainer';
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('master', [masterData], [], [], true));
      saveData.push(commonUtils.mergeData('slave', slaveData, [], [], true));
      saveData.push(commonUtils.mergeData('sync', syncData, [], [], true));
      const params = { id: masterData.id, tabId, saveData, handleType: 'del' };
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllContainer({isWait: true});
        const addState: any = {};
        if (commonUtils.isNotEmpty(returnRoute.treeData)) {
          addState.treeSelectedKeys = [returnRoute.treeData[0].id];
          addState.masterData = {...returnRoute.treeData[0]};
          form.resetFields();
          form.setFieldsValue(commonUtils.setFieldsValue(returnRoute.treeData[0]));
        }
        addState.slaveData = [];
        addState.slaveModifyData = [];
        addState.slaveSelectedRows = [];
        addState.slaveSelectedRowKeys = [];
        addState.slaveDelData = [];
        addState.slaveDelData = [];
        addState.syncModifyData = [];
        addState.syncSelectedRows = [];
        addState.syncSelectedRowKeys = [];
        addState.syncDelData = [];
        dispatchModifyState({ ...returnRoute, enabled: false, ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    } else if (key === 'syncToMongoButton') {
      if (commonUtils.isEmpty(masterData.virtualName)) {
        props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
        return;
      }
      const { stompClient } = commonModel;
      const params = { routeId: masterData.superiorId, containerId: masterData.id };
      stompClient.send('/websocket/container/syncToMongo', {}, JSON.stringify(application.paramInit(params)));
    } else if (key === 'syncToMongoIndexButton') {
      if (commonUtils.isEmpty(masterData.virtualName)) {
        props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
        return;
      }
      if (commonUtils.isEmpty(masterData.virtualIndex)) {
        props.gotoError(dispatch, { code: '6003', msg: '虚拟索引不能为空！' });
        return;
      }
      const { stompClient } = commonModel;
      const params = { routeId: masterData.superiorId, containerId: masterData.id, virtualName: masterData.virtualName, virtualIndex: masterData.virtualIndex, tableKey: masterData.tableKey };
      stompClient.send('/websocket/container/syncToMongoIndex', {}, JSON.stringify(application.paramInit(params)));

    } else if (key === 'dropCollectionMongoButton') {
      if (commonUtils.isEmpty(masterData.virtualName)) {
        props.gotoError(dispatch, { code: '6003', msg: '虚拟名称不能为空！' });
        return;
      }
      const { stompClient } = commonModel;
      const params = { routeId: masterData.superiorId, containerId: masterData.id, virtualName: masterData.virtualName };
      stompClient.send('/websocket/container/dropCollectionMongo', {}, JSON.stringify(application.paramInit(params)));

    } else if (key === 'copyButton') {
      const { commonModel, dispatch, masterData, dispatchModifyState } = props;
      if (commonUtils.isEmptyArr(treeSelectedKeys)) {
        props.gotoError(dispatch, { code: '6001', msg: '请选择数据' });
        return;
      }
      const params = { id: masterData.id };
      const url: string = application.urlPrefix + '/container/copyContainer';
      const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(params))).data;
      if (interfaceReturn.code === 1) {
        const returnRoute: any = await getAllContainer({isWait: true});
        const addState: any = {};
        addState.masterData = {...props.getTreeNode(returnRoute.treeData, interfaceReturn.data.allId) };
        addState.masterModifyData = {};

        const urlSlave: string = application.urlPrefix + '/container/getContainerSlaveList?superiorId=' + addState.masterData.id;
        const interfaceReturnSlave = (await request.getRequest(urlSlave, commonModel.token)).data;
        if (interfaceReturnSlave.code === 1) {
          addState.slaveData = interfaceReturnSlave.data;
          addState.slaveModifyData = [];
          addState.slaveDelData = [];
        } else {
          props.gotoError(dispatch, interfaceReturnSlave);
        }

        const urlSync: string = application.urlPrefix + '/container/getContainerSyncList?superiorId=' + addState.masterData.id;
        const interfaceReturnSync = (await request.getRequest(urlSync, commonModel.token)).data;
        if (interfaceReturnSync.code === 1) {
          addState.syncData = interfaceReturnSync.data;
          addState.syncModifyData = [];
          addState.syncDelData = [];
        } else {
          props.gotoError(dispatch, interfaceReturnSync);
        }

        form.resetFields();
        form.setFieldsValue(commonUtils.setFieldsValue(addState.masterData));
        dispatchModifyState({ ...returnRoute, enabled: false, treeSelectedKeys: [addState.masterData.id], ...addState });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }

  }

  const onTreeSelect = async (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState, dispatch, enabled, commonModel } = props;
    if (enabled) {
      props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
    } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
      const addState = props.onTreeSelect(selectedKeys, e, true);
      if (commonUtils.isNotEmpty(e.node.containerName)) {
        const url: string = application.urlPrefix + '/container/getContainerSlaveList?superiorId=' + e.node.id;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceReturn.code === 1) {
          addState.slaveData = interfaceReturn.data;
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }

        const urlSync: string = application.urlPrefix + '/container/getContainerSyncList?superiorId=' + e.node.id;
        const interfaceReturnSync = (await request.getRequest(urlSync, commonModel.token)).data;
        if (interfaceReturnSync.code === 1) {
          addState.syncData = interfaceReturnSync.data;
        } else {
          props.gotoError(dispatch, interfaceReturnSync);
        }
      } else {
        addState.slaveData = [];
        addState.syncData = [];
      }
      addState.slaveModifyData = [];
      addState.slaveSelectedRows = [];
      addState.slaveSelectedRowKeys = [];
      addState.slaveDelData = [];
      addState.syncModifyData = [];
      addState.syncSelectedRows = [];
      addState.syncSelectedRowKeys = [];
      addState.syncDelData = [];
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(e.node));
      dispatchModifyState(addState);
    }
  }

  const getSelectList = async (params) => {
    const { commonModel, dispatch } = props;
    const { isWait } = params;
    if (params.fieldName === 'popupActiveName' || params.fieldName === 'popupSelectName') {
      const requestParam = {
        routeId: props.routeId,
        pageNum: params.pageNum,
        pageSize: application.pageSize,
        searchValue: params.condition && params.condition.searchValue ? params.condition.searchValue : '',
        onlySearchRouteName: true,
      }
      const url: string = application.urlPrefix + '/route/getSearchRoute' + commonUtils.paramGet(requestParam);

      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { ...interfaceReturn.data.data };
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return {};
      }
    } else if (params.fieldName === 'containerViewName' || params.fieldName === 'superiorContainerName') {
      const requestParam = {
        routeId: props.routeId
      };
      const url: string = application.urlPrefix + '/container/getAllContainer' + commonUtils.paramGet(requestParam);

      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        if (isWait) {
          return { list: interfaceReturn.data };
        }
      } else {
        props.gotoError(dispatch, interfaceReturn);
        return {};
      }
    }
    return {};
  }

  const { enabled, masterData, slaveData, slaveColumns, slaveSelectedRowKeys, syncData, syncColumns, syncSelectedRowKeys,
    treeSelectedKeys, treeData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys, commonModel } = props;

  const createDate = {
    name: 'master',
    config: { fieldName: 'createDate', viewName: '创建日期' },
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
    event: { onChange: props.onDataChange }
  };
  const containerName = {
    name: 'master',
    config: { fieldName: 'containerName', isRequired: true, viewName: '容器名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const dataSetName = {
    name: 'master',
    config: { fieldName: 'dataSetName', isRequired: true, viewName: '数据集名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const sortNum = {
    name: 'master',
    config: { fieldName: 'sortNum', isRequired: true, viewName: '排序号' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const chineseName = {
    name: 'master',
    form,
    config: { fieldName: 'chineseName', isRequired: true, viewName: '中文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const traditionalName = {
    name: 'master',
    config: { fieldName: 'traditionalName', viewName: '繁体名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const englishName = {
    name: 'master',
    config: { fieldName: 'englishName', viewName: '英文名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const entitySelect = {
    name: 'master',
    config: { fieldName: 'entitySelect', viewName: '实体查询' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const entityWhere = {
    name: 'master',
    config: { fieldName: 'entityWhere', viewName: '实体条件' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const entitySort = {
    name: 'master',
    config: { fieldName: 'entitySort', viewName: '实体排序' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const isVisible = {
    name: 'master',
    config: { fieldName: 'isVisible', viewName: '是否显示' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const fixColumnCount = {
    name: 'master',
    config: { fieldName: 'fixColumnCount', viewName: '固定列数' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const isTable = {
    name: 'master',
    config: { fieldName: 'isTable', viewName: '是否表格' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTable, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const isTableHeadSort = {
    name: 'master',
    config: { fieldName: 'isTableHeadSort', viewName: '是否表头排序' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTableHeadSort, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const isMultiChoise = {
    name: 'master',
    config: { fieldName: 'isMultiChoise', viewName: '是否多选' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isMultiChoise, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };
  const isRowNum = {
    name: 'master',
    config: { fieldName: 'isRowNum', viewName: '是否显示行号' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isRowNum, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const virtualName = {
    name: 'master',
    config: { fieldName: 'virtualName', viewName: '虚拟名称' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const virtualCondition = {
    name: 'master',
    config: { fieldName: 'virtualCondition', viewName: '虚拟条件' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const virtualIndex = {
    name: 'master',
    config: { fieldName: 'virtualIndex', viewName: '虚拟索引' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const serialCodeField = {
    name: 'master',
    config: { fieldName: 'serialCodeField', viewName: '单据号字段' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const containerModel = {
    name: 'master',
    config: { fieldName: 'containerModel', viewName: '容器模型' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const tableKey = {
    name: 'master',
    config: { fieldName: 'tableKey', viewName: '表格Key' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const isTree = {
    name: 'master',
    config: { fieldName: 'isTree', viewName: '是否展现树型' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTree, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const treeKey = {
    name: 'master',
    config: { fieldName: 'treeKey', viewName: '树型主Key' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const treeSlaveKey = {
    name: 'master',
    config: { fieldName: 'treeSlaveKey', viewName: '树型从Key' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const treeColumnName = {
    name: 'master',
    config: { fieldName: 'treeColumnName', viewName: '树型展示列' },
    property: { disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const superiorContainerName = {
    name: 'master',
    config: { fieldName: 'superiorContainerName', viewName: '父级容器名称', dropType: 'sql',
      isDropEmpty: true, isTreeDrop: true, assignField: 'superiorContainerName=viewName,superiorContainerId=id',
      treeKeyDrop: 'id', treeColumnNameDrop: 'viewName' },
    property: { disabled: !enabled, dropdownMatchSelectWidth: 400 },
    event: { onChange: props.onDataChange, getSelectList }
  };

  const isSelect = {
    name: 'master',
    config: { fieldName: 'isSelect', viewName: '是否查询' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isSelect, disabled: !enabled },
    event: { onChange: props.onDataChange }
  };

  const buttonAddGroup: any = props.getButtonGroup();
  buttonAddGroup.push({ key: 'copyButton', caption: '复制', htmlType: 'button', onClick, sortNum: 100, disabled: props.enabled });
  buttonAddGroup.push({ key: 'syncToMongoButton', caption: '同步到mongo数据', htmlType: 'button', onClick, sortNum: 101, disabled: props.enabled });
  buttonAddGroup.push({ key: 'syncToMongoIndexButton', caption: '同步到mongo索引', htmlType: 'button', onClick, sortNum: 102, disabled: props.enabled });
  buttonAddGroup.push({ key: 'dropCollectionMongoButton', caption: '删除mongo表', htmlType: 'button', onClick, sortNum: 103, disabled: props.enabled });
  const buttonGroup = { userInfo: commonModel.userInfo, onClick, enabled, buttonGroup: buttonAddGroup };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={onTreeSelect} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <Row>
        <Col><DatePickerComponent {...createDate} /></Col>
        <Col><InputComponent {...containerName} /></Col>
        <Col><InputComponent {...dataSetName} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...chineseName} /></Col>
        <Col><InputComponent {...traditionalName} /></Col>
        <Col><InputComponent {...englishName} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...entitySelect} /></Col>
        <Col><InputComponent {...entityWhere} /></Col>
        <Col><InputComponent {...entitySort} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...virtualName} /></Col>
        <Col><InputComponent {...virtualCondition} /></Col>
        <Col><InputComponent {...virtualIndex} /></Col>
      </Row>
      <Row>
        <Col><NumberComponent {...sortNum} /></Col>
        <Col><InputComponent {...serialCodeField} /></Col>
        <Col><InputComponent {...containerModel} /></Col>
      </Row>
      <Row>
        <Col><SwitchComponent {...isVisible} /></Col>
        <Col><SwitchComponent {...isSelect} /></Col>
        <Col><SwitchComponent {...isTable} /></Col>
      </Row>
      {commonUtils.isNotEmptyObj(masterData) && masterData.isTable ?
        <div>
          <Row>
            <Col><NumberComponent {...fixColumnCount} /></Col>
            <Col><SwitchComponent {...isTableHeadSort} /></Col>
            <Col><SwitchComponent {...isMultiChoise} /></Col>
          </Row>
          <Row>
            <Col><InputComponent {...tableKey} /></Col>
            <Col><SwitchComponent {...isRowNum} /></Col>
            <Col><SwitchComponent {...isTree} /></Col>
          </Row>
          {commonUtils.isNotEmptyObj(masterData) && masterData.isTree ?
            <div>
              <Row>
                <Col><InputComponent {...treeKey} /></Col>
                <Col><InputComponent {...treeSlaveKey} /></Col>
                <Col><InputComponent {...treeColumnName} /></Col>
              </Row>
            </div>: ''
          }
          <Row>
            <Col><TreeSelectComponent {...superiorContainerName} /></Col>
            {commonUtils.isNotEmptyObj(masterData) && masterData.superiorContainerId ?
              <div>
                <Col><InputComponent {...treeKey} /></Col>
                <Col><InputComponent {...treeSlaveKey} /></Col>
              </div> : ''
            }
          </Row>
        </div>
        : ''}
    </div>)}, [masterData, enabled]);

  const containerNameValue = commonUtils.isNotEmptyObj(masterData) && commonUtils.isNotEmpty(masterData.containerName) ? masterData.containerName : '';
  const syncTable = useMemo(()=>{ return (
    <SyncContainer name='sync' {...props} getSelectList={getSelectList} onClick={onClick} />
  )}, [syncColumns, syncData, enabled, syncSelectedRowKeys]);
  const slaveTable = useMemo(()=>{ return (
    <SlaveContainer name='slave' {...props} getSelectList={getSelectList} onClick={onClick} />
  )}, [containerNameValue, slaveColumns, slaveData, enabled, slaveSelectedRowKeys]);
  const button = useMemo(()=>{ return (
    <ButtonGroup {...buttonGroup} />
  )}, [props.enabled, props.masterData]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row>
        <Col>
          {tree}
        </Col>

        <Col>
          <Row>
            {component}
            {syncTable}
          </Row>
          <Row>
            {slaveTable}
          </Row>
        </Col>
      </Row>
      {button}
    </Form>
  );
}
export default connect(commonUtils.mapStateToProps)(commonBase(commonManage(Container)));