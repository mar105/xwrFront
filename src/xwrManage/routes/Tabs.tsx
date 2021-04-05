import React from 'react';
import { TabComponent } from '../../components/TabComponent';
import * as commonUtils from "../../utils/commonUtils";

const Tabs = (props) => {

  const onChange = activeKey => {
    const {dispatchModifyState} = props;
    dispatchModifyState({ activeKey });
  };

  const onRemove = targetKey => {
    let { activeKey } = props;
    const { panes: panesOld, dispatchModifyState } = props;
    let lastIndex = -1;
    panesOld.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panes = panesOld.filter(pane => pane.key.toString() !== targetKey);
    if (panes.length && activeKey === targetKey) {
      if (lastIndex > -1) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    dispatchModifyState({ panes, activeKey });
  };

  const onEdit = (targetKey, action) => {
    console.log('aaaaa', action);
    onRemove(targetKey);
  };

  const tabs = {
    panes: commonUtils.isEmptyArr(props.panes) ? [] : props.panes,
    event: { onEdit, onChange },
  };
  return (
    <TabComponent {...tabs} />
  );
}

export default Tabs;