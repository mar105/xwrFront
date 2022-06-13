import { connect } from 'dva';
import React, {useEffect, useMemo, useRef} from 'react';
import {Col, Form, Row, Tooltip} from "antd";
import commonBase from "../../../common/commonBase";
import * as commonUtils from "../../../utils/commonUtils";
import {ButtonGroup} from "../../../common/ButtonGroup";
import commonDocEvent from "../../../common/commonDocEvent";
import { CommonExhibit } from "../../../common/CommonExhibit";
import {TableComponent} from "../../../components/TableComponent";
import { StarTwoTone, DeleteOutlined, StarFilled } from '@ant-design/icons';

const Process = (props) => {
  const propsRef: any = useRef();
  const [form] = Form.useForm();
  props.onSetForm(form);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const onFinish = async (values: any) => {
    const { machineData, machineModifyData, machineDelData, matchData, matchModifyData,
      outsourceDelData, outsourceData, outsourceModifyData, matchDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('machine', machineData, machineModifyData, machineDelData, false));
      saveData.push(commonUtils.mergeData('match', matchData, matchModifyData, matchDelData, false));
      saveData.push(commonUtils.mergeData('outsource', outsourceData, outsourceModifyData, outsourceDelData, false));
      return saveData;
    }
    props.onFinish(values, { childCallback });
  }

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.masterContainer)) {
      if (props.handleType === 'add') {
        const childParams = {};
        if (props.copyToData) {
          const masterData = {...commonUtils.getAssignFieldValue(name, props.copyToData.config.assignField, props.copyToData.masterData), ...props.onAdd() };
          childParams['masterData'] = masterData;
          for(const config of props.copyToData.config.children) {
            const fieldNameSplit = config.fieldName.split('.');
            const dataSetName = fieldNameSplit[fieldNameSplit.length - 1];
            if (commonUtils.isNotEmptyArr(props.copyToData[dataSetName + 'Data'])) {
              const copyData: any = [];
              for(const data of props.copyToData[dataSetName + 'Data']) {
                copyData.push({...commonUtils.getAssignFieldValue(name, config.assignField, data), ...props.onAdd(), superiorId: masterData.id });
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

  const onButtonClick = async (key, config, e, childParams: any = undefined) => {
    if (key === 'delButton') {
      const { machineData, machineModifyData, machineDelData, matchData, matchModifyData,
        outsourceDelData, outsourceData, outsourceModifyData, matchDelData } = props;
      const childCallback = (params) => {
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('machine', machineData, machineModifyData, machineDelData, true));
        saveData.push(commonUtils.mergeData('match', matchData, matchModifyData, matchDelData, true));
        saveData.push(commonUtils.mergeData('outsource', outsourceData, outsourceModifyData, outsourceDelData, true));
        return saveData;
      }
      props.onButtonClick(key, config, e, { childCallback });
    } else {
      props.onButtonClick(key, config, e, childParams);
    }
  }

  const onLastColumnClick = (name, key, record, e, isWait = false) => {
    const { dispatchModifyState, masterData: masterDataOld, masterModifyData: masterModifyDataOld }: any = propsRef.current;
    if (name === 'machine') {
      if (key === 'defaultButton') {
        const masterData = { ...masterDataOld, handleType: commonUtils.isEmpty(masterDataOld.handleType) ? 'modify' : masterDataOld.handleType, defaultMachineId: record.machineId };

        const masterModifyData = masterData.handleType === 'modify' ?
          commonUtils.isEmptyObj(masterModifyDataOld) ? { id: masterData.id, handleType: masterData.handleType, defaultMachineId: record.machineId } :
            { ...masterModifyDataOld, id: masterData.id, defaultMachineId: record.machineId } : masterModifyDataOld;
        dispatchModifyState({ masterData, masterModifyData });
      }
    }
  };

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const machineParam: any = commonUtils.getTableProps('machine', props);
  machineParam.pagination = false;
  machineParam.isDragRow = true;
  machineParam.lastColumn = { title: 'o', changeValue: commonUtils.isEmptyObj(masterData) ? '' : masterData.defaultMachineId,
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, 'machine', 'defaultButton', record)}>
        <Tooltip placement="top" title="默认"> {commonUtils.isNotEmptyObj(masterData) && masterData.defaultMachineId === record.machineId ? <StarFilled /> : <StarTwoTone /> }</Tooltip></a>
      { !props.enabled ? '' : <a onClick={props.onLastColumnClick.bind(this, 'machine', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>}
    </div>
  }, width: 50 , fixed: 'right' };
  const matchParam: any = commonUtils.getTableProps('match', props);
  matchParam.pagination = false;
  matchParam.isDragRow = true;

  const outsourceParam: any = commonUtils.getTableProps('outsource', props);
  outsourceParam.pagination = false;
  outsourceParam.isDragRow = true;

  const component = useMemo(()=>{ return (
    <CommonExhibit name="master" {...props} />)}, [masterContainer, masterData, enabled]);
  return (
    <Form {...layout} name="basic" form={form} onFinish={onFinish}>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {component}
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.machineContainer) ? <TableComponent {...machineParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.matchContainer) ? <TableComponent {...matchParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.outsourceContainer) ? <TableComponent {...outsourceParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Process)));