import * as React from 'react';
import { connect } from 'dva';
import {useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabsPages from "../TabsPages";
import commonBase from "../common/commonBase";
import IndexMenu from "./IndexMenu";
import {Row} from "antd";

function IndexPage(props) {
  useEffect(() => {
    const {dispatch, commonModel, dispatchModifyState } = props;
    const stompClient = commonUtils.getWebSocketData(commonModel.token);
    dispatch({
      type: 'commonModel/saveStompClient',
      payload: stompClient,
    });
    const fetchData = async () => {
      const url: string = `${application.urlManage}/route/getAllRoute`;
      const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
      if (interfaceReturn.code === 1) {
        dispatchModifyState({ menuData: interfaceReturn.data });
      } else {
        props.gotoError(dispatch, interfaceReturn);
      }
    }
    fetchData();
  }, []);

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
      <Row>
        <IndexMenu {...props} />
        <a href="/">主页</a>
        <a href="/xwrManage">管理主页</a>
        <a href="/register"> register</a>
        <a href="/login"> login</a>
        <button onClick={onExit}> 退出</button>
        <div>{commonModel.userInfo.userName} {commonModel.userInfo.shopName}</div>
      </Row>
      <div><TabsPages {...props} /></div>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
