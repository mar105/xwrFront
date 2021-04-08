import * as React from 'react';
import { connect } from 'dva';
import TabPage from './TabPage';
import commonBase from "../../utils/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {routeInfo} from '../routeInfo';
import * as application from "../application";
import * as request from "../../utils/request";

function IndexPage(props) {
  const onClick = () => {
    const {dispatchModifyState, panes: panesOld, panesComponents } = props;
    const iIndex = routeInfo.findIndex(item => item.path === '/xwrManage/route');
    if (iIndex > -1) {
      const key = commonUtils.newId();
      const panes = commonUtils.isEmptyArr(panesOld) ? [] : panesOld;
      const pane = { key, title: routeInfo[iIndex].title, route: '/xwrManage/route' };
      panes.push(pane);
      panesComponents.push(commonUtils.panesComponent(pane, routeInfo[iIndex]));
      localStorage.setItem(`${application.prefix}panes`, JSON.stringify(panes));
      dispatchModifyState({ panes, panesComponents, activeKey: key.toString() });
    }
  };
  const onExit = async () => {
    const {dispatch, commonModel} = props;
    const url: string = `${application.urlCommon}/verify/clearAllModifying`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({}))).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }
  const { commonModel } = props;
  return (
    <div>
      <a href="/xwrManage">管理主页</a>
      <a href="/xwrManage/register"> register</a>
      <a href="/xwrManage/login"> login</a>
      <a href="/xwrManage/route"> route</a>
      <button onClick={onExit}> 退出</button>
      <button onClick={onClick}> add panel</button>
      <div>{commonModel.userInfo.userName}</div>
    <div><TabPage {...props} /></div>
    </div>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(IndexPage));
