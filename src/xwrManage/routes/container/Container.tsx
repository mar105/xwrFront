import {connect} from "react-redux";
import commonBase from "../../../utils/commonBase";
import {Col, Form, Row} from "antd";
import {ButtonGroup} from "../ButtonGroup";
import React, {useEffect, useMemo} from "react";
import * as commonUtils from "../../../utils/commonUtils";
import * as application from "../../application";
import * as request from "../../../utils/request";
import TreeModule from "../route/TreeModule";
import commonManage from "../../commonManage";
import {DatePickerComponent} from "../../../components/DatePickerComponent";
import {InputComponent} from "../../../components/InputComponent";
import {NumberComponent} from "../../../components/NumberComponent";
import {SwitchComponent} from "../../../components/SwitchComponent";
import SlaveContainer from "./SlaveContainer";

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
        dispatchModifyState({...returnRoute, treeSelectedKeys: selectedKeys, masterData: treeData[0], enabled: false});
      }
    }
    fetchData();
  }, []);

  const getAllContainer = async (params) => {
    const { commonModel, dispatch, dispatchModifyState } = props;
    const { isWait } = params;
    const url: string = `${application.urlPrefix}/container/getAllContainer`;
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

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };
  const onFinish = async (values: any) => {
  };
  const onClick = async (key, e) => {
    // const { commonModel, tabId, treeData: treeDataOld, dispatch, dispatchModifyState, treeSelectedKeys, masterData: masterDataOld, treeExpandedKeys: treeExpandedKeysOld } = props;
    // if (key === 'addButton') {
    //   const data = props.onAdd();
    //   const masterData = { ...data, key: data.id, superiorId: masterDataOld.id, allId: commonUtils.isNotEmptyArr(treeSelectedKeys) ? masterDataOld.allId : data.id, isVisible: true };
    //   let treeData = [...treeDataOld];
    //   const allList = masterDataOld.allId.split(',');
    //   allList.splice(allList.length - 1, 1);
    //   treeData = props.setNewTreeNode(treeData, allList.join(), masterData);
    //   form.resetFields();
    //   form.setFieldsValue(commonUtils.setFieldsValue(masterData));
    //   dispatchModifyState({ masterData, treeData, treeSelectedKeys: [masterData.id], treeSelectedOldKeys: treeSelectedKeys, enabled: true });
    // }

  }

  const onTreeSelect = async (selectedKeys: React.Key[], e) => {
    const { dispatchModifyState, dispatch, enabled, commonModel } = props;
    if (enabled) {
      props.gotoError(dispatch, { code: '6001', msg: '数据正在编辑，请先保存或取消！' });
    } else if (commonUtils.isNotEmptyArr(selectedKeys) && selectedKeys.length === 1) {
      const addState = props.onTreeSelect(selectedKeys, e, true);

      const url: string = `${application.urlPrefix}/container/getContainerSlave?id=` + e.node.id;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        addState.slaveData = interfaceReturn.data;
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
      form.resetFields();
      form.setFieldsValue(commonUtils.setFieldsValue(e.node));
      dispatchModifyState(addState);
    }
  }

  const { treeSelectedKeys, treeData, enabled, masterData, slaveData, treeExpandedKeys, treeSearchData, treeSearchIsVisible, treeSearchValue, treeSearchSelectedRowKeys } = props;

  const createDate = {
    form,
    fieldName: 'createDate',
    label: '创建日期',
    property: { disabled: true, format: 'YYYY-MM-DD HH:mm:ss', showTime: true },
  };
  const containerName = {
    form,
    fieldName: 'containerName',
    label: '容器名称',
    rules: [{ required: true, message: '请输入你的容器名称' }],
    property: { disabled: !enabled },
  };
  const sortNum = {
    form,
    fieldName: 'sortNum',
    label: '排序号',
    rules: [{ required: true, message: '请输入你的排序号' }],
    property: { disabled: !enabled },
  };
  const chineseName = {
    form,
    fieldName: 'chineseName',
    label: '中文名称',
    rules: [{ required: true, message: '请输入你的中文名称' }],
    property: { disabled: !enabled },
  };
  const traditionalName = {
    form,
    fieldName: 'traditionalName',
    label: '繁体名称',
    property: { disabled: !enabled },
  };
  const englishName = {
    form,
    fieldName: 'englishName',
    label: '英文名称',
    property: { disabled: !enabled },
  };
  const entitySelect = {
    form,
    fieldName: 'entitySelect',
    label: '实体查询',
    property: { disabled: !enabled },
  };
  const entityWhere = {
    form,
    fieldName: 'entityWhere',
    label: '实体条件',
    property: { disabled: !enabled },
  };
  const entitySort = {
    form,
    fieldName: 'entitySort',
    label: '实体排序',
    property: { disabled: !enabled },
  };
  const isVisible = {
    form,
    fieldName: 'isVisible',
    label: '是否显示',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isVisible, disabled: !enabled },
    event: { onChange: props.onSwitchChange.bind(this, 'master', 'isVirtual') }
  };
  const fixColumnCount = {
    form,
    fieldName: 'fixColumnCount',
    label: '固定列数',
    property: { disabled: !enabled },
  };

  const isTable = {
    form,
    fieldName: 'isTable',
    label: '是否表格',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTable, disabled: !enabled },
    event: { onChange: props.onSwitchChange.bind(this, 'master', 'isTable') }
  };
  const isTableHeadSort = {
    form,
    fieldName: 'isTableHeadSort',
    label: '是否表头排序',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isTableHeadSort, disabled: !enabled },
    event: { onChange: props.onSwitchChange.bind(this, 'master', 'isTableHeadSort') }
  };
  const isMutiChoise = {
    form,
    fieldName: 'isMutiChoise',
    label: '是否多选',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isMutiChoise, disabled: !enabled },
    event: { onChange: props.onSwitchChange.bind(this, 'master', 'isMutiChoise') }
  };
  const isRowNo = {
    form,
    fieldName: 'isRowNo',
    label: '是否显示行号',
    property: { checkedChildren: '是', unCheckedChildren: '否', checked: commonUtils.isEmptyObj(masterData) ? 0 : masterData.isRowNo, disabled: !enabled },
    event: { onChange: props.onSwitchChange.bind(this, 'master', 'isRowNo') }
  };

  const buttonGroup = { onClick, enabled };
  const tree =  useMemo(()=>{ return (<TreeModule {...props} form={form} onSelect={onTreeSelect} />
  )}, [treeData, treeSelectedKeys, treeExpandedKeys, enabled, treeSearchData, treeSearchValue, treeSearchIsVisible, treeSearchSelectedRowKeys]);
  const component = useMemo(()=>{ return (
    <div>
      <Row>
        <Col><DatePickerComponent {...createDate} /></Col>
        <Col><InputComponent {...containerName} /></Col>
        <Col><NumberComponent {...sortNum} /></Col>
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
        <Col><NumberComponent {...fixColumnCount} /></Col>
        <Col><SwitchComponent {...isVisible} /></Col>
        <Col><SwitchComponent {...isTable} /></Col>
      </Row>
      <Row>
        <Col><SwitchComponent {...isTableHeadSort} /></Col>
        <Col><SwitchComponent {...isMutiChoise} /></Col>
        <Col><SwitchComponent {...isRowNo} /></Col>
      </Row>
    </div>)}, [masterData, enabled]);

  const slaveTable = useMemo(()=>{ return (
    <SlaveContainer {...props} />
  )}, [slaveData, enabled]);

  return (
    <Form {...layout} name="basic" form={form} onFinishFailed={onFinishFailed} onFinish={onFinish}>
      <Row>
        <Col>
          {tree}
        </Col>

        <Col>
          <Row>
            {component}
          </Row>
        </Col>
      </Row>
      <Row>
        {slaveTable}
      </Row>
      <ButtonGroup {...buttonGroup} />
    </Form>
  );
}
export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(commonManage(Container)));