import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Button, Drawer, Form} from "antd";
import {CommonExhibit} from "../../../common/CommonExhibit";
import Search from "../../../common/Search";
import categoryListEvent from "../../../common/categoryListEvent";

const FormulaParam = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  const onButtonClick = async (key, config, e) => {
    const { slaveSelectedRows, masterContainer, categoryContainer, categoryDelData: categoryDelDataOld } = props;

    if (key === 'addButton' || key === 'addChildButton') {
      const childCallback = (params) => {
        const categoryData: any = [];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaCategory');
        if (index > -1 && commonUtils.isNotEmpty(masterContainer.slaveData[index].viewDrop)) {
          const formulaCategory = commonUtils.objectToArr(commonUtils.stringToObj(masterContainer.slaveData[index].viewDrop));
          formulaCategory.forEach((dataRow, rowIndex) => {
            const data = props.onAdd(categoryContainer);
            data.superiorId = params.masterData.id;
            data.paramCategory = dataRow.id;
            data.sortNum = rowIndex + 1;
            categoryData.push(data);
          });
        }
        return { categoryData };
      }
      props.onButtonClick(key, config, e, {childCallback});
    }
    else if (key === 'modifyButton') {
      const childCallback = async (params) => {
        let returnData = await props.getDataList({ name: 'category', containerId: categoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        const addState = {...returnData};
        const categoryData: any = [];
        const categoryDataOld: any = [...addState.categoryData];
        const categorySelectedRowKeys: any = [];
        addState.categoryData.forEach(item => {
          categorySelectedRowKeys.push(item[categoryContainer.tableKey]);
        });
        addState.categorySelectedRowKeys = categorySelectedRowKeys;
        const categoryDelData: any = commonUtils.isEmptyArr(categoryDelDataOld) ? [] : [...categoryDelDataOld];
        const index = masterContainer.slaveData.findIndex(item => item.fieldName === 'formulaCategory');
        if (index > -1 && commonUtils.isNotEmpty(masterContainer.slaveData[index].viewDrop)) {
          const formulaCategory = commonUtils.objectToArr(commonUtils.stringToObj(masterContainer.slaveData[index].viewDrop));
          let rowIndex = 0;
          for(const dataRow of categoryDataOld) {
            const index = formulaCategory.findIndex(item => item.id === dataRow.paramCategory);
            if (!(index > -1)) {
              dataRow.handleType = 'del';
              categoryDelData.push(dataRow);
              categoryDataOld.splice(rowIndex, 1);
            }
            rowIndex += 1;
          }

          formulaCategory.forEach((dataRow, rowIndex)  => {
            const indexCategory = categoryDataOld.findIndex(item => item.paramCategory === dataRow.id);
            if (!(indexCategory > -1)) {
              const data = props.onAdd(categoryContainer);
              data.superiorId = params.masterData.id;
              data.paramCategory = dataRow.id;
              data.sortNum = rowIndex + 1;
              categoryData.push(data);
            } else {
              categoryData.push(categoryDataOld[indexCategory]);
            }
          });
          addState.categoryData = categoryData;
        }
        return addState;
      }
      props.onButtonClick(key, config, e, {childCallback});

    } else if (key === 'delButton') {
      const childCallback = async (params) => {
        const saveData: any = [];
        const returnData = await props.getDataList({ name: 'category', containerId: categoryContainer.id, condition: { dataId: slaveSelectedRows[0].id }, isWait: true });
        saveData.push(commonUtils.mergeData('category', returnData.categoryData, [], [], true));
        return saveData;
      }
      props.onButtonClick(key, config, e, {childCallback});
    } else {
      props.onButtonClick(key, config, e);
    }
  }

  const onModalOk = async (e) => {
    const { categoryData: categoryDataOld, categorySelectedRowKeys: categorySelectedRowKeysOld, categoryDelData } = props;
    const childCallback = (params) => {
      const saveData: any = [];
      const categorySelectedRowKeys = commonUtils.isEmptyArr(categorySelectedRowKeysOld) ? [] : categorySelectedRowKeysOld;
      const categoryData: any = [];
      for(const category of categoryDataOld) {
        if (categorySelectedRowKeys.findIndex(item => item === category.paramCategory) > -1) {
          categoryData.push(category);
        } else if (category.handleType !== 'add') {
          categoryData.push({...category, handleType: 'del' });
        }
      }
      saveData.push(commonUtils.mergeData('category', categoryData.filter(item => commonUtils.isNotEmpty(item.handleType)), [], categoryDelData, true));
      return saveData;
    }
    props.onModalOk(e, {childCallback});
  }




  const { enabled, masterIsVisible, slaveContainer, searchRowKeys, searchData, commonModel, masterContainer } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, onClick: onButtonClick, enabled, permissionData: props.permissionData, container: masterContainer,
    isModal: props.isModal, buttonGroup: props.getButtonGroup() };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.isLastColumn = false;
  tableParam.enabled = false;

  const categoryParam: any = commonUtils.getTableProps('category', props);
  categoryParam.isLastColumn = false;
  categoryParam.pagination = false;
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
      <Drawer width={900} visible={masterIsVisible} maskClosable={false} onClose={props.onModalCancel} footer={
        <div>
          <Button onClick={onModalOk} type="primary">Submit</Button>
          <Button onClick={props.onModalCancel} style={{ marginRight: 8 }}>Cancel</Button>
        </div>}
      >
        <Form form={form} >
          <CommonExhibit name="master" {...props} />
          <TableComponent {...categoryParam} />
        </Form>
      </Drawer>
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(categoryListEvent(FormulaParam)));