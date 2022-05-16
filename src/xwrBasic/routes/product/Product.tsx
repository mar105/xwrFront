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
import {UploadFile} from "../../../common/UploadFile";
import * as request from "../../../utils/request";
import * as application from "../../application";

const Product = (props) => {
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
    const { masterData, customerData: customerDataOld, customerModifyData: customerModifyDataOld, customerDelData: customerDelDataOld, inventoryData, inventoryModifyData,
      inventorySumDelData, inventorySumData, inventorySumModifyData, inventoryDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      let customerData = commonUtils.isEmptyArr(customerDataOld) ? [] : customerDataOld;
      let customerModifyData = commonUtils.isEmptyArr(customerModifyDataOld) ? [] : customerModifyDataOld;
      let customerDelData = commonUtils.isEmptyArr(customerDelDataOld) ? [] : customerDelDataOld;
      if (masterData.productType === 'common') {
        customerData = [];
        customerModifyData = [];
        customerDataOld.forEach(item => {
          customerDelData.push({...item, handleType: 'del'});
        })
      }
      saveData.push(commonUtils.mergeData('customer', customerData, customerModifyData, customerDelData, false));
      saveData.push(commonUtils.mergeData('inventory', inventoryData, inventoryModifyData, inventoryDelData, false));
      saveData.push(commonUtils.mergeData('inventorySum', inventorySumData, inventorySumModifyData, inventorySumDelData, false));
      return saveData;
    };
    props.onFinish(values, { childCallback });
    props.onUpload('upload');
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
        onButtonClick('addButton', null, null, childParams);
      }
      else if (props.handleType === 'modify') {
        onButtonClick('modifyButton', null, null);
      } else {
        getFileList();
      }
    }
  }, [props.masterContainer.dataSetName]);

  const getFileList = async () => {
    const { dispatch, dispatchModifyState } = props;
    const requestParam = {
      routeId: props.routeId,
      groupId: commonModel.userInfo.groupId,
      shopId: commonModel.userInfo.shopId,
      dataId: props.dataId,
      downloadPrefix: application.urlUpload + '/downloadFile',
    };
    const url = application.urlUpload + '/getFileList' + commonUtils.paramGet(requestParam);
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      dispatchModifyState({ uploadFileList: interfaceReturn.data});
    } else {
      props.gotoError(dispatch, interfaceReturn);
      return {};
    }
  }

  const onButtonClick = async (key, config, e, childParams: any = undefined) => {
    if (key === 'delButton') {
      const { customerData, customerModifyData, customerDelData, inventoryData, inventoryModifyData,
        inventorySumDelData, inventorySumData, inventorySumModifyData, inventoryDelData } = props;
      const childCallback = (params) => {
        const saveData: any = [];
        saveData.push(commonUtils.mergeData('customer', customerData, customerModifyData, customerDelData, true));
        saveData.push(commonUtils.mergeData('inventory', inventoryData, inventoryModifyData, inventoryDelData, true));
        saveData.push(commonUtils.mergeData('inventorySum', inventorySumData, inventorySumModifyData, inventorySumDelData, true));
        return saveData;
      };
      props.onButtonClick(key, config, e, { childCallback });
    } else {
      props.onButtonClick(key, config, e, childParams);
    }
  }

  const onLastColumnClick = (name, key, record, e, isWait = false) => {
    const { dispatchModifyState, masterData: masterDataOld, masterModifyData: masterModifyDataOld }: any = propsRef.current;
    if (name === 'customer') {
      if (key === 'defaultButton') {
        const masterData = { ...masterDataOld, handleType: commonUtils.isEmpty(masterDataOld.handleType) ? 'modify' : masterDataOld.handleType, defaultCustomerId: record.customerId };

        const masterModifyData = masterData.handleType === 'modify' ?
          commonUtils.isEmptyObj(masterModifyDataOld) ? { id: masterData.id, handleType: masterData.handleType, defaultCustomerId: record.customerId } :
            { ...masterModifyDataOld, id: masterData.id, defaultCustomerId: record.customerId } : masterModifyDataOld;
        dispatchModifyState({ masterData, masterModifyData });
      }
    }
  };

  const { enabled, masterContainer, masterData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const customerParam: any = commonUtils.getTableProps('customer', props);
  customerParam.pagination = false;
  customerParam.lastColumn = { title: 'o', changeValue: commonUtils.isEmptyObj(masterData) ? '' : masterData.defaultCustomerId,
    render: (text,record, index)=> {
    return <div>
      <a onClick={onLastColumnClick.bind(this, 'customer', 'defaultButton', record)}>
        <Tooltip placement="top" title="默认"> {commonUtils.isNotEmptyObj(masterData) && masterData.defaultCustomerId === record.customerId ? <StarFilled /> : <StarTwoTone /> }</Tooltip></a>
      <a onClick={props.onLastColumnClick.bind(this, 'customer', 'delButton', record)}> <Tooltip placement="top" title="删除"><DeleteOutlined /> </Tooltip></a>
    </div>
  }, width: 50 , fixed: 'right' };
  const inventoryParam: any = commonUtils.getTableProps('inventory', props);
  inventoryParam.pagination = false;

  const inventorySumParam: any = commonUtils.getTableProps('inventorySum', props);
  inventorySumParam.pagination = false;

  const uploadParam: any = commonUtils.getUploadProps('upload', props);

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
          <UploadFile {...uploadParam}/>
          {/*<button onClick={props.onUpload.bind(this, 'upload')} type={"button"}>aaaa</button>*/}
        </Col>
      </Row>
      <Row style={{ height: 'auto', overflow: 'auto' }}>
        <Col>
          {commonUtils.isNotEmptyObj(props.customerContainer) ? <TableComponent {...customerParam} /> : '' }
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
    </Form>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonDocEvent(Product)));