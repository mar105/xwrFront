import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../xwrProduction/application";
import * as request from "../utils/request";

const commonProductionEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const calcPaperState = (params) => {
      const {name, fieldName, record, returnData } = params;
      const { [name + 'Container']: container } = props;
      let dataRow: any = {};
      if (container.isTree) {
        dataRow = props.getTreeNode(returnData[name + 'Data'], record.allId);
        props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
      } else {
        const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (index > -1) {
          dataRow = returnData[name + 'Data'][index];
        }
      }
      if (fieldName === 'singlePQty' || fieldName === 'totalPQty' || fieldName === 'printType' ||
        fieldName === 'frontColor' || fieldName === 'frontSpecialColor' || fieldName === 'backColor' || fieldName === 'backSpecialColor') {
        const returnDataRow = calcPaper(dataRow);

        if (dataRow.handleType === 'modify') {
          const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
          if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
            returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify], ...returnDataRow };
          }
        }
        if (container.isTree) {
          props.setTreeNode(returnData[name + 'Data'], { ...dataRow, ...returnDataRow}, record.allId);
        } else {
          const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
          if (index > -1) {
            returnData[name + 'Data'][index] = { ...dataRow, ...returnDataRow};
          }
        }
      }
      return returnData;
    };

    const calcPaper = (dataRowOld) => {
      const dataRow = { ...dataRowOld};
      dataRow.totalPQty = commonUtils.isEmptyorZeroDefault(dataRow.totalPQty, 2);
      if (dataRow.totalPQty >= 4) {
        dataRow.plateQty = Math.ceil(dataRow.totalPQty / commonUtils.isEmptyorZeroDefault(dataRow.singlePQty, 1));
        if (dataRow.printType === 'frontBack') { // 样本正反
          if (dataRow.plateQty < 2) {
            dataRow.plateQty = 2;
            dataRow.splitQty = 1;
          } else {
            dataRow.splitQty = Math.ceil(dataRow.plateQty);
          }
          dataRow.totalPlateQty = dataRow.splitQty * (
            commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0) +
            commonUtils.isEmptyDefault(dataRow.backColor, 0) + commonUtils.isEmptyDefault(dataRow.backSpecialColor, 0));
        } else if (dataRow.printType === 'leftRight' || dataRow.printType === 'heavenEarth') { //左右翻 天地翻
          dataRow.splitQty = Math.ceil(dataRow.plateQty);
          dataRow.totalPlateQty = dataRow.splitQty * (
            commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
        } else { //单面
          dataRow.plateQty = commonUtils.isEmptyDefault(dataRow.totalPQty, 0) / 2 / dataRow.singlePQty;
          dataRow.splitQty = Math.ceil(dataRow.plateQty);
          dataRow.totalPlateQty = dataRow.splitQty * (
            commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
        }
        if (dataRow.splitQty > 0 && dataRow.singlePQty > 0) {
          dataRow.machineQty = Math.ceil(commonUtils.isEmptyDefault(dataRow.partQty, 0) * commonUtils.isEmptyDefault(dataRow.totalPQty, 0) / 2 / dataRow.singlePQty / dataRow.splitQty);
          dataRow.totalMachineQty = dataRow.machineQty * dataRow.splitQty;
        }
      } else {
        if (dataRow.printType === 'frontBack') {
          dataRow.plateQty = 2;
          dataRow.totalPlateQty = dataRow.splitQty * (
            commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0) +
            commonUtils.isEmptyDefault(dataRow.backColor, 0) + commonUtils.isEmptyDefault(dataRow.backSpecialColor, 0));
        } else {
          dataRow.plateQty = 1;
          dataRow.totalPlateQty = dataRow.splitQty * (
            commonUtils.isEmptyDefault(dataRow.frontColor, 0) + commonUtils.isEmptyDefault(dataRow.frontSpecialColor, 0));
        }
        dataRow.splitQty = 1;
        if (dataRow.singlePQty > 0) {
          dataRow.machineQty = Math.ceil(commonUtils.isEmptyDefault(dataRow.partQty, 0) * commonUtils.isEmptyorZeroDefault(dataRow.magnification, 1) / dataRow.singlePQty);
          dataRow.totalMachineQty = dataRow.machineQty * dataRow.splitQty;
        }
      }
      return {
        totalPQty: dataRow.totalPQty,
        plateQty: dataRow.plateQty,
        splitQty: dataRow.splitQty,
        totalPlateQty: dataRow.totalPlateQty,
        machineQty: dataRow.machineQty,
        totalMachineQty: dataRow.totalMachineQty
      };
    }

    const modifyFieldData = (name, dataOld, dataModifyOld, filterFieldName, filterValue, modifyFieldName, modifyValue) => {
      const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];

      const data: any = [...dataOld];
      data.filter(item => item[filterFieldName] === filterValue).forEach(dataRowOld => {
        const dataRow: any = {...dataRowOld, handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType, [modifyFieldName]: modifyValue };
        if (dataRowOld.allId) {
          props.setTreeNode(data, dataRow, dataRowOld.allId);
        } else {
          const index = data.findIndex(item => item.id === dataRow.id);
          data[index] = dataRow;
        }

        if (commonUtils.isNotEmptyArr(dataRow.children)) {
          modifyChildFieldData(name, data.children, dataModify, modifyFieldName, modifyValue);
        }
        if (dataRow.handleType === 'modify') {
          const indexModify = dataModify.findIndex(item => item.id === dataRow.id);
          if (indexModify > -1) {
            dataModify[indexModify] = {...dataModify[indexModify], [modifyFieldName]: modifyValue };
          } else {
            dataModify.push({ id: dataRow.id, handleType: dataRow.handleType, [modifyFieldName]: modifyValue })
          }
        }
      });
      return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
    };

    const modifyChildFieldData = (name, data, dataModify, modifyFieldName, modifyValue) => {
      data.forEach(dataRowOld => {
        const dataRow: any = {...dataRowOld, handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType, [modifyFieldName]: modifyValue };
        props.setTreeNode(data, dataRow, dataRowOld.allId);
        if (commonUtils.isNotEmptyArr(dataRow.children)) {
          modifyChildFieldData(name, dataRow.children, dataModify, modifyFieldName, modifyValue);
        }
        if (dataRow.handleType === 'modify') {
          const indexModify = dataModify.findIndex(item => item.id === dataRow.id);
          if (indexModify > -1) {
            dataModify[indexModify] = {...dataModify[indexModify], [modifyFieldName]: modifyValue };
          } else {
            dataModify.push({ id: dataRow.id, handleType: dataRow.handleType, [modifyFieldName]: modifyValue })
          }
        }
      });
      return { [name + 'Data']: data, [name + 'ModifyData']: dataModify };
    };

    const onDataChange = (params) => {
      const { name, fieldName, record, isWait, value: valueOld } = params;
      const { dispatch, partData: partDataOld, partModifyData: partModifyDataOld, partSelectedRowKeys,
        materialData: materialDataOld, materialModifyData: materialModifyDataOld,
        processData: processDataOld, processModifyData: processModifyDataOld } = propsRef.current;
      // 前面数据改变前作判断
      if(name === 'material') {
        if (fieldName === 'materialGenre') {
          if (valueOld !== '2product' && commonUtils.isEmptyArr(partSelectedRowKeys)) {
            const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChoosePart');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择部件！'});
            }
            return;
          }
        }
      } else if(name === 'process') {
        if (valueOld !== '3product' && commonUtils.isEmptyArr(partSelectedRowKeys)) {
          const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChoosePart');
          if (index > -1) {
            props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
          } else {
            props.gotoError(dispatch, {code: '6001', msg: '请选择部件！'});
          }
          return;
        }
      }

      // 开始修改数据
      let returnData = props.onDataChange({...params, isWait: true});
      if(name === 'slave') {
        if (fieldName === 'productName') {
          returnData = {...returnData, ...modifyFieldData('part', partDataOld, partModifyDataOld, 'slaveId', returnData.dataRow.id, 'productName', returnData.dataRow.productName) };
          returnData = {...returnData, ...modifyFieldData('material', materialDataOld, materialModifyDataOld, 'slaveId', returnData.dataRow.id,'productName', returnData.dataRow.productName) };
          returnData = {...returnData, ...modifyFieldData('process', processDataOld, processModifyDataOld, 'slaveId', returnData.dataRow.id, 'productName', returnData.dataRow.productName) };
        }
      } else if(name === 'part') {
        //在方法内部判断了哪些字段需要计算
        returnData = calcPaperState({name, fieldName, record, returnData});
        if (fieldName === 'partName') {
          returnData = {...returnData, ...modifyFieldData('material', materialDataOld, materialModifyDataOld, 'partId', returnData.dataRow.id,'partName', returnData.dataRow.partName) };
          returnData = {...returnData, ...modifyFieldData('process', processDataOld, processModifyDataOld, 'partId', returnData.dataRow.id,'partName', returnData.dataRow.partName) };
        }
      } else if(name === 'material') {
        if (fieldName === 'materialGenre') {
          const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
          if (index > -1) {
            returnData[name + 'Data'][index].partId = returnData[name + 'Data'][index].materialGenre === '2product' ? '' :
              commonUtils.isEmpty(returnData[name + 'Data'][index].partId) ? partSelectedRowKeys[0] : returnData[name + 'Data'][index].partId;
          }
        }
      } else if(name === 'process') {
        if (fieldName === 'processGenre') {
          const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
          if (index > -1) {
            returnData[name + 'Data'][index].partId = returnData[name + 'Data'][index].processGenre === '3product' ? '' :
              commonUtils.isEmpty(returnData[name + 'Data'][index].partId) ? partSelectedRowKeys[0] : returnData[name + 'Data'][index].partId;
          }
        }
      }

      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const getTreeIndexAndInfo = (treeData, id) => {
      let returnInfo: any = { index: 999 };
      for(let index = 0; index < treeData.length; index++) {
        if (treeData[index].id === id) {
          returnInfo.index = index;
          returnInfo.dataRow = treeData[index];
          break;
        } else if (commonUtils.isNotEmptyArr(treeData[index].children)) {
          returnInfo = getTreeChildIndexAndInfo(treeData[index].children, id);
        }
      }
      return returnInfo;
    }

    const getTreeChildIndexAndInfo = (treeData, id) => {
      let returnInfo: any = { index: 999 };
      for(let index = 0; index < treeData.length; index++) {
        if (treeData[index].id === id) {
          returnInfo.index = index;
          returnInfo.dataRow = treeData[index];
          break;
        } else if (commonUtils.isNotEmptyArr(treeData[index].children)) {
          returnInfo = getTreeChildIndexAndInfo(treeData[index].children, id);
        }
      }
      return returnInfo;
    }

    const sortData = (partData, processData, sort = 'asc') => {
      processData.sort((row1, row2) => {
        const partDataRowInfo1 = sort === 'asc' ? getTreeIndexAndInfo(partData, row1.partId) : { index: 0, dataRow: { allId: '' } };
        const merge1 = sort === 'asc' ? '0' : row1.isMerge ? '0' : '1';
        const indexSort1 = partDataRowInfo1.index;
        const level1 = partDataRowInfo1.index === 999 ? '9' : partDataRowInfo1.dataRow.allId.split(',').length.toString();
        if (row1.sortNum === undefined) {
          row1.sortNum = 0;
        }
        if (row2.sortNum === undefined) {
          row2.sortNum = 0;
        }
        let partSort1 = '0000' + indexSort1.toString();
        partSort1 = partSort1.substring(partSort1.length - 3);
        let processSort1 = '0000' + row1.sortNum.toFixed(2);
        processSort1 = processSort1.substring(processSort1.length - 5);

        const partDataRowInfo2 = sort === 'asc' ? getTreeIndexAndInfo(partData, row2.partId) : { index: 0, dataRow: { allId: '' } };
        const merge2 = sort === 'asc' ? '0' : row2.isMerge ? '0' : '1';
        const indexSort2 = partDataRowInfo2.index;
        const level2 = partDataRowInfo2.index === 999 ? '9' : partDataRowInfo2.dataRow.allId.split(',').length.toString();
        let partSort2 = `0000${indexSort2}`;
        partSort2 = partSort2.substring(partSort2.length - 3);
        let processSort2 = '0000' + row2.sortNum.toFixed(2);
        processSort2 = processSort2.substring(processSort2.length - 5);
        return sort === 'asc' ?
          parseFloat(level1 + partSort1 + row1.processGenre.substring(0, 1) + processSort1) - parseFloat(level2 + partSort2 + row2.processGenre.substring(0, 1) + processSort2) :
          parseFloat(merge2 + level2 + partSort2 + row2.processGenre.substring(0, 1) + processSort2) - parseFloat(merge1 + level1 + partSort1 + row1.processGenre.substring(0, 1) + processSort1);
      });
      return processData;
    };


    const onLastColumnClick = (name, key, record, e, isWait = false) => {
      let addState: any = {};
      if (name === 'slave') {
        //部件
        addState = { ...addState, ...props.delTableData('part', 'slaveId', record.id) };

        //材料
        addState = { ...addState, ...props.delTableData('material', 'slaveId', record.id) };

        //工艺
        addState = { ...addState, ...props.delTableData('process', 'slaveId', record.id) };
      } else if (name === 'part') {
        //材料
        addState = { ...addState, ...props.delTableData('material', 'partId', record.id) };

        //工艺
        addState = { ...addState, ...props.delTableData('process', 'partId', record.id) };
      }
      const returnData = props.onLastColumnClick(name, key, record, e, true);
      if (isWait) {
        return { ...returnData, ...addState  };
      } else {
        props.dispatchModifyState({ ...returnData, ...addState });
      }
    }

    const onDropPopup = async (params) => {
      params.onModalOk = onModalOk;
      props.onDropPopup(params);
    }

    const onTableAddClick = (name, e, isWait = false) => {
      const { dispatch, slaveSelectedRows, slaveData, partSelectedRows, partData, processContainer }: any = propsRef.current;
      const returnData = props.onTableAddClick(name, e, true);
      const addState = { ...returnData };
      if (name === 'part' || name === 'material' || name === 'process') {
        if (name === 'part') {
          if (commonUtils.isEmptyArr(slaveSelectedRows)) {
            const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          const part = props.getTreeNode(returnData[name + 'Data'], returnData.dataRow.allId);
          const slave = props.getTreeNode(slaveData, slaveSelectedRows[0].allId);
          part.slaveId = slave.id;
          part.partQty = slave.productQty;
          part.productName = slave.productName;
          props.setTreeNode(returnData[name + 'Data'], part, returnData.dataRow.allId);
          addState[name + 'SelectedRowKeys'] = [returnData.dataRow.id];
          addState[name + 'SelectedRows'] = [part];
        } else if (name === 'material') {
          if (commonUtils.isEmptyArr(slaveSelectedRows)) {
            const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.dataRow.id);
          const slave = props.getTreeNode(slaveData, slaveSelectedRows[0].allId);
          returnData[name + 'Data'][index].slaveId = slave.id;
          returnData[name + 'Data'][index].productName = slave.productName;

          if (commonUtils.isEmptyArr(partSelectedRows)) {
            returnData[name + 'Data'][index].partId = '';
            returnData[name + 'Data'][index].materialGenre = '2product';
          } else {
            const part = props.getTreeNode(partData, partSelectedRows[0].allId);
            returnData[name + 'Data'][index].partName = part.partName;
            returnData[name + 'Data'][index].partId = part.id;
            returnData[name + 'Data'][index].materialGenre = '0main';
          }
        } else if (name === 'process') {
          if (commonUtils.isEmptyArr(slaveSelectedRows)) {
            const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          let config = {};
          if (commonUtils.isNotEmptyArr(partSelectedRows)) {
            const index = processContainer.slaveData.findIndex(item => item.fieldName === 'processName');
            config = processContainer.slaveData[index];
          } else {
            const index = processContainer.slaveData.findIndex(item => item.fieldName === 'tableAddProduct');
            config = processContainer.slaveData[index];
          }
          if (commonUtils.isNotEmptyObj(config)) {
            const dropParam = {name, type: 'popupActive', config, record: {}};
            onDropPopup(dropParam);
            returnData[name + 'Data'] = propsRef.current[name + 'Data'];
          }
        }

        if (isWait) {
          return {...addState, [name + 'Data']: returnData[name + 'Data']};
        } else {
          props.dispatchModifyState({...addState, [name + 'Data']: returnData[name + 'Data']});
        }
      } else {
        props.onTableAddClick(name, e);
      }
    };
    const onRowClick = async (name, record, rowKey) => {
      const { dispatchModifyState } = props;
      const addState: any = {};
      if (name === 'slave') {
        addState.partSelectedRowKeys = [];
        addState.partSelectedRows = [];
      }
      dispatchModifyState({ [name + 'SelectedRowKeys']: [record[rowKey]], [name + 'SelectedRows']: [record], ...addState });
    }

    const onModalOk = async (params, isWait) => {
      if (commonUtils.isEmpty(params)) {
        props.dispatchModifyState({ modalVisible: false });
        return;
      }
      const name = params.name;
      const { dispatch, [name + 'Container']: container, masterData, [name + 'Data']: dataOld, [name + 'ModifyData']: dataModifyOld, partData, commonModel }: any = propsRef.current;
      if (params.type === 'popupActive' && params.name === 'process' && commonUtils.isNotEmptyArr(params.selectList)) {
        const assignField = params.config.assignField;
        const fieldName = params.config.fieldName;
        const record = params.record;
        const data = [...dataOld];
        const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];
        const url: string = application.urlBasic + '/process/getProcessMatch';
        const matchIndex = container.slaveData.findIndex(item => item.fieldName === 'processMatch');
        const paramsMatch = {
          routeId: params.routeId,
          groupId: commonModel.userInfo.groupId,
          shopId: commonModel.userInfo.shopId,
          containerId: container.slaveData[matchIndex].superiorId,
          containerSlaveId: container.slaveData[matchIndex].id,
          processIdArr: params.selectKeys,
        };
        let processMatch: any = [];
        const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit(paramsMatch))).data;
        if (interfaceReturn.code === 1) {
          processMatch = interfaceReturn.data;
        } else {
          props.gotoError(dispatch, interfaceReturn);
          return;
        }

        params.selectList.forEach((selectItem, selectIndex) => {
          const index = data.findIndex(item => item.id === record.id);
          let dataRow: any = {};
          if (index > -1 && (selectIndex === 0 && ((params.selectList.length === 1) || commonUtils.isEmpty(data[index][fieldName])))) {
            const assignValue = commonUtils.getAssignFieldValue(name, assignField, selectItem, propsRef.current);
            const rowData = { ...data[index], ...assignValue };
            rowData.handleType = commonUtils.isEmpty(data[index].handleType) ? 'modify' : data[index].handleType;
            rowData.partId = rowData.processGenre === '3product' ? '' : rowData.partId;
            rowData.partName = rowData.processGenre === '3product' ? '' : rowData.partName;
            data[index] = rowData;
            dataRow = rowData;
            if (data[index].handleType === 'modify') {
              const indexModify = dataModify.findIndex(item => item.id === record.id);
              if (indexModify > -1) {
                dataModify[indexModify] = {...dataModify[indexModify], ...dataModify[index], ...assignValue };
              } else {
                dataModify.push({ id: record.id, handleType: data[index].handleType, ...assignValue })
              }
            }
          } else {
            const assignValue = commonUtils.getAssignFieldValue(name, assignField, selectItem, propsRef.current);
            const rowData = { ...props.onAdd(container), ...assignValue, superiorId: masterData.id };
            rowData.partId = rowData.processGenre === '3product' ? '' : rowData.partId;
            rowData.partName = rowData.processGenre === '3product' ? '' : rowData.partName;
            dataRow = rowData;
            data.push(rowData);
          }

          processMatch.filter(item => item.superiorId === dataRow.processId).forEach(matchItem => {
            const assignValue = commonUtils.getAssignFieldValue(name, assignField, matchItem, propsRef.current);
            const rowData = { ...props.onAdd(container), ...assignValue, superiorId: masterData.id };
            rowData.partId = rowData.processGenre === '3product' ? '' : rowData.partId;
            rowData.partName = rowData.processGenre === '3product' ? '' : rowData.partName;
            const index = data.findIndex(item => item.slaveId === rowData.slaveId && item.partId === rowData.partId && item.processId === rowData.processId);
            if (!(index > -1)) {
              data.push(rowData);
            }
          });
        });
        const processData = sortData(partData, data);
        if (isWait) {
          return { [name + 'Data']: processData, [name + 'ModifyData']: dataModify, modalVisible: false };
        } else {
          props.dispatchModifyState({ [name + 'Data']: processData, [name + 'ModifyData']: dataModify, modalVisible: false });
        }
      } else {
        props.onModalOk(params);
      }
    }

    const getLastChildData = (treeData, lastLevelData) => {
      treeData.forEach(data => {
        if (commonUtils.isNotEmptyArr(data.children)) {
          getLastChildData(data.children, lastLevelData);
        } else {
          lastLevelData.push(data);
        }
      });
    }

    const getPartLastChildData = (treeData, lastLevelData) => {
      treeData.forEach(data => {
        if (commonUtils.isNotEmptyArr(data.children)) {
          getPartLastChildData(data.children, lastLevelData);
        } else {//if (commonUtils.isNotEmpty(data.mergePartId)) {
          lastLevelData.push(data);
        }
      });
    }

    const getMergePartChildData = (treeData, mergePartIds, mergePartData) => {
      treeData.forEach(data => {
        if (commonUtils.isNotEmpty(data.mergePartId)) {
          if (mergePartIds.findIndex(item => item === data.mergePartId) > -1) {
            mergePartData.push(data);
          } else {
            const part = commonUtils.getTreeNodeById(treeData, data.mergePartId);
            mergePartData.push(part);
            mergePartIds.push(data.mergePartId);
            mergePartData.push(data);
          }
        }
        if (commonUtils.isNotEmptyArr(data.children)) {
          getMergePartChildData(data.children, mergePartIds, mergePartData);
        }
      });
    }

    const onButtonClick = async (key, config, e, childParams: any = undefined, isWait = false) => {
      const { commonModel, masterData: masterDataOld, slaveData: slaveDataOld,
        partData: partDataOld, partModifyData: partModifyDataOld,
        materialData: materialDataOld, materialModifyData: materialModifyDataOld,
        processData: processDataOld, processModifyData: processModifyDataOld } = propsRef.current;
      if (key === 'delButton' || key === 'invalidButton' || key === 'examineButton'  || key === 'cancelExamineButton') {
        const { slaveData, slaveModifyData, slaveDelData,
          partData, partModifyData, partDelData,
          materialData, materialModifyData, materialDelData,
          processData, processModifyData, processDelData,
        } = props;
        const childCallback = (params) => {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('slave', slaveData, slaveModifyData, slaveDelData, true));
          saveData.push(commonUtils.mergeData('part', partData, partModifyData, partDelData, true));
          saveData.push(commonUtils.mergeData('material', materialData, materialModifyData, materialDelData, true));
          saveData.push(commonUtils.mergeData('process', processData, processModifyData, processDelData, true));
          return saveData;
        }
        props.onButtonClick(key, config, e, { childCallback });
      } else if (key === 'calcButton') {
        const processData: any = [];
        const processModifyData = commonUtils.isEmptyArr(processModifyDataOld) ? [] : [...processModifyDataOld];
        processDataOld.forEach(processOld => {
          const qtyChange = { processInQty: 0, processOutQty: 0 };
          const process: any = {...processOld, handleType: commonUtils.isEmpty(processOld.handleType) ? 'modify' : processOld.handleType, ...qtyChange };
          processData.push(process);
          if (process.handleType === 'modify') {
            const indexModify = processModifyData.findIndex(item => item.id === process.id);
            if (indexModify > -1) {
              processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: process.handleType, ...qtyChange };
            } else {
              processModifyData.push({ id: process.id, handleType: process.handleType, ...qtyChange });
            }
          }
        });


        const partData = commonUtils.isEmptyArr(partDataOld) ? [] : [...partDataOld];
        const partModifyData = commonUtils.isEmptyArr(partModifyDataOld) ? [] : [...partModifyDataOld];
        const materialData = commonUtils.isEmptyArr(materialDataOld) ? [] : [...materialDataOld];
        const materialModifyData = commonUtils.isEmptyArr(materialModifyDataOld) ? [] : [...materialModifyDataOld];

        const slaveLastLevelAllData:any = [];

        // 计算合版信息数据。
        calcMergePart(slaveDataOld, partData, partModifyData);

        //过滤出从表最子级的产品数据。
        slaveDataOld.forEach(data => {
          if (commonUtils.isNotEmptyArr(data.children)) {
            getLastChildData(data.children, slaveLastLevelAllData);
          } else {
            slaveLastLevelAllData.push(data);
          }
        });

        //过滤出部件表最子级的产品数据。
        const partLastLevelAllData:any = [];
        partData.forEach(data => {
          if (commonUtils.isNotEmptyArr(data.children)) {
            getPartLastChildData(data.children, partLastLevelAllData);
          } else { //if (commonUtils.isEmpty(data.mergePartId)) {
            partLastLevelAllData.push(data);
          }
        });

        slaveLastLevelAllData.forEach(slave => {
          const partLastLevelData = partLastLevelAllData.filter(item => item.slaveId === slave.id);
          let currentProcess = { processInQty: slave.productQty, isFirstProcess: true };
          let isFirstInOutRate = false;
          let inOutRate = 1;
          let diffQty = 0;
          partLastLevelData.forEach(part => {
            // 产品工艺数据计算
            slave.allId.split(',').forEach((key, index) => {
              let processSlaveData = processData.filter(item => item.slaveId === key && commonUtils.isEmpty(item.partId));
              processSlaveData = sortData(partData, processSlaveData, 'desc');
              if (index !== 0) {
                inOutRate = commonUtils.isEmptyorZeroDefault(slave.coefficient, 1);
                diffQty = commonUtils.isEmptyorZeroDefault(slave.productQty, 0) + commonUtils.isEmptyorZeroDefault(slave.giveQty, 0) +
                  commonUtils.isEmptyorZeroDefault(slave.stockUpQty, 0) - commonUtils.isEmptyorZeroDefault(part.partQty, 0);
                isFirstInOutRate = true;
              }
              currentProcess = calcProcess(processSlaveData, partData, partModifyData, materialData, materialModifyData,
                processModifyData, processData, currentProcess, isFirstInOutRate, inOutRate, 0, masterDataOld, slave, part, commonModel);
            });

            //部件工艺数据计算
            part.allId.split(',').reverse().forEach(key => {
              // ------- 合并合版数据  ------------------------
              const idPart =  commonUtils.getTreeNodeById(partData, key);
              let mergeProcessData: any = [];
              if (commonUtils.isNotEmpty(idPart.mergePartId)) {
                const mergePart = commonUtils.getTreeNodeById(partData, idPart.mergePartId);
                mergeProcessData = processData.filter(item => item.partId === mergePart.id && item.isMerge);
              }
              let processPartData = processData.filter(item => item.partId === key);
              if (commonUtils.isNotEmptyArr(mergeProcessData)) {
                mergeProcessData.forEach(process => {
                  const index = processPartData.findIndex(item => item.processId === process.processId && item.isMerge);
                  if (index > -1) {
                    processPartData.splice(index, 1);
                  }
                });
                processPartData = processPartData.concat(mergeProcessData);

              }
              // ------------------------------------------------------------
              processPartData = sortData(partData, processPartData, 'desc');

              inOutRate = part.totalPQty > 4 ? part.totalPQty / 2 / commonUtils.isEmptyorZeroDefault(part.singlePQty, 1) :
                commonUtils.isEmptyorZeroDefault(part.singlePQty, 1) / commonUtils.isEmptyorZeroDefault(part.magnification, 1);
              diffQty = commonUtils.isEmptyorZeroDefault(slave.productQty, 0) + commonUtils.isEmptyorZeroDefault(slave.giveQty, 0) +
                commonUtils.isEmptyorZeroDefault(slave.stockUpQty, 0) - commonUtils.isEmptyorZeroDefault(part.partQty, 0);
              isFirstInOutRate = true;
              currentProcess = calcProcess(processPartData, partData, partModifyData, materialData, materialModifyData,
                processModifyData, processData, currentProcess, isFirstInOutRate, inOutRate, diffQty, masterDataOld, slave, part, commonModel);
            });
          });
        });
        if (isWait) {
          return { processData, processModifyData, partData, partModifyData, materialData, materialModifyData };
        } else {
          props.dispatchModifyState({ processData, processModifyData, partData, partModifyData, materialData, materialModifyData });
        }
      } else {
        props.onButtonClick(key, config, e, childParams);
      }
    }

    /**
     *
     * @param processFilterData  过滤的工艺信息数据
     * @param partData           部件数据
     * @param partModifyData     部件修改数据
     * @param materialData       材料数据
     * @param materialModifyData 材料修改数据
     * @param processModifyData  工艺修改数据
     * @param processData        工艺数据
     * @param currentProcess     当前工艺
     * @param isFirstInOutRate   是否出入比转换
     * @param inOutRate          出入比转换率
     * @param masterDataOld      主表数据
     * @param slave              从表数据
     * @param part               部件数据
     * @param commonModel        公共信息
     */
    const calcProcess = (processFilterData, partData, partModifyData, materialData, materialModifyData,
                         processModifyData, processData, currentProcess, isFirstInOutRate, inOutRate, diffQty, masterDataOld, slave, part, commonModel) => {
      let inOutAdjust = 1;
      let printingLossQty = 0;
      let processId = '';
      let isPartAndMaterial = true; // 是否是印前第一次处理。
      let partAndMaterial: any = {};
      let processOutQty = currentProcess.processInQty;
      processFilterData.forEach((process, processIndex) => {
        // 合版时取最大的排版数
        if (processOutQty > process.processOutQty) {
          if (commonUtils.isNotEmpty(currentProcess.id) && !process.isMerge) {
            //更新上道工艺Id
            const index = processData.findIndex(item => item.id === currentProcess.id);
            processData[index] = { ...processData[index], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, priorId: currentProcess.id  };
            if (processData[index].handleType === 'modify') {
              const indexModify = processModifyData.findIndex(item => item.id === process.id);
              if (indexModify > -1) {
                processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: processData[index].handleType, priorId: currentProcess.id };
              } else {
                processModifyData.push({ id: processData[index].id, handleType: processData[index].handleType, priorId: currentProcess.id });
              }
            }
          }
          if (!isFirstInOutRate) {
            inOutRate = commonUtils.isEmptyorZeroDefault(process.inOutAdjustRate, 1);
          } else {
            //手动修改出入比后得出1比
            processFilterData.filter(item => commonUtils.isNotEmptyorZero(item.inOutAdjustRate)).forEach(process => {
              inOutAdjust = inOutAdjust * process.inOutAdjustRate;
            });
            inOutRate = inOutRate / inOutAdjust;
            processOutQty = processOutQty - diffQty;
          }

          if (process.processGenre !== '0prepress') {
            process.processOutQty = processOutQty;
            process.lossQty = commonUtils.isNotEmptyorZero(process.adjustLossQty) ? process.adjustLossQty :
              commonUtils.getFormulaValue('process', process, process.productionLossFormulaId, {
              master: masterDataOld, slave, part, material: {}, process }, commonModel);

            process.inOutRate = inOutRate;
            const processInQty = part.totalPQty > 4 && process.processGenre !== '3product' && commonUtils.isEmptyorZero(process.inOutAdjustRate) ?
              processOutQty * inOutRate + (commonUtils.isEmptyorZero(process.adjustLossQty) ? process.lossQty : process.adjustLossQty) :
              processOutQty / inOutRate + (commonUtils.isEmptyorZero(process.adjustLossQty) ? process.lossQty : process.adjustLossQty);
            process.processInQty = processInQty;
            processOutQty = processInQty;
            processId = process.id;

            if (process.processGenre === '1printing') {
              printingLossQty = printingLossQty + process.lossQty;
            }

            //排程数量公式
            process.processQty = commonUtils.getFormulaValue('process', process, process.scheduleQtyFormulaId, {
              master: masterDataOld, slave, part, material: {}, process }, commonModel);

            //报产数量公式
            process.reportQty = commonUtils.getFormulaValue('process', process, process.reportQtyFormulaId, {
              master: masterDataOld, slave, part, material: {}, process }, commonModel);

          } else {
            if (isPartAndMaterial) {
              partAndMaterial = partAndMaterialCalc(slave, partData, partModifyData, part, materialData, materialModifyData, processFilterData, processId, processOutQty, printingLossQty);
              isPartAndMaterial = false;
            }

            //排程数量公式
            process.processQty = commonUtils.getFormulaValue('process', process, process.scheduleQtyFormulaId, {
              master: masterDataOld, slave, part: partAndMaterial.partDataRow, material: partAndMaterial.materialDataRow, process }, commonModel);

            //报产数量公式
            process.reportQty = commonUtils.getFormulaValue('process', process, process.reportQtyFormulaId, {
              master: masterDataOld, slave, part: partAndMaterial.partDataRow, material: partAndMaterial.materialDataRow, process }, commonModel);

            process.processOutQty = process.processQty;
            process.processInQty = process.processQty;
          }
          process.isLast = currentProcess.isFirstProcess ? true : false;

          process.sortNum = processFilterData.length - processIndex;


          isFirstInOutRate = false;
          currentProcess = { ...process};

          const qtyCalcData = { processOutQty: process.processOutQty, inOutRate: process.inOutRate, processInQty: process.processInQty, processQty: process.processQty,
            reportQty: process.reportQty, sortNum: process.sortNum, isLast: process.isLast };
          let index = processData.findIndex(item => item.id === process.id);

          processData[index] = { ...processData[index], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, ...qtyCalcData };
          if (processData[index].handleType === 'modify') {
            const indexModify = processModifyData.findIndex(item => item.id === process.id);
            if (indexModify > -1) {
              processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: processData[index].handleType, ...qtyCalcData };
            } else {
              processModifyData.push({ id: processData[index].id, handleType: processData[index].handleType, ...qtyCalcData });
            }
          }

          // 更新合版对应的工艺数据。
          index = processData.findIndex(item => item.partId === (item.processGenre === '3product' ? '' : part.id) && item.processId === process.processId);
          processData[index] = { ...processData[index], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, ...qtyCalcData };
          if (processData[index].handleType === 'modify') {
            const indexModify = processModifyData.findIndex(item => item.partId === (item.processGenre === '3product' ? '' : part.id) && item.processId === process.processId);
            if (indexModify > -1) {
              processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: processData[index].handleType, ...qtyCalcData };
            } else {
              processModifyData.push({ id: processData[index].id, handleType: processData[index].handleType, ...qtyCalcData });
            }
          }
        } else if (process.processGenre !== '0prepress') {
          currentProcess = { ...process};
          processOutQty = process.processInQty;
          if (process.processGenre === '1printing') {
            printingLossQty = printingLossQty + process.lossQty;
          }

          // 更新合版对应的工艺数据。
          const qtyCalcData = { processOutQty: process.processOutQty, inOutRate: process.inOutRate, processInQty: process.processInQty, processQty: process.processQty,
            reportQty: process.reportQty, sortNum: process.sortNum, isLast: process.isLast };
          const index = processData.findIndex(item => item.partId === (item.processGenre === '3product' ? '' : part.id) && item.processId === process.processId);
          processData[index] = { ...processData[index], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, ...qtyCalcData };
          if (processData[index].handleType === 'modify') {
            const indexModify = processModifyData.findIndex(item => item.partId === (item.processGenre === '3product' ? '' : part.id) && item.processId === process.processId);
            if (indexModify > -1) {
              processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: processData[index].handleType, ...qtyCalcData };
            } else {
              processModifyData.push({ id: processData[index].id, handleType: processData[index].handleType, ...qtyCalcData });
            }
          }
        }
      });
      if (isPartAndMaterial) {
        partAndMaterialCalc(slave, partData, partModifyData, part, materialData, materialModifyData, processFilterData, processId, processOutQty, printingLossQty);
      }
      sortData(partData, processData);
      return currentProcess;
    }

    const calcMergePart = (slaveData, partData, partModifyData) => {
      const mergePartIds: any = [];
      const mergePartData: any = [];
      partData.forEach(data => {
        if (commonUtils.isNotEmpty(data.mergePartId)) {
          if (mergePartIds.findIndex(item => item === data.mergePartId) > -1) {
            mergePartData.push(data);
          } else {
            const part = commonUtils.getTreeNodeById(partData, data.mergePartId);
            mergePartData.push(part);
            mergePartIds.push(data.mergePartId);
            mergePartData.push(data);
          }
        }
        if (commonUtils.isNotEmptyArr(data.children)) {
          getMergePartChildData(data.children, mergePartIds, mergePartData);
        }
      });
      mergePartIds.forEach(mergePartId => {
        let maxPart;
        let maxQty = 0;
        const mergePartIdData = mergePartData.filter(item => item.id === mergePartId || item.mergePartId === mergePartId);
        mergePartIdData.forEach(part => {
          const slave = commonUtils.getTreeNodeById(slaveData, part.slaveId);
          const qty = commonUtils.isEmptyorZeroDefault(slave.productQty, 0) + commonUtils.isEmptyorZeroDefault(slave.giveQty, 0) +
            commonUtils.isEmptyorZeroDefault(slave.stockUpQty, 0);
          if (qty / commonUtils.isEmptyorZeroDefault(part.mergeSinglePQty, 1) > maxQty) {
            maxQty = qty * commonUtils.isEmptyorZeroDefault(part.totalPQty, 2) / 2 / commonUtils.isEmptyorZeroDefault(part.mergeSinglePQty, 1);
            maxPart = part;
          }
        });
        if (maxPart) {
          mergePartIdData.forEach(part => {
            const partQtyCalcData = { partQty: Math.ceil(maxQty) * maxPart.mergeSinglePQty, singlePQty: maxPart.mergeSinglePQty, totalPQty: maxPart.totalPQty };
            const partDataRow = { ...part, handleType: commonUtils.isEmpty(part.handleType) ? 'modify' : part.handleType, ...partQtyCalcData };
            const returnDataRow = calcPaper(partDataRow);
            props.setTreeNode(partData, { ...partDataRow, ...returnDataRow }, part.allId);
            if (partDataRow.handleType === 'modify') {
              const indexModify = partModifyData.findIndex(item => item.id === partDataRow.id);
              if (indexModify > -1) {
                partModifyData[indexModify] = { ...partModifyData[indexModify], handleType: partDataRow.handleType, ...partQtyCalcData, ...returnDataRow };
              } else {
                partModifyData.push({ id: partDataRow.id, handleType: partDataRow.handleType, ...partQtyCalcData, ...returnDataRow });
              }
            }
          });
        }
      });
    }

    const partAndMaterialCalc = (slave, partData, partModifyData, part, materialData, materialModifyData, processFilterData, processId, processOutQty, printingLossQty) => {
      const partDataRow = props.getTreeNode(partData, part.allId);
      let materialDataRow = {};
      partDataRow.totalPrintingLossQty = printingLossQty;
      partDataRow.totalPostpressLossQty = processOutQty - partDataRow.totalMachineQty - printingLossQty;
      partDataRow.totalLossQty = processOutQty - partDataRow.totalMachineQty;
      partDataRow.totalPaperQty = processOutQty;
      partDataRow.handleType = commonUtils.isEmpty(partDataRow.handleType) ? 'modify' : partDataRow.handleType;
      props.setTreeNode(partData, partDataRow, part.allId);

      const partQtyCalcData = { totalPrintingLossQty: partDataRow.totalPrintingLossQty, totalPostpressLossQty: partDataRow.totalPostpressLossQty,
        totalLossQty: partDataRow.totalLossQty, totalPaperQty: partDataRow.totalPaperQty };
      if (partDataRow.handleType === 'modify') {
        const indexModify = partModifyData.findIndex(item => item.id === partDataRow.id);
        if (indexModify > -1) {
          partModifyData[indexModify] = { ...partModifyData[indexModify], handleType: partDataRow.handleType, ...partQtyCalcData };
        } else {
          partModifyData.push({ id: partDataRow.id, handleType: partDataRow.handleType, ...partQtyCalcData });
        }
      }

      materialData.filter(item => item.partId === part.id).forEach((material, materialIndex) => {
        const index = materialData.findIndex(item => item.id === material.id);
        materialData[index].handleType = commonUtils.isEmpty(materialData[index].handleType) ? 'modify' : materialData[index].handleType;
        materialData[index].materialKQty = getMaterialKQty(part.machineLength, part.machineWidth, materialData[index].materialStyle, materialData[index].materialKQty);
        if (commonUtils.isNotEmpty(material.printToMeasureFormulaId)) {
          materialData[index].measureQty = Math.ceil(commonUtils.getFormulaValue('material', process, material.printToMeasureFormulaId, {
            master: props.masterData, slave, part, material, process }, props.commonModel) / commonUtils.isEmptyorZeroDefault(materialData[index].materialKQty, 1));
        } else if (commonUtils.isEmpty(material.adjustProcessId)) {
          materialData[index].measureQty = Math.ceil(processOutQty / commonUtils.isEmptyorZeroDefault(materialData[index].materialKQty, 1));
          materialData[index].processId = processId;
        } else {
          const processIndex = processFilterData.findIndex(item => item.processId === material.adjustProcessId);
          if (processIndex > -1) {
            materialData[index].measureQty = Math.ceil(processFilterData[processIndex].processInQty / commonUtils.isEmptyorZeroDefault(materialData[index].materialKQty, 1));
          }
        }
        const qtyCalcData = commonUtils.getMeasureQtyToQtyCalc(props.commonModel, {...materialData[index]},'material', 'measureQty', 'materialQty', 'measureToMaterialFormulaId', 'measureToMaterialCoefficient');
        const materialCalcData = { processId, measureQty: materialData[index].measureQty, ...qtyCalcData };
        materialData[index] = { ...materialData[index], ...materialCalcData };
        if (materialIndex === 0 && material.materialGenre === '0main') {
          materialDataRow = materialData[index];
        }

        if (materialData[index].handleType === 'modify') {
          const indexModify = materialModifyData.findIndex(item => item.id === material.id);
          if (indexModify > -1) {
            materialModifyData[indexModify] = { ...materialModifyData[indexModify], handleType: materialData[index].handleType, ...materialCalcData };
          } else {
            materialModifyData.push({ id: materialData[index].id, handleType: materialData[index].handleType, ...materialCalcData });
          }
        }
      });

      return { partDataRow, materialDataRow };
    }

    const getMaterialKQty = (machineLengthOld, machineWidthOld, materialStyle, materialKQty) => {
      const machineLength = machineLengthOld > machineWidthOld ? machineLengthOld : machineWidthOld;
      const machineWidth = machineLengthOld > machineWidthOld ? machineWidthOld : machineLengthOld;
      if (commonUtils.isNotEmpty(materialStyle) && materialStyle.split('*').length === 2) {
        const materialWidthOld = materialStyle.split('*')[0];
        const materialLengthOld = materialStyle.split('*')[1];
        const materialLength = materialLengthOld > materialWidthOld ? materialLengthOld : materialWidthOld;
        const materialWidth = materialLengthOld > materialWidthOld ? materialWidthOld : materialLengthOld;
        if (materialLength > 0 && materialWidth > 0 && machineLength > 0 && machineWidth > 0) {
          const qty1 = Math.floor(materialLength / machineLength) * Math.floor(materialWidth / machineWidth);
          let blend1 = 0;
          if (materialLength - Math.floor(materialLength / machineLength) * machineLength >= machineWidth) {
            blend1 = Math.floor((materialLength - Math.floor(materialLength / machineLength) * machineLength) / machineWidth) * Math.floor(materialWidth / machineLength);
          }

          const qty2 = Math.floor(materialWidth / machineLength) * Math.floor(materialLength / machineWidth);
          let blend2 = 0;
          if (materialWidth - Math.floor(materialWidth / machineLength) * materialWidth >= machineWidth) {
            blend2 = Math.floor((materialWidth - Math.floor(materialWidth / machineLength) * machineLength) / machineWidth) * Math.floor(materialLength / machineLength);
          }
          return (qty1 + blend1) > (qty2 + blend2) ? (qty1 + blend1) : (qty2 + blend2);
        } else {
          return materialKQty;
        }
      }
      return materialKQty;
    }

    const getButtonGroup = () => {
      const buttonAddGroup: any = props.getButtonGroup();
      buttonAddGroup.push({ key: 'copyFromButton', caption: '复制从', htmlType: 'button', onClick: onButtonClick, sortNum: 121, disabled: !props.enabled });
      buttonAddGroup.push({ key: 'calcButton', caption: '计算', htmlType: 'button', onClick: onButtonClick, sortNum: 141, disabled: !props.enabled });
      return buttonAddGroup;
    }

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
        onLastColumnClick={onLastColumnClick}
        sortData={sortData}
        onTableAddClick={onTableAddClick}
        onModalOk={onModalOk}
        onRowClick={onRowClick}
        onButtonClick={onButtonClick}
        getButtonGroup={getButtonGroup}
      />
    </div>
  };
};

export default commonProductionEvent;






