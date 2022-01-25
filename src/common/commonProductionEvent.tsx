import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../xwrProduction/application";
import * as request from "../utils/request";
import {isNotEmptyArr} from "../utils/commonUtils";

const commonProductionEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);

    const calcPaper = (params) => {
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

        if (dataRow.handleType === 'modify') {
          const indexModify = returnData[name + 'ModifyData'].findIndex(item => item.id === record.id);
          if (indexModify > -1) {  // returnData如果有修改indexModify 一定 > -1
            returnData[name + 'ModifyData'][indexModify] = { ...returnData[name + 'ModifyData'][indexModify],
              plateQty: dataRow.plateQty,
              splitQty: dataRow.splitQty,
              totalPlateQty: dataRow.totalPlateQty,
              machineQty: dataRow.machineQty,
              totalMachineQty: dataRow.totalMachineQty
            };
          }
        }
      }
      if (container.isTree) {
        props.setTreeNode(returnData[name + 'Data'], dataRow, record.allId);
      } else {
        const index = returnData[name + 'Data'].findIndex(item => item.id === record.id);
        if (index > -1) {
          returnData[name + 'Data'][index] = dataRow;
        }
      }
      return returnData;
    };

    const modifyFieldData = (name, dataOld, dataModifyOld, modifyFieldName, modifyValue) => {
      const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];

      const data: any = [];
      dataOld.forEach(dataRowOld => {
        const dataRow: any = {...dataRowOld, handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType, [modifyFieldName]: modifyValue };
        data.push(dataRow);
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
      const { name, fieldName, record, isWait } = params;
      const { partData: partDataOld, partModifyData: partModifyDataOld,
        materialData: materialDataOld, materialModifyData: materialModifyDataOld,
        processData: processDataOld, processModifyData: processModifyDataOld } = propsRef.current;
      let returnData = props.onDataChange({...params, isWait: true});
      if(name === 'slave') {
        if (fieldName === 'productName') {
          returnData = {...returnData, ...modifyFieldData('part', partDataOld, partModifyDataOld, 'productName', returnData.dataRow.productName) };
          returnData = {...returnData, ...modifyFieldData('material', materialDataOld, materialModifyDataOld, 'productName', returnData.dataRow.productName) };
          returnData = {...returnData, ...modifyFieldData('process', processDataOld, processModifyDataOld, 'productName', returnData.dataRow.productName) };
        }
      } else if(name === 'part') {
        //在方法内部判断了哪些字段需要计算
        returnData = calcPaper({name, fieldName, record, returnData});
        if (fieldName === 'partName') {
          returnData = {...returnData, ...modifyFieldData('material', materialDataOld, materialModifyDataOld, 'partName', returnData.dataRow.partName) };
          returnData = {...returnData, ...modifyFieldData('process', processDataOld, processModifyDataOld, 'partName', returnData.dataRow.partName) };
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
        } else if (isNotEmptyArr(treeData[index].children)) {
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
        } else if (isNotEmptyArr(treeData[index].children)) {
          returnInfo = getTreeChildIndexAndInfo(treeData[index].children, id);
        }
      }
      return returnInfo;
    }

    const sortData = (partData, processData, sort = 'asc') => {
      processData.sort((row1, row2) => {
        const partDataRowInfo1 = getTreeIndexAndInfo(partData, row1.partId);
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

        const partDataRowInfo2 = getTreeIndexAndInfo(partData, row2.partId);
        const indexSort2 = partDataRowInfo2.index;
        const level2 = partDataRowInfo2.index === 999 ? '9' : partDataRowInfo2.dataRow.allId.split(',').length.toString();
        let partSort2 = `0000${indexSort2}`;
        partSort2 = partSort2.substring(partSort2.length - 3);
        let processSort2 = '0000' + row2.sortNum.toFixed(2);
        processSort2 = processSort2.substring(processSort2.length - 5);
        return sort === 'asc' ?
          parseFloat(level1 + partSort1 + row1.processGenre.substring(0, 1) + processSort1) - parseFloat(level2 + partSort2 + row2.processGenre.substring(0, 1) + processSort2) :
          parseFloat(level2 + partSort2 + row2.processGenre.substring(0, 1) + processSort2) - parseFloat(level1 + partSort1 + row1.processGenre.substring(0, 1) + processSort1);
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
      const { dispatch, slaveSelectedRowKeys, slaveData, partSelectedRowKeys, partData, processContainer }: any = propsRef.current;
      const returnData = props.onTableAddClick(name, e, true);
      const addState = { ...returnData };
      if (name === 'part' || name === 'material' || name === 'process') {
        if (name === 'part') {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.constantData[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.data.id);
          const slaveIndex = slaveData.findIndex(item => item.id === slaveSelectedRowKeys[0]);
          returnData[name + 'Data'][index].slaveId = slaveData[slaveIndex].id;
          returnData[name + 'Data'][index].partQty = slaveData[slaveIndex].productQty;
          returnData[name + 'Data'][index].productName = slaveData[slaveIndex].productName;
          addState[name + 'SelectedRowKeys'] = [returnData.data.id];
          addState[name + 'SelectedRows'] = [{...returnData.data}];
        } else if (name === 'material') {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.constantData[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.data.id);
          const slaveIndex = slaveData.findIndex(item => item.id === slaveSelectedRowKeys[0]);
          const partIndex = partData.findIndex(item => item.id === partSelectedRowKeys[0]);
          returnData[name + 'Data'][index].slaveId = slaveData[slaveIndex].id;
          returnData[name + 'Data'][index].productName = slaveData[slaveIndex].productName;

          if (commonUtils.isEmptyArr(partSelectedRowKeys)) {
            returnData[name + 'Data'][index].partId = '';
            returnData[name + 'Data'][index].materialGenre = '2product';
          } else {
            returnData[name + 'Data'][index].partName = partData[partIndex].partName;
            returnData[name + 'Data'][index].partId = partData[partIndex].id;
            returnData[name + 'Data'][index].materialGenre = '0main';
          }
        } else if (name === 'process') {
          if (commonUtils.isEmptyArr(slaveSelectedRowKeys)) {
            const index = props.constantData.filter(item => item.constantName === 'pleaseChooseSlave');
            if (index > -1) {
              props.gotoError(dispatch, {code: '6001', msg: props.constantData[index].viewName});
            } else {
              props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
            }
            return;
          }
          let config = {};
          if (commonUtils.isNotEmptyArr(partSelectedRowKeys)) {
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
      dispatchModifyState({ [name + 'SelectedRowKeys']: [record[rowKey]], [name + 'SelectedRows']: [record] });
    }

    const onModalOk = async (params, isWait) => {
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
            dataRow = rowData;
            data.push(rowData);
          }

          processMatch.filter(item => item.superiorId === dataRow.processId).forEach(matchItem => {
            const assignValue = commonUtils.getAssignFieldValue(name, assignField, matchItem, propsRef.current);
            const rowData = { ...props.onAdd(container), ...assignValue, superiorId: masterData.id };
            rowData.partId = rowData.processGenre === '3product' ? '' : rowData.partId;
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
        if (isNotEmptyArr(data.children)) {
          getLastChildData(data.children, lastLevelData);
        } else {
          lastLevelData.push(data);
        }
      });
    }

    const getPartLastChildData = (treeData, lastLevelData) => {
      treeData.forEach(data => {
        if (isNotEmptyArr(data.children)) {
          getPartLastChildData(data.children, lastLevelData);
        } else if (commonUtils.isNotEmpty(data.mergePartId)) {
          lastLevelData.push(data);
        }
      });
    }

    const onButtonClick = async (key, config, e, childParams: any = undefined, isWait = false) => {
      const { commonModel, masterData: masterDataOld, slaveData: slaveDataOld, partData: partDataOld, materialData: materialDataOld,
        processData: processDataOld, processModifyData: processModifyDataOld } = propsRef.current;

      if (key === 'calcButton') {
        const processData = [...processDataOld];
        const processModifyData = commonUtils.isEmptyArr(processModifyDataOld) ? [] : [...processModifyDataOld];

        const slaveLastLevelAllData:any = [];

        //过滤出从表最子级的产品数据。
        slaveDataOld.forEach(data => {
          if (isNotEmptyArr(data.children)) {
            getLastChildData(data.children, slaveLastLevelAllData);
          } else {
            slaveLastLevelAllData.push(data);
          }
        });

        //过滤出部件表最子级的产品数据。
        const partLastLevelAllData:any = [];
        partDataOld.forEach(data => {
          if (isNotEmptyArr(data.children)) {
            getPartLastChildData(data.children, partLastLevelAllData);
          } else if (commonUtils.isEmpty(data.mergePartId)) {
            partLastLevelAllData.push(data);
          }
        });


        slaveLastLevelAllData.forEach(slave => {
          const partLastLevelData = partLastLevelAllData.filter(item => item.slaveId === slave.id);
          let processOutQty = slave.productQty;
          let isFirst = false;
          let inOutRate = 1;
          partLastLevelData.forEach(part => {
            slave.allId.split(',').forEach((key, index) => {
              let processSlaveData = processDataOld.filter(item => item.slaveId === key && commonUtils.isEmpty(item.partId));
              processSlaveData = sortData(partDataOld, processSlaveData, 'desc');
              if (index !== 0) {
                inOutRate = commonUtils.isEmptyorZeroDefault(slave.coefficient, 1);
                isFirst = true;
              }
              calcProcess(processSlaveData, partDataOld, processModifyData, processData, processOutQty, isFirst, inOutRate, masterDataOld, slave, part, commonModel);
            });

            part.allId.split(',').reverse().forEach(key => {
              let processPartData = processDataOld.filter(item => item.partId === key);
              processPartData = sortData(partDataOld, processPartData, 'desc');
              inOutRate = part.totalPQty > 4 ? part.totalPQty / 2 / commonUtils.isEmptyorZeroDefault(part.singlePQty, 1) :
                commonUtils.isEmptyorZeroDefault(part.singlePQty, 1);
              isFirst = true;
              calcProcess(processPartData, partDataOld, processModifyData, processData, processOutQty, isFirst, inOutRate, masterDataOld, slave, part, commonModel);
            });
          });
        });
        if (isWait) {
          return { processData, processModifyData };
        } else {
          props.dispatchModifyState({ processData, processModifyData });
        }
      } else {
        props.onButtonClick(key, config, e, childParams);
      }
    }

    const calcProcess = (processFilterData, partDataOld, processModifyData, processData, processOutQty, isFirst, inOutRate, masterDataOld, slave, part, commonModel) => {
      processFilterData.forEach((process, processIndex) => {
        if (!isFirst) {
          inOutRate = commonUtils.isEmptyorZeroDefault(process.inOutAdjustRate, 1);
        }
        process.processOutQty = processOutQty;
        if (commonUtils.isEmptyorZero(process.adjustLossQty)) {
          process.lossQty = commonUtils.getFormulaValue('process', process, process.productionLossFormulaId, {
            master: masterDataOld, slave, part, material: {}, process }, commonModel);
        }
        process.inOutRate = inOutRate;
        const processInQty = part.totalPQty > 4 && process.processGenre !== '3product' && commonUtils.isEmptyorZero(process.inOutAdjustRate) ?
          processOutQty * inOutRate + (commonUtils.isEmptyorZero(process.adjustLossQty) ? process.lossQty : process.adjustLossQty) :
          processOutQty / inOutRate + (commonUtils.isEmptyorZero(process.adjustLossQty) ? process.lossQty : process.adjustLossQty);
        process.processInQty = processInQty;

        //排程数量公式
        process.processQty = commonUtils.getFormulaValue('process', process, process.scheduleQtyFormulaId, {
          master: masterDataOld, slave, part, material: {}, process }, commonModel);

        //报产数量公式
        process.reportQty = commonUtils.getFormulaValue('process', process, process.reportQtyFormulaId, {
          master: masterDataOld, slave, part, material: {}, process }, commonModel);

        process.sortNum = processFilterData.length - processIndex;
        processOutQty = processInQty;
        isFirst = false;

        sortData(partDataOld, processData);
        const qtyCalcData = { processOutQty: process.processOutQty, inOutRate: process.inOutRate, processInQty: process.processInQty, processQty: process.processQty,
          reportQty: process.reportQty, sortNum: process.sortNum };
        const index = processData.findIndex(item => item.id === process.id);
        processData[index] = { ...processData[index], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, ...qtyCalcData };
        if (processData[index].handleType === 'modify') {
          const indexModify = processModifyData.findIndex(item => item.id === process.id);
          if (indexModify > -1) {
            processModifyData[indexModify] = { ...processModifyData[indexModify], handleType: commonUtils.isEmpty(processData[index].handleType) ? 'modify' : processData[index].handleType, ...qtyCalcData };
          } else {
            processModifyData.push({ id: processData[index].id, handleType: processData[index].handleType, ...qtyCalcData });
          }
        }
      });
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
      />
    </div>
  };
};

export default commonProductionEvent;






