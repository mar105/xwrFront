import {connect} from "react-redux";
import * as commonUtils from "../../../utils/commonUtils";
import commonBase from "../../../common/commonBase";
import React from "react";
import {TableComponent} from "../../../components/TableComponent";
import {ButtonGroup} from "../ButtonGroup";
import commonListEvent from "../../../common/commonListEvent";

const CommonList = (props) => {

  const onClick = (key, e) => {

  }
  const { enabled } = props;
  const buttonGroup = { onClick, enabled };
  const tableParam: any = commonUtils.getTableProps('slave', props);
  tableParam.enabled = false;
  return (
    <div>
      {props.slaveContainer ? <TableComponent {...tableParam} /> : ''}
      <ButtonGroup {...buttonGroup} />
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(commonListEvent(CommonList)));