import {connect} from "react-redux";
import commonBase from "../../common/commonBase";
import {Col, Form, Row, Tooltip} from "antd";
import {ButtonGroup} from "../../common/ButtonGroup";
import React, {useEffect, useMemo} from "react";
import * as commonUtils from "../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../utils/request";
import {DatePickerComponent} from "../../components/DatePickerComponent";
import {InputComponent} from "../../components/InputComponent";
import {NumberComponent} from "../../components/NumberComponent";
import {SwitchComponent} from "../../components/SwitchComponent";
import PersonalSlaveContainer from "./PersonalSlaveContainer";
import {TreeSelectComponent} from "../../components/TreeSelectComponent";
import { MinusOutlined } from '@ant-design/icons';
import personalEvent from "./personalEvent";

const PersonalContainer = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    const fetchData = () => {
      if (commonUtils.isNotEmptyObj(props.masterData)) {
        form.resetFields();
        form.setFieldsValue({ ...commonUtils.setFieldsValue(props.masterData) });
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

  const { enabled, masterData, slaveData, slaveColumns, slaveSelectedRowKeys, setPersonalData, commonModel } = props;

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
  const viewName = {
    name: 'master',
    form,
    config: { fieldName: 'viewName', isRequired: true, viewName: '中文名称' },
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

  const isVirtualRecent = {
    name: 'master',
    config: { fieldName: 'isVirtualRecent', viewName: '虚拟最近数据' },
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVirtualRecent, disabled: !enabled },
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

  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, buttonGroup: props.getButtonGroup() };
  const component = useMemo(()=>{
    return (
    <div>
      <Row>
        <Col><DatePickerComponent {...createDate} /></Col>
        <Col><InputComponent {...containerName} /></Col>
        <Col><InputComponent {...dataSetName} /></Col>
      </Row>
      <Row>
        <Col><InputComponent {...viewName} />
          { enabled && masterData && setPersonalData && setPersonalData.findIndex(item => item.keyType === 'containerMaster' &&
            item.keyName === masterData.id && item.keyFieldName === 'viewName' && item.handleType !== 'del') > -1 ?
            <a onClick={props.delPersonalClick.bind(this, 'master', 'viewName')}><Tooltip placement="top" title="删除"><MinusOutlined /> </Tooltip></a> : ''}</Col>
      </Row>
      <Row>
        <Col><InputComponent {...entitySelect} />
          { enabled && masterData && setPersonalData && setPersonalData.findIndex(item => item.keyType === 'containerMaster' && item.keyName === masterData.id && item.keyFieldName === 'entitySelect' && item.handleType !== 'del') > -1 ?
            <a onClick={props.delPersonalClick.bind(this, 'master', 'entitySelect')}><Tooltip placement="top" title="删除"><MinusOutlined /> </Tooltip></a> : ''}</Col>
        <Col><InputComponent {...entityWhere} />
          { enabled && masterData && setPersonalData && setPersonalData.findIndex(item => item.keyType === 'containerMaster' && item.keyName === masterData.id && item.keyFieldName === 'entityWhere' && item.handleType !== 'del') > -1 ?
            <a onClick={props.delPersonalClick.bind(this, 'master', 'entityWhere')}><Tooltip placement="top" title="删除"><MinusOutlined /> </Tooltip></a> : ''}</Col>
        <Col><InputComponent {...entitySort} />
          { enabled && masterData && setPersonalData && setPersonalData.findIndex(item => item.keyType === 'containerMaster' && item.keyName === masterData.id && item.keyFieldName === 'entitySort' && item.handleType !== 'del') > -1 ?
            <a onClick={props.delPersonalClick.bind(this, 'master', 'entitySort')}><Tooltip placement="top" title="删除"><MinusOutlined /> </Tooltip></a> : ''}</Col>
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
        <Col><SwitchComponent {...isVirtualRecent} /></Col>
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
    </div>)}, [masterData, enabled, setPersonalData]);

  const containerNameValue = commonUtils.isNotEmptyObj(masterData) && commonUtils.isNotEmpty(masterData.containerName) ? masterData.containerName : '';
  // const syncTable = useMemo(()=>{ return (
  //   <SyncContainer name='sync' {...props} getSelectList={getSelectList} onClick={onClick} />
  // )}, [syncColumns, syncData, enabled, syncSelectedRowKeys]);
  const slaveTable = useMemo(()=>{ return (
    <PersonalSlaveContainer name='slave' {...props} getSelectList={getSelectList} onClick={props.onButtonClick} />
  )}, [containerNameValue, slaveColumns, slaveData, enabled, slaveSelectedRowKeys]);
  const button = useMemo(()=>{ return (
    <ButtonGroup {...buttonGroup} />
  )}, [props.enabled, props.masterData]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={props.onFinish}>
      <Row>
        <Col>
          <Row>
            {component}
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
export default connect(commonUtils.mapStateToProps)(commonBase(personalEvent(PersonalContainer)));