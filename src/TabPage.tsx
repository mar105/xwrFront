import React, {useEffect} from 'react';
import {Tabs} from 'antd';
import * as commonUtils from "./utils/commonUtils";
import * as application from "./application";
import {routeInfo} from "./routeInfo";
import * as routeInfoBasic from "./xwrBasic/routeInfo";

const { TabPane } = Tabs;
const TabPage = (props) => {

  useEffect(() => {
    const {dispatchModifyState} = props;
    const panes = JSON.parse(localStorage.getItem(`${application.prefix}panes`) || '[]');
    const panesComponents: any = [];
    panes.forEach(pane => {
      const iIndex = routeInfo.findIndex(item => item.path === pane.route);
      if (iIndex > -1) {
        panesComponents.push(commonUtils.panesComponent(pane, routeInfo[iIndex]));
      }
    });

    console.log('TabPage', panes);
    panes.forEach(pane => {
      const iIndex = routeInfoBasic.routeInfo.findIndex(item => item.path === pane.route);
      if (iIndex > -1) {
        console.log('TabPage', panes);
        panesComponents.push(commonUtils.panesComponent(pane, routeInfoBasic.routeInfo[iIndex]));
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
    let iIndex = routeInfo.findIndex(item => item.path === pane.route);
    if (iIndex > -1) {
      const iComponentIndex = panesComponents.findIndex(item => item.key === pane.key);
      if (iComponentIndex > -1) {
        return(<TabPane tab={pane.title} key={pane.key}>
          {panesComponents[iComponentIndex].component}
        </TabPane>)
      }
    }

    iIndex = routeInfoBasic.routeInfo.findIndex(item => item.path === pane.route);
    if (iIndex > -1) {
      const iComponentIndex = panesComponents.findIndex(item => item.key === pane.key);
      if (iComponentIndex > -1) {
        return(<TabPane tab={pane.title} key={pane.key}>
          {panesComponents[iComponentIndex].component}
        </TabPane>)
      }
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