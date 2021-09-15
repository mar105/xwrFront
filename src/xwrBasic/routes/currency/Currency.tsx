import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useEffect, useMemo, useRef} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import Search from "../../../common/Search";
import categoryListEvent from "../../categoryListEvent";
const Currency = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const [form] = Form.useForm();
  props.onSetForm(form);

  const onButtonClick = async (key, config, e) => {
    const { slaveSelectedRows, rateContainer } = props;

    if (key === 'addButton' || key === 'addChildButton') {
      const childCallback = async (params) => {
        const rateData: any = [];
        return { rateData, rateSelectedRowKeys: [] };
      }
      props.onButtonClick(key, config, e, {childCallback});
    }
    else if (key === 'modifyButton') {
      const childCallback = async (params) => {
        let returnData = await props.getDataList({ name: 'rate', containerId: rateContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        const addState = {...returnData};
        return addState;
      }
      props.onButtonClick(key, config, e, {childCallback});

    } else if (key === 'delButton') {
      const childCallback = async (params) => {
        const saveData: any = [];
        const returnData = await props.getDataList({ name: 'rate', containerId: rateContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        saveData.push(commonUtils.mergeData('rate', returnData.rateData, [], [], true));
        return saveData;
      }
      props.onButtonClick(key, config, e, {childCallback});
    }
  }

  const onModalOk = async (e) => {
    const { rateData, rateModifyData, rateDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      saveData.push(commonUtils.mergeData('rate', rateData, rateModifyData, rateDelData, false));
      return saveData;
    }
    props.onModalOk(e, {childCallback});
  }


  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: props.onButtonClick, enabled, permissionData: props.permissionData, slaveContainer, buttonGroup: props.getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.isLastColumn = false;
  tableParam.enabled = false;

  const rateParam: any = commonUtils.getTableProps('rate', props);
  rateParam.pagination = false;
  rateParam.width = 500;
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} onClick={onButtonClick}/>
      <Drawer width={600} visible={masterIsVisible} maskClosable={false} onClose={props.onModalCancel} footer={
        <div>
          <Button onClick={onModalOk} type="primary">Submit</Button>
          <Button onClick={props.onModalCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
          <TableComponent {...rateParam} />
        </Form>
      </Drawer>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(Currency)));