import { connect } from 'dva';
import React, {useEffect, useMemo, useRef} from 'react';
import {Col, Form, Row, Tooltip} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../../../common/ButtonGroup";
import commonDocEvent from "../../../common/commonDocEvent";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";
import { DeleteOutlined, PlusSquareOutlined } from '@ant-design/icons';

const WorkOrder = (props) => {
  const [form] = Form.useForm();
  const propsRef: any = useRef();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        const childParams = {};
        if (props.copyToData) {
          const masterData = {...commonUtils.getAssignFieldValue('master', props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
          childParams['masterData'] = masterData;
          for(const config of props.copyToData.config.children) {
            const fieldNameSplit = config.fieldName.split('.');
            const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
            if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
              const copyData: any = [];
              for(const data of props.copyToData[dataSetName + 'Data']) {
                copyData.push({...commonUtils.getAssignFieldValue(dataSetName, config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
              }
              childParams[dataSetName + 'Data'] = copyData;
              childParams[dataSetName + 'ModifyData'] = [];
              childParams[dataSetName + 'DelData'] = [];
            }
          }
        }
        props.onButtonClick('addButton', null, null, childParams);
      }
      else if (props.handleType === 'modify') {
        props.onButtonClick('modifyButton', null, null);
      }
    }
  }, [props.masterContainer.dataSetName]);

  const onFinish = async (values: any) => {
    const { slaveData, slaveModifyData, slaveDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, false));
      return saveData;
    }
    props.onFinish(values, { childCallback });
  }

  const onButtonClick = async (key, config, e, childParams: any = undefined) => {
    if (key === 'delButton' || key === 'invalidButton' || key === 'examineButton'  || key === 'cancelExamineButton') {
      const { slaveData, slaveModifyData, slaveDelData } = props;
      const childCallback = (params) => {
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, true));
        return saveData;
      }
      props.onButtonClick(key, config, e, { childCallback });
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onFilter = (name, fieldName, value, record) => {
    const { slaveSelectedRowKeys, partSelectedRowKeys }: any = propsRef.current;
    const slaveId = commonUtils.isEmptyArr(slaveSelectedRowKeys) ? '' : slaveSelectedRowKeys.toString();
    const partId = commonUtils.isEmptyArr(partSelectedRowKeys) ? '' : partSelectedRowKeys.toString();
    if (name === 'part') {
      return record.slaveId === slaveId;
    } else if (name === 'material') {
      return (record.slaveId === slaveId && record.partId === partId) || record.materialGenre === '2product';
    } else if (name === 'process') {
      return (record.slaveId === slaveId && record.partId === partId) || record.processGenre === '3product';
    }
  }

  const onTableAddClick = (name, e, isWait = false) => {
    const { dispatch, slaveData, partData, slaveSelectedRowKeys, partSelectedRowKeys }: any = propsRef.current;
    const returnData = props.onTableAddClick(name, e, true);
    const addState = { ...returnData };
    if (name === 'part') {
      if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
        const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
        if (index > -1) {
          props.gotoError(dispatch, { code: '6001', msg: props.constantData[index].viewName });
        } else {
          props.gotoError(dispatch, { code: '6001', msg: '请选择从表！' });
        }
        return;
      }
      const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.data.id);
      returnData[name + 'Data'][index].slaveId = slaveSelectedRowKeys[0];
      const slaveIndex = slaveData.filter(item => item.id === slaveSelectedRowKeys[0]);
      returnData[name + 'Data'][index].productName = slaveIndex > -1 ? slaveData[slaveIndex].productName : '';
      addState[name + 'SelectedRowKeys'] = [returnData.data.id];
      addState[name + 'SelectedRows'] = [{...returnData.data}];
    } else if (name === 'material') {
      if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
        const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
        if (index > -1) {
          props.gotoError(dispatch, { code: '6001', msg: props.constantData[index].viewName });
        } else {
          props.gotoError(dispatch, { code: '6001', msg: '请选择从表！' });
        }
        return;
      }
      const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.data.id);
      returnData[name + 'Data'][index].slaveId = slaveSelectedRowKeys[0];

      const slaveIndex = slaveData.filter(item => item.id === slaveSelectedRowKeys[0]);
      returnData[name + 'Data'][index].productName = slaveIndex > -1 ? slaveData[slaveIndex].productName : '';

      if (commonUtils.isEmptyArr(partSelectedRowKeys)) {
        returnData[name + 'Data'][index].partId = '';
        returnData[name + 'Data'][index].materialGenre = '2product';
      } else {
        const partIndex = partData.filter(item => item.id === partSelectedRowKeys[0]);
        returnData[name + 'Data'][index].partName = partIndex > -1 ? partData[slaveIndex].partName : '';
        returnData[name + 'Data'][index].partId = partSelectedRowKeys[0];
        returnData[name + 'Data'][index].materialGenre = '0main';
      }
    } else if (name === 'process') {
      if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
        const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
        if (index > -1) {
          props.gotoError(dispatch, { code: '6001', msg: props.constantData[index].viewName });
        } else {
          props.gotoError(dispatch, { code: '6001', msg: '请选择从表！' });
        }
        return;
      }
      const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.data.id);
      returnData[name + 'Data'][index].slaveId = slaveSelectedRowKeys[0];

      const slaveIndex = slaveData.filter(item => item.id === slaveSelectedRowKeys[0]);
      returnData[name + 'Data'][index].productName = slaveIndex > -1 ? slaveData[slaveIndex].productName : '';

      if (commonUtils.isEmptyArr(partSelectedRowKeys)) {
        returnData[name + 'Data'][index].partId = '';
        returnData[name + 'Data'][index].processGenre = '3product';
      } else {
        const partIndex = partData.filter(item => item.id === partSelectedRowKeys[0]);
        returnData[name + 'Data'][index].partName = partIndex > -1 ? partData[slaveIndex].partName : '';
        returnData[name + 'Data'][index].partId = partSelectedRowKeys[0];
        returnData[name + 'Data'][index].processGenre = '0prepress';
      }
    }

    if (isWait) {
      return { ...addState, [name + 'Data']: returnData[name + 'Data'] };
    } else {
      props.dispatchModifyState({ ...addState, [name + 'Data']: returnData[name + 'Data'] });
    }
  };

  const onRowClick = async (name, record, rowKey) => {
    const { dispatchModifyState } = props;
    dispatchModifyState({ [name + 'SelectedRowKeys']: [record[rowKey]], [name + 'SelectedRows']: [record] });
  }



  const { enabled, masterContainer, masterData, commonModel } = props;

  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const slaveParam: any = commonUtils.getTableProps('slave', { ...props, onTableAddClick });
  slaveParam.isDragRow = true;
  slaveParam.pagination = false;
  slaveParam.width = 2000;

  slaveParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
      return <div>
        <a onClick={props.onLastColumnClick.bind(this, 'slave', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>

      </div>
    }, width: 100, fixed: 'right' };
  slaveParam.lastTitle =
    <div> {slaveParam.lastTitle}
      <a onClick={props.onTableAddChildClick.bind(this, 'slave')}> <Tooltip placement="top" title="增加子产品"><PlusSquareOutlined /> </Tooltip></a>
    </div>;

    slaveParam.eventOnRow.onRowClick = onRowClick;

  const partParam: any = commonUtils.getTableProps('part', { ...props, onTableAddClick });
  partParam.isDragRow = true;
  partParam.pagination = false;
  partParam.width = 2000;
  partParam.lastColumn = { title: 'o', changeValue: props.slaveSelectedRowKeys,
    render: (text,record, index)=> {
      return <div>
        <a onClick={props.onLastColumnClick.bind(this, 'part', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
      </div>
    }, width: 50 , fixed: 'right' };
  partParam.onFilter = onFilter;
  partParam.eventOnRow.onRowClick = onRowClick;

  const materialParam: any = commonUtils.getTableProps('material', { ...props, onTableAddClick });
  materialParam.isDragRow = true;
  materialParam.pagination = false;
  materialParam.width = 2000;
  materialParam.lastColumn = { title: 'o', changeValue: props.slaveSelectedRowKeys && props.partSelectedRowKeys ? [...props.slaveSelectedRowKeys, ...props.partSelectedRowKeys] :
      props.slaveSelectedRowKeys ? props.slaveSelectedRowKeys : props.partSelectedRowKeys ? props.partSelectedRowKeys : '',
    render: (text,record, index)=> {
      return <div>
        <a onClick={props.onLastColumnClick.bind(this, 'material', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
      </div>
    }, width: 50 , fixed: 'right' };
  materialParam.onFilter = onFilter;

  const processParam: any = commonUtils.getTableProps('process',{ ...props, onTableAddClick });
  processParam.isDragRow = true;
  processParam.pagination = false;
  processParam.width = 2000;
  processParam.lastColumn = { title: 'o', changeValue: props.slaveSelectedRowKeys && props.partSelectedRowKeys ? [...props.slaveSelectedRowKeys, ...props.partSelectedRowKeys] :
      props.slaveSelectedRowKeys ? props.slaveSelectedRowKeys : props.partSelectedRowKeys ? props.partSelectedRowKeys : '',
    render: (text,record, index)=> {
      return <div>
        <a onClick={props.onLastColumnClick.bind(this, 'process', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
      </div>
    }, width: 50 , fixed: 'right' };
  processParam.onFilter = onFilter;

  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row>
        <Col>
          {component}
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.slaveContainer) ? <TableComponent {...slaveParam} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.partContainer) ? <TableComponent {...partParam} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.materialContainer) ? <TableComponent {...materialParam} /> : '' }
        </Col>
      </Row>
      <Row>
        <Col>
          {commonUtils.isNotEmptyObj(props.processContainer) ? <TableComponent {...processParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(WorkOrder)));