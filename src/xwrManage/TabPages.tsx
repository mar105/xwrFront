import React, {useEffect} from 'react';
import {Tabs} from 'antd';
import * as commonUtils from "../utils/commonUtils";
import {routeInfo} from "./routeInfo";
import { DndProvider, DragSource, DropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const { TabPane } = Tabs;

const TabNode = (props) => {
  const { connectDragSource, connectDropTarget, children } = props;
  return connectDragSource(connectDropTarget(children));
}

const cardTarget = {
  drop(props, monitor) {
    const dragKey = monitor.getItem().index;
    const hoverKey = props.index;

    if (dragKey === hoverKey) {
      return;
    }

    props.moveTabNode(dragKey, hoverKey);
    monitor.getItem().index = hoverKey;
  },
};

const cardSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
    };
  },
};

const WrapTabNode = DropTarget('DND_NODE', cardTarget, connect => ({
  connectDropTarget: connect.dropTarget(),
}))(
  DragSource('DND_NODE', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))(TabNode),
);

const TabsPages = (props) => {

  useEffect(() => {
    const {commonModel, dispatchModifyState} = props;
    const panesComponents: any = [];
    commonModel.panes.forEach(pane => {
      const route: any = commonUtils.getRouteComponent(routeInfo, pane.route);
      if (commonUtils.isNotEmptyObj(route)) {
        panesComponents.push(commonUtils.panesComponent(pane, route, props.callbackAddPane, props.callbackRemovePane, props.callbackModifyPane));
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
    if (panes.length > 0 && commonModel.activePane.key === targetKey) {
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

  const moveTabNode = (dragKey, hoverKey) => {
    const { dispatch, commonModel } = props;
    const panes = [...commonModel.panes];
    const fromIndex = panes.findIndex(item => item.key === dragKey);
    const toIndex = panes.findIndex(item => item.key === hoverKey);
    if (fromIndex > -1 && toIndex > -1) {
      const item = panes.splice(fromIndex, 1)[0];
      panes.splice(toIndex, 0, item);
      dispatch({
        type: 'commonModel/savePanes',
        payload: panes,
      });
    }
  };

  const renderTabBar = (props, DefaultTabBar) => (
    <DefaultTabBar {...props}>
      {node => (
        <WrapTabNode key={node.key} index={node.key} moveTabNode={moveTabNode}>
          {node}
        </WrapTabNode>
      )}
    </DefaultTabBar>
  );

  const panes = props.commonModel.panes;
  return (
    <DndProvider backend={HTML5Backend}>
      <Tabs hideAdd type="editable-card" animated renderTabBar={renderTabBar} activeKey={props.commonModel.activePane.key} onEdit={onEdit} onChange={onChange}>
        { panes.map(pane => tabPane(pane)) }
      </Tabs>
    </DndProvider>
  );
}

export default TabsPages;