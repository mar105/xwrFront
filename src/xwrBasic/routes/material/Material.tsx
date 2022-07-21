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
import CommonModal from "../../../common/commonModal";
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const Material = (props) => {
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
    const { supplyData, supplyModifyData, supplyDelData, inventoryData, inventoryModifyData,
      inventorySumDelData, inventorySumData, inventorySumModifyData, inventoryDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('supply', supplyData, supplyModifyData, supplyDelData, false));
      saveData.push(commonUtils.mergeData('inventory', inventoryData, inventoryModifyData, inventoryDelData, false));
      saveData.push(commonUtils.mergeData('inventorySum', inventorySumData, inventorySumModifyData, inventorySumDelData, false));
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

  const onButtonClick = async (key, config, e, childParams: any = undefined) => {
    if (key === 'delButton') {
      const { supplyData, supplyModifyData, supplyDelData, inventoryData, inventoryModifyData,
        inventorySumDelData, inventorySumData, inventorySumModifyData, inventoryDelData } = props;
      const childCallback = (params) => {
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('supply', supplyData, supplyModifyData, supplyDelData, true));
        saveData.push(commonUtils.mergeData('inventory', inventoryData, inventoryModifyData, inventoryDelData, true));
        saveData.push(commonUtils.mergeData('inventorySum', inventorySumData, inventorySumModifyData, inventorySumDelData, true));
        return saveData;
      }
      props.onButtonClick(key, config, e, { childCallback });
    } else {
      props.onButtonClick(key, config, e, childParams);
    }
  }

  const onLastColumnClick = (name, key, record, e, isWait = false) => {
    const { dispatchModifyState, masterData: masterDataOld, masterModifyData: masterModifyDataOld }: any = propsRef.current;
    if (name === 'supply') {
      if (key === 'defaultButton') {
        const masterData = { ...masterDataOld, handleType: commonUtils.isEmpty(masterDataOld.handleType) ? 'modify' : masterDataOld.handleType, defaultSupplyId: record.supplyId };

        const masterModifyData = masterData.handleType === 'modify' ?
          commonUtils.isEmptyObj(masterModifyDataOld) ? { id: masterData.id, handleType: masterData.handleType, defaultSupplyId: record.supplyId } :
            { ...masterModifyDataOld, id: masterData.id, defaultSupplyId: record.supplyId } : masterModifyDataOld;
        dispatchModifyState({ masterData, masterModifyData });
      }
    }
  };

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData,
    reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const supplyParam: any = commonUtils.getTableProps('supply', props);
  supplyParam.isDragRow = true;
  supplyParam.pagination = false;

  supplyParam.lastColumn = { title: 'o', changeValue: commonUtils.isEmptyObj(masterData) ? '' : masterData.defaultSupplyId,
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, 'supply', 'defaultButton', record)}>
        <Tooltip placement="top" title="默认"> {commonUtils.isNotEmptyObj(masterData) && masterData.defaultSupplyId === record.supplyId ? <StarFilled /> : <StarTwoTone /> }</Tooltip></a>
      { !props.enabled ? '' : <a onClick={props.onLastColumnClick.bind(this, 'supply', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>}
    </div>
  }, width: 50 , fixed: 'right' };
  const inventoryParam: any = commonUtils.getTableProps('inventory', props);
  inventoryParam.pagination = false;
  inventoryParam.isDragRow = true;

  const inventorySumParam: any = commonUtils.getTableProps('inventorySum', props);
  inventorySumParam.pagination = false;
  inventorySumParam.isDragRow = true;

  const uploadParam: any = commonUtils.getUploadProps('report', props);
  uploadParam.enabled = true;
  uploadParam.isSelfModify = true;

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
          {commonUtils.isNotEmptyObj(props.supplyContainer) ? <TableComponent {...supplyParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.inventoryContainer) ? <TableComponent {...inventoryParam} /> : '' }
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.inventorySumContainer) ? <TableComponent {...inventorySumParam} /> : '' }
        </Col>
      </Row>
      <ButtonGroup {...buttonGroup} />
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
      <CommonModal modalVisible={props.modalReportVisible} onModalCancel={props.onModalCancel} destroyOnClose={true} modalPane={
        <div>
          <UploadFile {...uploadParam}/>
          <a onClick={props.onReportUpload.bind(this, 'report')}><CloudUploadOutlined /></a>
        </div>
      } />
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Material)));