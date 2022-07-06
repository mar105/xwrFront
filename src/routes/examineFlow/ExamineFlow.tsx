import { connect } from 'dva';
import React, {useEffect, useMemo, useRef} from 'react';
import {Col, Form, Row} from "antd";
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {ButtonGroup} from "../../common/ButtonGroup";
import commonDocEvent from "../../common/commonDocEvent";
import examineFlowEvent from "./examineFlowEvent";
import { CommonExhibit } from "../../common/CommonExhibit";
import {TableComponent} from "../../components/TableComponent";
import CommonModal from "../../common/commonModal";

const ExamineFlow = (props) => {
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
    const { levelData, levelModifyData, levelDelData, userData, userModifyData, userDelData, formulaData, formulaModifyData, formulaDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('level', levelData, levelModifyData, levelDelData, false));
      saveData.push(commonUtils.mergeData('user', userData, userModifyData, userDelData, false));
      saveData.push(commonUtils.mergeData('formula', formulaData, formulaModifyData, formulaDelData, false));
      return saveData;
    }
    props.onFinish(values, { childCallback });
  }

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



  const onFilter = (name, fieldName, value, record) => {
    const { levelSelectedRowKeys }: any = propsRef.current;
    const levelId = commonUtils.isEmptyArr(levelSelectedRowKeys) ? '' : levelSelectedRowKeys.toString();
    return record.examineLevelId === levelId;
  }



  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const levelParam: any = commonUtils.getTableProps('level', props);
  levelParam.pagination = false;
  levelParam.isDragRow = true;
  levelParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return props.getLastColumnButton(levelParam.name, text, record, index);
  }, width: 50 , fixed: 'right' };
  const userParam: any = commonUtils.getTableProps('user', props);
  userParam.pagination = false;
  userParam.isDragRow = true;
  userParam.onFilter = onFilter;
  userParam.lastColumn = { title: 'o', changeValue: props.levelSelectedRowKeys,
    render: (text,record, index)=> {
      return props.getLastColumnButton(userParam.name, text, record, index);
    }, width: 50 , fixed: 'right' };

  const formulaParam: any = commonUtils.getTableProps('formula', props);
  formulaParam.pagination = false;
  formulaParam.isDragRow = true;
  formulaParam.onFilter = onFilter;
  formulaParam.lastColumn = { title: 'o', changeValue: props.levelSelectedRowKeys,
    render: (text,record, index)=> {
      return props.getLastColumnButton(formulaParam.name, text, record, index);
    }, width: 50 , fixed: 'right' };

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
          {commonUtils.isNotEmptyObj(props.levelContainer) ? <TableComponent {...levelParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.userContainer) ? <TableComponent {...userParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.formulaContainer) ? <TableComponent {...formulaParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(examineFlowEvent(ExamineFlow))));