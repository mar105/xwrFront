import * as React from 'react';
import { connect } from 'dva';
import TabPages from '../TabPages';
import commonBase from "../../common/commonBase";
import * as commonUtils from "../../utils/commonUtils";
import {routeInfo} from '../routeInfo';
import * as application from "../application";
import * as request from "../../utils/request";
import {useEffect} from "react";
import {useRef} from "react";
import {useReducer} from "react";

function IndexPage(props) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...action};
  },{});

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
    const intervalWebsocket = setInterval(() => {
      connectionWebsocket();
    }, 5000);
    dispatchModifySelfState({intervalWebsocket});
    return () => clearInterval(intervalWebsocket);
  }, []);

  const connectionWebsocket = () => {
    const {dispatch, commonModel } = props;
    if (commonUtils.isEmpty(stompClientRef.current) || !stompClientRef.current.connected) {
      const stompClient = commonUtils.getWebSocketData(stompClientRef.current, () => {
        dispatch({
          type: 'commonModel/saveStompClient',
          payload: stompClient,
        });
      }, commonModel.token);
    }
  }

  const onClick = (path) => {
    const {dispatch, dispatchModifyState, panesComponents } = props;
    const key = commonUtils.newId();
    const route: any = commonUtils.getRouteComponent(routeInfo, path);
    if (commonUtils.isNotEmptyObj(route)) {
      if (route.title) {
        const panes = commonModel.panes;
        const pane = { key, title: route.title, route: path };
        panes.push(pane);
        panesComponents.push(commonUtils.panesComponent(pane, route, null, null, null));
        dispatch({
          type: 'commonModel/saveActivePane',
          payload: { ...pane },
        });
        dispatch({
          type: 'commonModel/savePanes',
          payload: panes,
        });
        dispatchModifyState({ panesComponents });
      }
      dispatch({
        type: 'commonModel/gotoNewPage',
        payload: { newPage: path },
      });
    }
  };


  const onClear = async () => {
    const {dispatch, commonModel} = props;
    const url: string = application.urlCommon + '/verify/clearAllModifying';
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({}))).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onExit = async () => {
    const {dispatch} = props;
    clearInterval(modifySelfState.intervalWebsocket);
    if (props.commonModel.stompClient !== null) {
      props.commonModel.stompClient.disconnect();
    }

    dispatch({
      type: 'commonModel/gotoNewPage',
      payload: {newPage: '/xwrManage/login'},
    });
  }

  const { commonModel } = props;
  return (
    <div>
      <a href="/">主页</a>
      <a href="/xwrManage">管理主页</a>
      <a href="/xwrManage/register"> register</a>
      <a href="/xwrManage/login"> login</a>
      <a href="/xwrManage/route"> route</a>
      <button onClick={onClear}> 清除缓存</button>
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

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
