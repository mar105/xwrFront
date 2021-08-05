import * as React from 'react';
import { connect } from 'dva';
import {useCallback, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabsPages from "../TabsPages";
import commonBase from "../common/commonBase";
import IndexMenu from "./IndexMenu";
import {Dropdown, Menu, Row} from "antd";
import {useRef} from "react";
import {replacePath, routeInfo} from "../routeInfo";
import { DownOutlined } from '@ant-design/icons';
import {useMemo} from "react";

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
    }, 5000);
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


  const onClear = async () => {
    const {dispatch, commonModel} = props;
    const url: string = `${application.urlCommon}/verify/clearAllModifying`;
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({groupId: commonModel.userInfo.groupId,
      shopId: commonModel.userInfo.shopId }))).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onExit = async () => {
    const {dispatch} = props;
    dispatch({
      type: 'commonModel/gotoNewPage',
      payload: {newPage: '/login'},
    });
  }

  const callbackRemovePane = useCallback((targetKey) => {
    const {dispatch, dispatchModifyState, commonModel } = props;
    let lastIndex = -1;
    commonModel.panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesComponentsOld = commonUtils.isEmptyArr(panesComponentsRef.current) ? [] : panesComponentsRef.current;
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
    if (commonUtils.isEmpty(routeId)) {
      props.gotoError(dispatch, { code: '6002', msg: '路由Id不能为空！' });
      return;
    }
    let state: any = {...stateInfo};
    const url: string = `${application.urlPrefix}/getData/getRouteContainer?id=` + routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId;
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

  const onClick = ({ key }) => {
    const { dispatch, commonModel, dispatchModifyState } = props;
    const userInfo = {...commonModel.userInfo};
    const index = userInfo.userShop.findIndex(item => item.id === key);
    userInfo.groupId = userInfo.userShop[index].groupId;
    userInfo.groupName = userInfo.userShop[index].groupName;
    userInfo.shopId = userInfo.userShop[index].shopId;
    userInfo.shopName = userInfo.userShop[index].shopName;
    userInfo.isManage = userInfo.userShop[index].isManage;
    dispatch({
      type: 'commonModel/saveUserInfo',
      payload: userInfo,
    });
    dispatch({
      type: 'commonModel/savePanes',
      payload: [],
    });
    dispatchModifyState({ panesComponents: [] });
  };



  const { commonModel } = props;

  const shop = useMemo(()=>{
    const menu = <Menu onClick={onClick}>
      { commonModel.userInfo.userShop.map(item => {
        return <Menu.Item key={item.id}>{item.shopName}</Menu.Item>
      }) }
    </Menu>;
    return (
    <div>{commonModel.userInfo.userName}
      {
        commonModel.userInfo.userShop.length === 1 ? commonModel.userInfo.shopName :
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              {commonModel.userInfo.shopName}  <DownOutlined />
            </a>
          </Dropdown>
      }</div>)}, [commonModel.userInfo]);
  return (
    <div>
      <Row>
        <IndexMenu {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} />
        <a href="/">主页</a>
        <a href="/xwrManage">管理主页</a>
        <a href="/register"> register</a>
        <a href="/login"> login</a>
        <button onClick={onClear}> 清除缓存</button>
        <button onClick={onExit}> 退出</button>
        {shop}
      </Row>
      <div><TabsPages {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} /></div>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
