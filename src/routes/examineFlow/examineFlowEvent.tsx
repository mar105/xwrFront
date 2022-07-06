import * as React from "react";
import {useRef, useEffect} from "react";
import * as commonUtils from "../../utils/commonUtils";

const commonProductionEvent = (WrapComponent) => {
  return function ChildComponent(props) {
    const propsRef: any = useRef();
    useEffect(() => {
      propsRef.current = props;
    }, [props]);



    const modifyFieldData = (name, dataOld, dataModifyOld, filterFieldName, filterValue, modifyFieldName, modifyValue) => {
      const { [name + 'Container']: container} = propsRef.current;
      const dataModify = commonUtils.isEmptyArr(dataModifyOld) ? [] : [...dataModifyOld];

      const data: any = [...dataOld];
      data.filter(item => item[filterFieldName] === filterValue).forEach(dataRowOld => {
        const dataRow: any = {...dataRowOld, handleType: commonUtils.isEmpty(dataRowOld.handleType) ? 'modify' : dataRowOld.handleType, [modifyFieldName]: modifyValue };
        if (container.isTree) {
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
      const { name, fieldName, isWait } = params;
      const { userData: userDataOld, userModifyData: userModifyDataOld,
        formulaData: formulaDataOld, formulaModifyData: formulaModifyDataOld } = propsRef.current;

      // 开始修改数据
      let returnData = props.onDataChange({...params, isWait: true});
      if(name === 'level') {
        if (fieldName === 'examineLevel') {
          returnData = {...returnData, ...modifyFieldData('user', userDataOld, userModifyDataOld, 'examineLevelId', returnData.dataRow.id, 'examineLevel', returnData.dataRow.examineLevel) };
          returnData = {...returnData, ...modifyFieldData('formula', formulaDataOld, formulaModifyDataOld, 'examineLevelId', returnData.dataRow.id,'examineLevel', returnData.dataRow.examineLevel) };
        }
      }

      if (isWait) {
        return { ...returnData };
      } else {
        props.dispatchModifyState({ ...returnData });
      }
    }

    const onLastColumnClick = async (name, key, record, e, isWait = false) => {
      let addState: any = {};
      if (name === 'level') {
        if (key === 'delButton') {
          //用户
          addState = { ...addState, ...await props.delTableData('user', 'examineLevelId', record.id) };

          //公式
          addState = { ...addState, ...await props.delTableData('formula', 'examineLevelId', record.id) };
        }
      }
      const returnData = await props.onLastColumnClick(name, key, record, e, true);
      if (isWait) {
        return { ...returnData, ...addState  };
      } else {
        props.dispatchModifyState({ ...returnData, ...addState });
      }
    }

    const onTableAddClick = (name, e, isWait = false) => {
      const { dispatch, levelSelectedRows, levelData }: any = propsRef.current;
      const returnData = props.onTableAddClick(name, e, true);
      const addState = { ...returnData };
      if (name === 'user' || name === 'formula') {
        if (commonUtils.isEmptyArr(levelSelectedRows)) {
          const index = props.commonModel.commonConstant.findIndex(item => item.constantName === 'pleaseChooseSlave');
          if (index > -1) {
            props.gotoError(dispatch, {code: '6001', msg: props.commonModel.commonConstant[index].viewName});
          } else {
            props.gotoError(dispatch, {code: '6001', msg: '请选择从表！'});
          }
          return;
        }
        const index = returnData[name + 'Data'].findIndex(item => item.id === returnData.dataRow.id);
        const slave = props.getTreeNode(levelData, levelSelectedRows[0].allId);
        returnData[name + 'Data'][index].examineLevelId = slave.id;
        returnData[name + 'Data'][index].examineLevel = slave.examineLevel;

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
      if (name === 'level') {
        addState.userSelectedRowKeys = [];
        addState.formulaSelectedRows = [];
      }
      dispatchModifyState({ [name + 'SelectedRowKeys']: [record[rowKey]], [name + 'SelectedRows']: [record], ...addState });
    }

    const onButtonClick = async (key, config, e, childParams: any = undefined) => {
      if (key === 'delButton') {
        const { levelData, levelModifyData, levelDelData, userData, userModifyData, userDelData, formulaData, formulaModifyData, formulaDelData } = props;
        const childCallback = (params) => {
          const saveData: any = [];
          saveData.push(commonUtils.mergeData('level', levelData, levelModifyData, levelDelData, false));
          saveData.push(commonUtils.mergeData('user', userData, userModifyData, userDelData, false));
          saveData.push(commonUtils.mergeData('formula', formulaData, formulaModifyData, formulaDelData, false));
          return saveData;
        }
        props.onButtonClick(key, config, e, { childCallback });
      } else {
        props.onButtonClick(key, config, e, childParams);
      }
    }

    return <div>
      <WrapComponent
        {...props}
        onDataChange={onDataChange}
        onLastColumnClick={onLastColumnClick}
        onTableAddClick={onTableAddClick}
        onRowClick={onRowClick}
        onButtonClick={onButtonClick}
      />
    </div>
  };
};

export default commonProductionEvent;






