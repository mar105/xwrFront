import React from 'react';
import {Tabs} from 'antd';

const { TabPane } = Tabs;

export function TabComponent(params) {
  return <Tabs hideAdd type="editable-card" {...params.property} {...params.event}>
    {params.panes.map(pane => (
      <TabPane tab={pane.title} key={pane.key}>
        {pane.content}
      </TabPane>
    ))}
  </Tabs>

}
