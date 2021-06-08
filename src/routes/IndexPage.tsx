import * as React from 'react';
import { connect } from 'dva';
import {useEffect} from "react";
import {replacePath, routeInfo} from "../routeInfo";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabsPages from "../TabsPages";
import commonBase from "../common/commonBase";

function IndexPage(props) {
  useEffect(() => {
    const {dispatch, commonModel} = props;
    const stompClient = commonUtils.getWebSocketData(commonModel.token);
    dispatch({
      type: 'commonModel/saveStompClient',
      payload: stompClient,
    });
  }, []);

  const onClick = async (pathOld, stateOld) => {
    const {dispatch, dispatchModifyState, panes: panesOld, panesComponents, commonModel } = props;
    const path = replacePath(pathOld);
    const key = commonUtils.newId();
    const route: any = commonUtils.getRouteComponent(routeInfo, path);
    if (commonUtils.isNotEmptyObj(route)) {
      let state = {}
      if (route.title) {
        const url: string = `${application.urlPrefix}/getData/getRouteContainer?id=` + stateOld.routeId;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceReturn.code === 1) {
          state = { ...stateOld, ... interfaceReturn.data};
          const panes = commonUtils.isEmptyArr(panesOld) ? [] : panesOld;
          const pane = { key, title: route.title, route: path };
          panes.push(pane);
          panesComponents.push(commonUtils.panesComponent(pane, route));
          localStorage.setItem(`${application.prefix}panes`, JSON.stringify(panes));
          dispatchModifyState({ panes, panesComponents, activeKey: key.toString() });
          dispatch({
            type: 'commonModel/gotoNewPage',
            payload: { newPage: path, state },
          });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      } else {
        const url: string = `${application.urlPrefix}/getData/getRouteContainer?id=` + stateOld.routeId;
        const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
        if (interfaceReturn.code === 1) {
          state = {...stateOld, ...interfaceReturn.data};
          dispatch({
            type: 'commonModel/gotoNewPage',
            payload: {newPage: path, state},
          });
        } else {
          props.gotoError(dispatch, interfaceReturn);
        }
      }
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
      <a href="/register"> register</a>
      <a href="/login"> login</a>
      <button onClick={onExit}> 退出</button>
      <button onClick={onClick.bind(this, '/register')}> add register</button>
      <button onClick={onClick.bind(this, '/xwrBasic/customer', { routeId: '1390238196331319296' })}> 客户</button>
      <button onClick={onClick.bind(this, '/xwrBasic/commonList', { routeId: '1393774997310410752' })}> 客户分类</button>
      <button onClick={onClick.bind(this, '/shop', { routeId: '1394810844327579648' })}> shop</button>
      <div>{commonModel.userInfo.userName} {commonModel.userInfo.shopName}</div>
      <div><TabsPages {...props} /></div>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
