import React, {useEffect} from 'react';
import {Tabs} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import {routeInfo} from "./routeInfo";

const { TabPane } = Tabs;
const TabsPages = (props) => {

  useEffect(() => {
    const {commonModel, dispatchModifyState} = props;
    const panesComponents: any = [];
    commonModel.panes.forEach(pane => {
      const route: any = commonUtils.getRouteComponent(routeInfo, pane.route);
      if (commonUtils.isNotEmptyObj(route)) {
        panesComponents.push(commonUtils.panesComponent(pane, route));
      }
    });
    dispatchModifyState({ panesComponents });
  }, []);

  const onChange = activeKey => {
    const { dispatch, commonModel } = props;
    const index = commonModel.panes.findIndex(item => item.key === activeKey);
    if (index > -1) {
      const activePane = panes[index];
      dispatch({
        type: 'commonModel/saveActivePane',
        payload: activePane,
      });
    }
  };

  const onRemove = targetKey => {
    const { dispatch, commonModel, panesComponents: panesComponentsOld, dispatchModifyState } = props;
    let lastIndex = -1;
    commonModel.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesComponents = panesComponentsOld.filter(pane => pane.key.toString() !== targetKey);
    const panes = commonModel.panes.filter(pane => pane.key.toString() !== targetKey);
    let activePane = {};
    if (panes.length && commonModel.activePane.key === targetKey) {
      if (lastIndex > -1) {
        activePane = panes[lastIndex];
      } else {
        activePane = panes[0];
      }
    }
    dispatch({
      type: 'commonModel/saveActivePane',
      payload: activePane,
    });
    dispatch({
      type: 'commonModel/savePanes',
      payload: panes,
    });
    dispatchModifyState({ panesComponents });
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      onRemove(targetKey);
    }
  };
  const tabPane= (pane) => {
    const { panesComponents: panesComponentsOld } = props;
    const panesComponents = commonUtils.isEmptyArr(panesComponentsOld) ? [] : panesComponentsOld;
    const iComponentIndex = panesComponents.findIndex(item => item.key === pane.key);
    if (iComponentIndex > -1) {
      return(<TabPane tab={pane.title} key={pane.key}>
        {panesComponents[iComponentIndex].component}
      </TabPane>)
    }
  };

  const panes = props.commonModel.panes;
  return (
    <Tabs hideAdd type="editable-card" animated activeKey={props.commonModel.activePane.key} onEdit={onEdit} onChange={onChange}>
      { panes.map(pane => tabPane(pane)) }
    </Tabs>
  );
}

export default TabsPages;