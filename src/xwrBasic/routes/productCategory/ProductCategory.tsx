import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useEffect, useMemo, useRef} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import Search from "../../../common/Search";
import categoryListEvent from "../../../common/categoryListEvent";
import CommonModal from "../../../common/commonModal";
const ProductCategory = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  const [form] = Form.useForm();
  props.onSetForm(form);

  const onButtonClick = async (key, config, e) => {
    const { slaveSelectedRows, masterContainer, processCategoryContainer, processCategoryDelData: processCategoryDelDataOld } = props;

    if (key === 'addButton' || key === 'addChildButton') {
      const childCallback = async (params) => {
        const processCategoryData: any = [];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'processCategory');
        if (index > -1 && commonUtils.isNotEmpty(masterContainer.slaveData[index].viewDrop)) {
          const processCategory = (await props.getSelectList({containerSlaveId: masterContainer.slaveData[index].id, isWait: true, config: masterContainer.slaveData[index] })).list;
          processCategory.forEach((dataRow, rowIndex) => {
            let data = props.onAdd(processCategoryContainer);
            data = { ...data, ...commonUtils.getAssignFieldValue('master', masterContainer.slaveData[index].assignField, dataRow)};
            data.superiorId = params.masterData.id;
            data.sortNum = rowIndex + 1;
            processCategoryData.push(data);
          });
        }
        return { processCategoryData, processCategorySelectedRowKeys: [] };
      }
      props.onButtonClick(key, config, e, {childCallback});
    }
    else if (key === 'modifyButton') {
      const childCallback = async (params) => {
        let returnData = await props.getDataList({ name: 'processCategory', containerId: processCategoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        const addState = {...returnData};
        const processCategoryData: any = [];
        const processCategoryDataOld: any = [...addState.processCategoryData];
        const processCategorySelectedRowKeys: any = [];
        addState.processCategoryData.forEach(item => {
          processCategorySelectedRowKeys.push(item[processCategoryContainer.tableKey]);
        });
        addState.processCategorySelectedRowKeys = processCategorySelectedRowKeys;
        const processCategoryDelData: any = commonUtils.isEmptyArr(processCategoryDelDataOld) ? [] : [...processCategoryDelDataOld];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'processCategory');
        if (index > -1 && commonUtils.isNotEmpty(masterContainer.slaveData[index].viewDrop)) {
          const processCategory = (await props.getSelectList({containerSlaveId: masterContainer.slaveData[index].id, isWait: true, config: masterContainer.slaveData[index] })).list;
          let rowIndex = 0;
          for(const dataRow of processCategoryDataOld) {
            const index = processCategory.findIndex(item => item.id === dataRow.processCategoryId);
            if (!(index > -1)) {
              dataRow.handleType = 'del';
              processCategoryDelData.push(dataRow);
              processCategoryDataOld.splice(rowIndex, 1);
            }
            rowIndex += 1;
          }

          processCategory.forEach((dataRow, indexProcessCategory)  => {
            const indexCategory = processCategoryDataOld.findIndex(item => item.processCategoryId === dataRow.id);
            if (!(indexCategory > -1)) {
              let data = props.onAdd(processCategoryContainer);
              data = { ...data, ...commonUtils.getAssignFieldValue('processCategory', masterContainer.slaveData[index].assignField, dataRow)};
              data.superiorId = params.masterData.id;
              data.sortNum = indexProcessCategory + 1;
              processCategoryData.push(data);
            } else {
              processCategoryData.push(processCategoryDataOld[indexCategory]);
            }
          });
          addState.processCategoryData = processCategoryData;
        }
        return addState;
      }
      props.onButtonClick(key, config, e, {childCallback});

    } else if (key === 'delButton') {
      const childCallback = async (params) => {
        const saveData: any = [];
        const returnData = await props.getDataList({ name: 'processCategory', containerId: processCategoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        saveData.push(commonUtils.mergeData('processCategory', returnData.processCategoryData, [], [], true));
        return saveData;
      }
      props.onButtonClick(key, config, e, {childCallback});
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onDrawerOk = async (e) => {
    const { processCategoryData: processCategoryDataOld, processCategorySelectedRowKeys: processCategorySelectedRowKeysOld, processCategoryDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      const processCategorySelectedRowKeys = commonUtils.isEmptyArr(processCategorySelectedRowKeysOld) ? [] : processCategorySelectedRowKeysOld;
      const processCategoryData: any = [];
      for(const category of processCategoryDataOld) {
        if (processCategorySelectedRowKeys.findIndex(item => item === category.processCategoryId) > -1) {
          processCategoryData.push(category);
        } else if (category.handleType !== 'add') {
          processCategoryData.push({...category, handleType: 'del' });
        }
      }
      saveData.push(commonUtils.mergeData('processCategory', processCategoryData.filter(item => commonUtils.isNotEmpty(item.handleType)), [], processCategoryDelData, true));
      return saveData;
    }
    props.onDrawerOk(e, {childCallback});
  }

  const getSelectList = async (params) => {
    const { masterData } = propsRef.current;
    if (params.fieldName === 'component') {
      const selectAllComponent = commonUtils.isEmpty(masterData.allComponent) ? [] : masterData.allComponent.split(',');
      const selectReturn: any = [];
      selectAllComponent.forEach(item => {
        selectReturn.push({ value: item, id: item });
      });
      return { list: selectReturn };
    } else {
      return await props.getSelectList(params);
    }
  }


  const { enabled, masterIsVisible, masterContainer, slaveContainer, searchRowKeys, searchData, commonModel } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.isLastColumn = false;
  tableParam.enabled = false;

  const processCategoryParam: any = commonUtils.getTableProps('processCategory', props);
  processCategoryParam.isLastColumn = false;
  processCategoryParam.pagination = false;
  processCategoryParam.width = 500;
  processCategoryParam.event.getSelectList = getSelectList;
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
      <Drawer width={600} visible={masterIsVisible} maskClosable={false} onClose={props.onDrawerCancel} footer={
        <div>
          <Button onClick={onDrawerOk} type="primary">Submit</Button>
          <Button onClick={props.onDrawerCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
          <TableComponent {...processCategoryParam} />
        </Form>
      </Drawer>
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(ProductCategory)));