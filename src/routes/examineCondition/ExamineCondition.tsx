import {TableComponent} from "../../components/TableComponent";
import React, {useEffect, useRef } from "react";
import * as commonUtils from "../../utils/commonUtils";
import {connect} from "react-redux";
import commonBase from "../../common/commonBase";
import { Checkbox } from 'antd';
import {ButtonGroup} from "../../common/ButtonGroup";


const ExamineCondition = (props) => {
  const propsRef: any = useRef();
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const name = 'slave';

  const onChange = (levelId, selectedKeys) => {
    const { levelData: levelDataOld } = propsRef.current;
    const levelData = commonUtils.isEmptyArr(levelDataOld) ? [] : [...levelDataOld];
    const index = levelData.findIndex(item => item.id === levelId);
    levelData[index] = {...levelData[index], userSelectedKeys: [...selectedKeys]};
    props.dispatchModifyState({ levelData });
  };

  const onButtonClick = async (key, config, e) => {
    if (key === 'selectButton') {
      const { dispatch, levelData, slaveData } = propsRef.current;
      for(const level of levelData) {
        if (level.userSelectedKeys.length < level.examineCount) {
          props.gotoError(dispatch, {code: '6001', msg: commonUtils.getViewName(slaveContainer, 'sendPersonCountNotLessThan')});
          return;
        }
      }
      props.callbackRemovePane({ type: 'examineFlow', levelData, slaveData });
    } else if (key === 'cancelButton') {
      props.callbackRemovePane();
    }
  }

  const getButtonGroup = () => {
    const buttonGroup: any = [];
    buttonGroup.push({ key: 'selectButton', caption: '发送', htmlType: 'button', sortNum: 10, disabled: props.enabled });
    buttonGroup.push({ key: 'cancelButton', caption: '取消', htmlType: 'button', sortNum: 50, disabled: props.enabled });
    return buttonGroup;
  }


  const tableParam: any = commonUtils.getTableProps(name, props);
  tableParam.isDragRow = true;
  tableParam.width = 1000;
  tableParam.isLastColumn = false;

  const levelParam: any = commonUtils.getTableProps('level', props);
  levelParam.isDragRow = true;
  levelParam.width = 1000;
  levelParam.isLastColumn = false;
  levelParam.lastColumn = { changeValue: commonUtils.newId() };

  const userIndex = commonUtils.isEmpty(levelParam.property.columns) ? -1 : levelParam.property.columns.findIndex(item => item.dataIndex === 'user');
  if (userIndex > -1) {
    levelParam.property.columns[userIndex].isRender = true;
    levelParam.property.columns[userIndex].render = (text, record, index) => {
      if (commonUtils.isNotEmptyArr(record.userList)) {
        const options: any = [];
        record.userList.forEach(user => {
          options.push({ label: user.userAbbr, value: user.examineUserId });
        });
        return <Checkbox.Group options={options} value={record.userSelectedKeys} onChange={onChange.bind(this, record.id)}/>
      }
    }
  }

  const { commonModel, enabled, slaveContainer } = props;
  const buttonGroup = { userInfo: commonModel.userInfo, token: commonModel.token, routeId: props.routeId, groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId,
    onClick: onButtonClick, enabled, permissionEntityData: props.permissionEntityData, permissionData: props.permissionData, container: slaveContainer, buttonGroup: getButtonGroup(), isModal: props.isModal, modalType: 'select',
    onUploadSuccess: props.onUploadSuccess, dispatchModifyState: props.dispatchModifyState };
  return (
    <div>
      {props.slaveContainer ? <TableComponent {...tableParam} /> : ''}
      {props.levelContainer ? <TableComponent {...levelParam} /> : ''}
      <ButtonGroup {...buttonGroup} />
    </div>
  );
}
export default connect(commonUtils.mapStateToProps)(commonBase(ExamineCondition));