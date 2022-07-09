import {TableComponent} from "../../components/TableComponent";
import React, {useEffect, useRef } from "react";
import * as commonUtils from "../../utils/commonUtils";
import {connect} from "react-redux";
import commonBase from "../../common/commonBase";
import { Checkbox } from 'antd';


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
  return (
    <div>
      {props.slaveContainer ? <TableComponent {...tableParam} /> : ''}
      {props.levelContainer ? <TableComponent {...levelParam} /> : ''}
    </div>
  );
}
export default connect(commonUtils.mapStateToProps)(commonBase(ExamineCondition));