import * as React from 'react';
import { connect } from 'dva';
import {useEffect} from "react";
import {replacePath, routeInfo} from "../routeInfo";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabPage from "../TabPage";
import commonBase from "../utils/commonBase";

function IndexPage(props) {
  useEffect(() => {
    // const {commonModel} = props;
    // commonUtils.getWebSocketData(commonModel.token, "", null);
  }, []);

  const onClick = (pathOld) => {
    const {dispatch, dispatchModifyState, panes: panesOld, panesComponents } = props;
    const path = replacePath(pathOld);
    const key = commonUtils.newId().toString();
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
      <a href="/register"> register</a>
      <a href="/login"> login</a>
      <button onClick={onExit}> 退出</button>
      <button onClick={onClick.bind(this, '/register')}> add register</button>
      <button onClick={onClick.bind(this, '/xwrBasic/customer')}> add customer</button>
      <div>{commonModel.userInfo.userName}</div>
      <div><TabPage {...props} /></div>
    </div>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(commonBase(IndexPage));
