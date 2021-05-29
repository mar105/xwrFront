import * as React from 'react';
import { connect } from 'dva';
import TabPages from '../TabPages';
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {routeInfo} from '../routeInfo';
import * as application from "../application";
import * as request from "../../utils/request";
import {useEffect} from "react";

function IndexPage(props) {
  useEffect(() => {
    const {dispatch, commonModel} = props;
    const stompClient = commonUtils.getWebSocketData(commonModel.token);
    dispatch({
      type: 'commonModel/saveStompClient',
      payload: stompClient,
    });
  }, []);

  const onClick = (path) => {
    const {dispatch, dispatchModifyState, panes: panesOld, panesComponents } = props;
    const key = commonUtils.newId();
    const route: any = commonUtils.getRouteComponent(routeInfo, path);
    if (commonUtils.isNotEmptyObj(route)) {
      if (route.title) {
        const panes = commonUtils.isEmptyArr(panesOld) ? [] : panesOld;
        const pane = { key, title: route.title, route: path };
        panes.push(pane);
        panesComponents.push(commonUtils.panesComponent(pane, route));
        localStorage.setItem(`${application.prefix}panes`, JSON.stringify(panes));
        dispatchModifyState({ panes, panesComponents, activeKey: key.toString() });
      }
      dispatch({
        type: 'commonModel/gotoNewPage',
        payload: { newPage: path },
      });
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
      <a href="/">主页</a>
      <a href="/xwrManage">管理主页</a>
      <a href="/xwrManage/register"> register</a>
      <a href="/xwrManage/login"> login</a>
      <a href="/xwrManage/route"> route</a>
      <button onClick={onExit}> 退出</button>
      <button onClick={onClick.bind(this, '/xwrManage/route')}> add route</button>
      <button onClick={onClick.bind(this, '/xwrManage/container')}> add container</button>
      <button onClick={onClick.bind(this, '/xwrManage/permission')}> add permission</button>
      <button onClick={onClick.bind(this, '/xwrManage/constant')}> add constant</button>
      <div>{commonModel.userInfo.userName}</div>
    <div><TabPages {...props} /></div>
    </div>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(IndexPage));
