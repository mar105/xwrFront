import * as React from 'react';
import { connect } from 'dva';
import {useCallback, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabsPages from "../TabsPages";
import commonBase from "../common/commonBase";
import IndexMenu from "./IndexMenu";
import {Row} from "antd";
import {useRef} from "react";
import {replacePath, routeInfo} from "../routeInfo";

function IndexPage(props) {
  const stompClientRef: any = useRef();
  const panesRef: any = useRef();
  const panesComponentsRef: any = useRef();
  useEffect(() => {
    stompClientRef.current = props.commonModel.stompClient;
  }, [props.commonModel.stompClient]);

  useEffect(() => {
    panesRef.current = props.commonModel.panes;
  }, [props.commonModel.panes]);

  useEffect(() => {
    panesComponentsRef.current = props.panesComponents;
  }, [props.panesComponents]);

  useEffect(() => {
    connectionWebsocket();
    const websocket = setInterval(() => {
      connectionWebsocket();
    }, 10000);
    return () => clearInterval(websocket);
  }, []);

  const connectionWebsocket = () => {
    const {dispatch, commonModel } = props;
    if (commonUtils.isEmpty(stompClientRef.current) || !stompClientRef.current.connected) {
      const stompClient = commonUtils.getWebSocketData(commonModel.token);
      if (stompClient.connected) {
        dispatch({
          type: 'commonModel/saveStompClient',
          payload: stompClient,
        });
      }
    }
  }


  const onExit = async () => {
    const {dispatch, commonModel} = props;
    const url: string = `${application.urlCommon}/verify/clearAllModifying`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({}))).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const callbackRemovePane = useCallback((targetKey) => {
    const {dispatch, dispatchModifyState, panesComponents: panesComponentsOld, commonModel } = props;
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

  }, [panesComponentsRef.current]);

  const callbackAddPane = useCallback(async (routeId, stateInfo) => {
    const {dispatch, dispatchModifyState, commonModel } = props;
    let state: any = {...stateInfo};
    const url: string = `${application.urlPrefix}/getData/getRouteContainer?id=` + routeId;
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      state = { ...state, routeId, ...interfaceReturn.data };
      const panes = [...panesRef.current];
      const path = replacePath(state.routeData.routeName);
      const key = commonUtils.newId();
      const route: any = commonUtils.getRouteComponent(routeInfo, path);
      if (commonUtils.isNotEmptyObj(route) && route.title) {
        const pane = {key, title: state.routeData.viewName, route: path, ...state };
        panes.push(pane);
        const panesComponents = commonUtils.isEmptyArr(panesComponentsRef.current) ? [] : panesComponentsRef.current;
        panesComponents.push(commonUtils.panesComponent(pane, route, callbackAddPane, callbackRemovePane));
        dispatchModifyState({panesComponents});
        dispatch({
          type: 'commonModel/saveActivePane',
          payload: {...pane},
        });
        dispatch({
          type: 'commonModel/savePanes',
          payload: panes,
        });
        dispatch({
          type: 'commonModel/gotoNewPage',
          payload: {newPage: path, state},
        });
      } else {
        state = { routeId, ...interfaceReturn.data};
        dispatch({
          type: 'commonModel/gotoNewPage',
          payload: {newPage: path, state},
        });
      }
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }, [panesComponentsRef.current]);

  const { commonModel } = props;
  return (
    <div>
      <Row>
        <IndexMenu {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} />
        <a href="/">主页</a>
        <a href="/xwrManage">管理主页</a>
        <a href="/register"> register</a>
        <a href="/login"> login</a>
        <button onClick={onExit}> 退出</button>
        <div>{commonModel.userInfo.userName} {commonModel.userInfo.shopName}</div>
      </Row>
      <div><TabsPages {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} /></div>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
