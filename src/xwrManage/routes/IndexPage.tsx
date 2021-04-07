import * as React from 'react';
import { connect } from 'dva';
import Tabs from "./Tabs";
import commonBase from "../../utils/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import dynamic from 'dva/dynamic';
import {routeInfo} from '../routeInfo';

function IndexPage(props) {
  const onClick = () => {
    const {dispatchModifyState, panes: panesOld } = props;
    const iIndex = routeInfo.findIndex(item => item.path === '/xwrManage/route');
    if (iIndex > -1) {
      const key = commonUtils.newId();
      const Component: any = dynamic({ ...routeInfo[iIndex] });
      const panes = commonUtils.isEmptyArr(panesOld) ? [] : panesOld;
      panes.push({ key, title: routeInfo[iIndex].title, route: '/xwrManage/route', content: <Component tabId={key} /> });
      dispatchModifyState({ panes });
    }
  };
  const { commonModel } = props;
  return (
    <div>
      <a href="/xwrManage">管理主页</a>
      <a href="/xwrManage/register"> register</a>
      <a href="/xwrManage/login"> login</a>
      <a href="/xwrManage/route"> route</a>
      <button onClick={onClick}> add panel</button>
      <div>{commonModel.userInfo.userName}</div>
    <div><Tabs {...props} /></div>
    </div>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(IndexPage));
