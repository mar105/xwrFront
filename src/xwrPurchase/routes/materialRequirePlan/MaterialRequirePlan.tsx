import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React, {useMemo} from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../../../common/ButtonGroup";
import {Form, Tooltip} from "antd";
import Search from "../../../common/Search";
import commonListEvent from "../../../common/commonListEvent";
import { SaveOutlined } from '@ant-design/icons';

const CommonList = (props) => {
  const [form] = Form.useForm();
  props.onSetForm(form);

  const onRowSelectChange = (name, selectedRowKeys, selectedRows) => {
    const { dispatchModifyState, [name + 'Container']: container, [name + 'Data']: tableData, [name + 'SelectedRowKeys']: selectedRowKeysOldOld } = props;
    const returnData = props.onRowSelectChange(name, selectedRowKeys, selectedRows);
    const addState: any = {};
    const superiorQtyData: any = [];
    if (commonUtils.isNotEmptyArr(props.containerData)) {
      if (commonUtils.isNotEmpty(container.superiorContainerId)) {
        //勾选嵌套表
        const containerIndex = props.containerData.findIndex(item => item.id === container.superiorContainerId);
        if (containerIndex > -1) {
          const superiorDataSetName = props.containerData[containerIndex].dataSetName;
          const superiorData = commonUtils.isEmptyArr(props[superiorDataSetName + 'Data']) ? [] : [...props[superiorDataSetName + 'Data']];
          const superiorSelectRowKeys: any = [];
          const superiorSelectRows: any = [];
          superiorData.forEach((superior, index) => {
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
              const qtyIndex = superiorQtyData.findIndex(item => item[container.treeSlaveKey] === tableData[index][container.treeSlaveKey]);
              if (qtyIndex > -1) {
                superiorData[superiorIndex] = {...superiorData[superiorIndex],
                  unMeasureQty: superiorData[superiorIndex].unMeasureQty + tableData[index].unMeasureQty,
                  unMaterialQty: superiorData[superiorIndex].unMaterialQty + tableData[index].unMaterialQty,
                  unConvertQty: superiorData[superiorIndex].unConvertQty + tableData[index].unConvertQty
                }

                superiorQtyData[qtyIndex] = {
                  [container.treeSlaveKey]: tableData[index][container.treeSlaveKey],
                  unMeasureQty: superiorQtyData[qtyIndex].unMeasureQty + tableData[index].unMeasureQty,
                  unMaterialQty: superiorQtyData[qtyIndex].unMaterialQty + tableData[index].unMaterialQty,
                  unConvertQty: superiorQtyData[qtyIndex].unConvertQty + tableData[index].unConvertQty,
                };
              } else {
                superiorData[index] = {...superiorData[superiorIndex],
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
            }
          });
          addState[superiorDataSetName + 'Data'] = superiorData;
          addState[superiorDataSetName + 'SelectedRowKeys'] = superiorSelectRowKeys;
          addState[superiorDataSetName + 'SelectRows'] = superiorSelectRows;
        }
      } else {
        //勾选父级表
        const containerIndex = props.containerData.findIndex(item => item.superiorContainerId === container.id);
        if (containerIndex > -1) {
          const nestDataSetName = props.containerData[containerIndex].dataSetName;
          const nestSelectRowKeys: any = commonUtils.isEmptyArr(props[nestDataSetName + 'SelectedRowKeys']) ? [] : [...props[nestDataSetName + 'SelectedRowKeys']];
          const nestSelectRows: any = commonUtils.isEmptyArr(props[nestDataSetName + 'SelectedRows']) ? [] : [...props[nestDataSetName + 'SelectedRows']];
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
                }
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
              }
            });
          }
          addState[name + 'Data'] = tableData;
          addState[nestDataSetName + 'SelectedRowKeys'] = nestSelectRowKeys;
          addState[nestDataSetName + 'SelectRows'] = nestSelectRows;
        }
      }
    }

    dispatchModifyState({ ...returnData, ...addState });
  }

  //标准配置配置，直接把配置保存后后台配置表
  const configSetting = props.commonModel.userInfo.shopId === '1395719229487058944' ?
    <a onClick={props.onTableConfigSaveClick.bind(this, 'slave')}> <Tooltip placement="top" title="列宽保存"><SaveOutlined /> </Tooltip></a> : '';

  const { commonModel, enabled, slaveContainer, searchRowKeys, searchData } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: props.onButtonClick, enabled, permissionData: props.permissionData, container: slaveContainer, buttonGroup: props.getButtonGroup(), isModal: props.isModal,
    onUploadSuccess: props.onUploadSuccess, dispatchModifyState: props.dispatchModifyState };
  const tableParam: any = commonUtils.getTableProps('slave', { ...props, onRowSelectChange });
  tableParam.enabled = false;
  tableParam.eventOnRow = { ...tableParam.eventOnRow, onRowDoubleClick: props.onRowDoubleClick };
  tableParam.width = 1500;
  tableParam.lastTitle = <div> {configSetting} </div>;
  tableParam.lastColumn = { title: 'o',
    render: (text,record, index)=> {
    return <div />
  }, width: 50 , fixed: 'right' }
  const search = useMemo(() => {
    return (<Search name="search" {...props} /> ) }, [slaveContainer, searchRowKeys, searchData]);

  return (
    <div>
      {props.slaveContainer ?
        <div>
          {search}
          <TableComponent {...tableParam} />
        </div>: ''}
      <ButtonGroup {...buttonGroup} />
    </div>

  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CommonList)));