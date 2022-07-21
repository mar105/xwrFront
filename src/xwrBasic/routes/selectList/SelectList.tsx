import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Form, Tooltip} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
import { DeleteOutlined } from '@ant-design/icons';
import CommonModal from "../../../common/commonModal";
import {UploadFile} from "../../../common/UploadFile";
import { CloudUploadOutlined } from '@ant-design/icons';

const SelectList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'selectButton', caption: '选择', htmlType: 'button', sortNum: 10, disabled: props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: props.enabled });
    buttonGroup.push({ key: 'refreshButton', caption: '刷新', htmlType: 'button', sortNum: 70, disabled: props.enabled });
    return buttonGroup;
  }

  const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
    const { dispatchModifyState, [name + 'Container']: container, [name + 'Data']: tableData, [name + 'SelectedRowKeys']: selectedRowKeysOldOld } = props;
    const returnData = props.onRowSelectChange(name, selectedRowKeys, selectedRows, true);
    const addState: any = {};
    const superiorQtyData: any = [];
    if (commonUtils.isNotEmptyArr(props.containerData)) {
      if (commonUtils.isNotEmpty(container.superiorContainerId)) {
        //勾选嵌套表
        const containerIndex = props.containerData.findIndex(item => item.id === container.superiorContainerId);
        if (containerIndex > -1) {
          const superiorDataSetName = props.containerData[containerIndex].dataSetName;
          const superiorData = commonUtils.isEmptyArr(props[superiorDataSetName + 'Data']) ? [] : [...props[superiorDataSetName + 'Data']];
          superiorData.forEach((superior, index) => {
            // superior.unMeasureQty = superior.benchmarkMeasureQty;
            // superior.unMaterialQty = superior.benchmarkMaterialQty;
            // superior.unConvertQty = superior.benchmarkConvertQty;
            superiorData[index] = {...superior,
              unMeasureQty: superior.benchmarkMeasureQty,
              unMaterialQty: superior.benchmarkMaterialQty,
              unConvertQty: superior.benchmarkConvertQty
            };
          });

          selectedRowKeys.forEach(selectedRowKey => {
            const index = tableData.findIndex(item => item[container.tableKey] === selectedRowKey);
            if (index > -1) {
              //求和嵌套表
              const superiorIndex = superiorData.findIndex(item => item[container.treeKey] === tableData[index][container.treeSlaveKey]);
              if (superiorIndex > -1) {
                const qtyIndex = superiorQtyData.findIndex(item => item[container.treeSlaveKey] === tableData[index][container.treeSlaveKey]);
                if (qtyIndex > -1) {
                  superiorData[superiorIndex] = {...superiorData[superiorIndex],
                    unMeasureQty: superiorData[superiorIndex].unMeasureQty + tableData[index].unMeasureQty,
                    unMaterialQty: superiorData[superiorIndex].unMaterialQty + tableData[index].unMaterialQty,
                    unConvertQty: superiorData[superiorIndex].unConvertQty + tableData[index].unConvertQty
                  };

                  superiorQtyData[qtyIndex] = {
                    [container.treeSlaveKey]: tableData[index][container.treeSlaveKey],
                    unMeasureQty: superiorQtyData[qtyIndex].unMeasureQty + tableData[index].unMeasureQty,
                    unMaterialQty: superiorQtyData[qtyIndex].unMaterialQty + tableData[index].unMaterialQty,
                    unConvertQty: superiorQtyData[qtyIndex].unConvertQty + tableData[index].unConvertQty,
                  };
                } else {
                  superiorData[superiorIndex] = {...superiorData[superiorIndex],
                    unMeasureQty: tableData[index].unMeasureQty,
                    unMaterialQty: tableData[index].unMaterialQty,
                    unConvertQty: tableData[index].unConvertQty
                  };

                  superiorQtyData.push({[container.treeSlaveKey]: tableData[index][container.treeSlaveKey],
                    unMeasureQty: tableData[index].unMeasureQty,
                    unMaterialQty: tableData[index].unMaterialQty,
                    unConvertQty: tableData[index].unConvertQty
                  });
                }
                const selectedRowIndex = returnData[superiorDataSetName + 'SelectedRows'].findIndex(item => item[container.treeKey] === tableData[index][container.treeSlaveKey]);
                if (selectedRowIndex > -1) {
                  returnData[superiorDataSetName + 'SelectedRows'][selectedRowIndex] = superiorData[superiorIndex];
                }
              }
            }
          });
          addState[superiorDataSetName + 'Data'] = superiorData;
        }
      } else {
        //勾选父级表
        const containerIndex = props.containerData.findIndex(item => item.superiorContainerId === container.id);
        if (containerIndex > -1) {
          const selectedRowKeysOld = commonUtils.isEmptyArr(selectedRowKeysOldOld) ? [] : selectedRowKeysOldOld;

          const filterKeys = selectedRowKeysOld.filter(item => !selectedRowKeys.includes(item));
          if (commonUtils.isNotEmptyArr(filterKeys)) {
            //取消勾选
            filterKeys.forEach(selectedRowKey => {
              const index = tableData.findIndex(item => item[container.tableKey] === selectedRowKey);
              if (index > -1) {
                tableData[index] = {...tableData[index],
                  unMeasureQty: tableData[index].benchmarkMeasureQty,
                  unMaterialQty: tableData[index].benchmarkMaterialQty,
                  unConvertQty: tableData[index].benchmarkConvertQty
                };
              }
            });
          } else {
            // 增加勾选
            const filterKeys = selectedRowKeys.filter(item => !selectedRowKeysOld.includes(item));
            filterKeys.forEach(selectedRowKey => {
              const index = tableData.findIndex(item => item[container.tableKey] === selectedRowKey);
              if (index > -1) {
                tableData[index] = {...tableData[index],
                  unMeasureQty: tableData[index].benchmarkMeasureQty,
                  unMaterialQty: tableData[index].benchmarkMaterialQty,
                  unConvertQty: tableData[index].benchmarkConvertQty
                }
                const selectedRowIndex = selectedRows.findIndex(item => item[container.tableKey] === selectedRowKey);
                if (selectedRowIndex > -1) {
                  selectedRows[selectedRowIndex] = tableData[index];
                }
              }
            });
          }
          addState[name + 'SelectedRows'] = selectedRows;
          addState[name + 'Data'] = tableData;
        }
      }
    }
    dispatchModifyState({ ...returnData, ...addState });
  }

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData,
    reportFileList: props.reportFileList, reportDelFileList: props.reportDelFileList, dispatchModifyState: props.dispatchModifyState, container: slaveContainer, buttonGroup: getButtonGroup(), isModal: props.isModal, modalType: 'select',
    onUploadSuccess: props.onUploadSuccess };

  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.enabled = false;
  tableParam.rowSelection.preserveSelectedRowKeys = true;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };

  //材料需求计划单独选择功能
  if (props.routeData.routeName === '/xwrPurchase/materialRequirePlan') {
    tableParam.eventSelection.onRowSelectChange = onRowSelectChange;
    if (commonUtils.isNotEmptyObj(tableParam.tableNestParam)) {
      tableParam.tableNestParam.eventSelection.onRowSelectChange = onRowSelectChange;
      tableParam.tableNestParam.enabled = false;
      tableParam.tableNestParam.rowSelection.preserveSelectedRowKeys = true;
      // tableParam.tableNestParam.eventOnRow = {...tableParam.tableNestParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick};
    }
  }




  const selectParam: any = commonUtils.getTableProps('slave', props);
  selectParam.enabled = false;
  selectParam.property.dataSource = props.slaveSelectedRows;
  selectParam.property.rowSelection = null;
  selectParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, 'slave', 'delSelectButton', record) : null}>
      <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
  }, width: 50 , fixed: 'right' };
    if (commonUtils.isNotEmptyObj(selectParam.tableNestParam)) {
      selectParam.tableNestParam.property.rowSelection = null;
      selectParam.tableNestParam.property.dataSource = props.slaveNestSelectedRows;
      selectParam.tableNestParam.lastColumn = { title: 'o',
        render: (text,record, index)=> {
          return <a onClick={props.onLastColumnClick ? props.onLastColumnClick.bind(this, 'slaveNest', 'delSelectButton', record) : null}>
            <Tooltip placement="top" title="删除"><DeleteOutlined /></Tooltip></a>
        }, width: 50 , fixed: 'right' };
    }


  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  const uploadParam: any = commonUtils.getUploadProps('report', props);
  uploadParam.enabled = true;
  uploadParam.isSelfModify = true;

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
          <TableComponent {...selectParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} />
      <CommonModal modalVisible={props.modalVisible} modalTitle={props.modalTitle} onModalCancel={props.onModalCancel} modalPane={props.modalPane} />
      <CommonModal modalVisible={props.modalReportVisible} onModalCancel={props.onModalCancel} destroyOnClose={true} modalPane={
        <div>
          <UploadFile {...uploadParam}/>
          <a onClick={props.onReportUpload.bind(this, 'report')}><CloudUploadOutlined /></a>
        </div>
      } />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(SelectList)));