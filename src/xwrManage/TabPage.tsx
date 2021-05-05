import React, {useEffect} from 'react';
import {Tabs} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import * as application from "./application";
import {routeInfo} from "./routeInfo";

const { TabPane } = Tabs;
const TabPage = (props) => {

  useEffect(() => {
    const {dispatchModifyState} = props;
    const panes = JSON.parse(localStorage.getItem(`${application.prefix}panes`) || '[]');
    const panesComponents: any = [];
    panes.forEach(pane => {
      const route: any = commonUtils.getRouteComponent(routeInfo, pane.route);
      if (commonUtils.isNotEmptyObj(route)) {
        panesComponents.push(commonUtils.panesComponent(pane, route));
      }
    });
    dispatchModifyState({ panes, panesComponents });
  }, []);
  const onChange = activeKey => {
    const {dispatchModifyState} = props;
    dispatchModifyState({ activeKey });
  };

  const onRemove = targetKey => {
    const { activeKey: activeKeyOld, panes: panesOld, panesComponents: panesComponentsOld, dispatchModifyState } = props;
    let lastIndex = -1;
    panesOld.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesComponents = panesComponentsOld.filter(pane => pane.key.toString() !== targetKey);
    const panes = panesOld.filter(pane => pane.key.toString() !== targetKey);
    let activeKey = '';
    if (panes.length && activeKeyOld === targetKey) {
      if (lastIndex > -1) {
        activeKey = panes[lastIndex].key;
      } else {
        activeKey = panes[0].key;
      }
    }
    localStorage.setItem(`${application.prefix}panes`, JSON.stringify(panes));
    dispatchModifyState({ panes, panesComponents, activeKey });
  };

  const onEdit = (targetKey, action) => {
    if (action === 'remove') {
      onRemove(targetKey);
    }
  };
  const tabPane= (pane) => {
    const { panesComponents } = props;
    const iComponentIndex = panesComponents.findIndex(item => item.key === pane.key);
    if (iComponentIndex > -1) {
      return(<TabPane tab={pane.title} key={pane.key}>
        {panesComponents[iComponentIndex].component}
      </TabPane>)
    }
  };

  const panes = commonUtils.isEmptyArr(props.panes) ? [] : props.panes;
  return (
    <Tabs hideAdd type="editable-card" activeKey={props.activeKey} onEdit={onEdit} onChange={onChange}>
      { panes.map(pane => tabPane(pane)) }
    </Tabs>
  );
}

export default TabPage;