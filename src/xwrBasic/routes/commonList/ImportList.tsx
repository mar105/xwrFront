import React from "react";
import {TableComponent} from "../../../components/TableComponent";
import * as commonUtils from "../../../utils/commonUtils";

const ImportList = (props) => {
  const tableParam: any = commonUtils.getTableProps('import', props);
  tableParam.enabled = true;
  tableParam.pagination = false;
  tableParam.lastTitle = undefined;
  return (
    <div>
      <TableComponent {...tableParam} />
    </div>

  );
}

export default ImportList;