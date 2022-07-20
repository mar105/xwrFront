import * as React from 'react';
import { connect } from 'dva';
import {useCallback, useEffect} from "react";
import * as commonUtils from "../utils/commonUtils";
import * as application from "../application";
import * as request from "../utils/request";
import TabsPages from "../TabsPages";
import commonBase from "../common/commonBase";
import IndexMenu from "./IndexMenu";
import {Dropdown, Menu, Row, Modal, ConfigProvider} from "antd";
import {useRef} from "react";
import {replacePath, routeInfo} from "../routeInfo";
import { DownOutlined, MailOutlined } from '@ant-design/icons';
import {useMemo} from "react";
import {useReducer} from "react";
import ShopInvitation from "./shop/ShopInvitation";
import zhCN from 'antd/lib/locale/zh_CN';

function IndexPage(props) {
  const [modifySelfState, dispatchModifySelfState] = useReducer((state, action) => {
    return {...state, ...props.state, ...action};
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

  const fetchData = async () => {
    const { commonModel } = props;
    const params = { groupId: commonModel.userInfo.groupId, shopId: commonModel.userInfo.shopId };
    const url: string = application.urlPrefix + '/msg/getMsgCount' + commonUtils.paramGet(params);
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      dispatchModifySelfState({ mailCount: interfaceReturn.data });
    }
  }

  useEffect(() => {
    const intervalWebsocket = setInterval(() => {
      connectionWebsocket();
    }, 5000);
    fetchData();

    dispatchModifySelfState({intervalWebsocket});
    syncRefreshDataResult({ body: JSON.stringify({type: 'formulaParam'})});
    syncRefreshDataResult({ body: JSON.stringify({type: 'formula'})});
    return () => clearInterval(intervalWebsocket);
  }, []);

  useEffect(() => {
    if (commonUtils.isNotEmptyObj(props.commonModel) && commonUtils.isNotEmpty(props.commonModel.stompClient)
      && props.commonModel.stompClient.connected) {
      //这个是广播推送
      // const syncRefreshData = props.commonModel.stompClient.subscribe('/topic-websocket/syncRefreshData' + commonModel.userInfo.userId, syncRefreshDataResult);

      //这个是单人推送
      const syncRefreshData = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/syncRefreshData' + commonModel.userInfo.userId, syncRefreshDataResult);
      //
      const saveDataReturn = props.commonModel.stompClient.subscribe('/xwrUser/topic-websocket/saveDataReturn' + commonModel.userInfo.userId, saveDataReturnResult);
      return () => {
        syncRefreshData.unsubscribe();
        saveDataReturn.unsubscribe();
      };
    }

  }, [props.commonModel.stompClient]);

  const syncRefreshDataResult = async (data) => {
    const { dispatch } = props;
    const returnBody = JSON.parse(data.body);
    if (returnBody.type === 'formulaParam') {
      const formulaParamList: any = [];
      let pageNum = 1;
      let dropParam = { name: 'formulaParam', pageNum, isWait: true, containerSlaveId: '1454410376715309056', config: {} }; //公式参数
      let returnData: any = await props.getSelectList(dropParam);
      if (commonUtils.isNotEmptyObj(returnData)) {
        formulaParamList.push(...returnData.list);
        while(!returnData.isLastPage) {
          dropParam = { name: 'formulaParam', pageNum: pageNum + 1, isWait: true, containerSlaveId: '1454410376715309056', config: {} };
          returnData = await props.getSelectList(dropParam);
          if (commonUtils.isEmptyArr(returnData.list)) {
            break;
          } else {
            formulaParamList.push(...returnData.list);
          }
        }
      }
      dispatch({
        type: 'commonModel/saveFormulaParamList',
        payload: formulaParamList,
      });
    }
    else if (returnBody.type === 'formula') {
      const formulaList: any = [];
      let pageNum = 1;
      let dropParam = { name: 'formula', pageNum, isWait: true, containerSlaveId: '1454411898979225600', config: {} }; //公式
      let returnData = await props.getSelectList(dropParam);
      if (commonUtils.isNotEmptyObj(returnData)) {
        formulaList.push(...returnData.list);
        while(!returnData.isLastPage) {
          dropParam = { name: 'formula', pageNum: pageNum + 1, isWait: true, containerSlaveId: '1454411898979225600', config: {} };
          returnData = await props.getSelectList(dropParam);
          if (commonUtils.isEmptyArr(returnData.list)) {
            break;
          } else {
            formulaList.push(...returnData.list);
          }
        }
      }
      dispatch({
        type: 'commonModel/saveFormulaList',
        payload: formulaList,
      });
    }
  }

  const saveDataReturnResult = (data) => {
    // const { dispatch } = props;
    const returnBody = data.body;
    if (returnBody === '-1' || returnBody === -1) {
      fetchData();
    } else {
      dispatchModifySelfState({ mailCount: returnBody });
    }

  }

  const connectionWebsocket = async () => {
    const {dispatch, commonModel } = props;
    if (commonUtils.isEmpty(stompClientRef.current) || !stompClientRef.current.connected) {
      const stompClient = commonUtils.getWebSocketData(stompClientRef.current, () => {
        dispatch({
          type: 'commonModel/saveStompClient',
          payload: stompClient,
        });
      }, commonModel.token, true);
    }
  }

  const onSet = () => {
    const { commonModel } = props;
    const routeId = '1394810844327579648'; // 公司信息
    callbackAddPane(routeId, { dataId: commonModel.userInfo.shopId });
  }

  const onAddSet = () => {
    const routeId = '1394810844327579648'; // 公司信息
    callbackAddPane(routeId, { handleType: 'add' });
  }





  const onClear = async () => {
    const {dispatch, commonModel} = props;
    const url: string = application.urlCommon + '/verify/clearAllModifying';
    const interfaceReturn = (await request.postRequest(url, commonModel.token, application.paramInit({groupId: commonModel.userInfo.groupId,
      shopId: commonModel.userInfo.shopId }))).data;
    if (interfaceReturn.code === 1) {
    } else {
      props.gotoError(dispatch, interfaceReturn);
    }
  }

  const onExit = async () => {
    const {dispatch} = props;
    onClear();
    clearInterval(modifySelfState.intervalWebsocket);
    if (props.commonModel.stompClient !== null) {
      props.commonModel.stompClient.disconnect();
    }
    dispatch({
      type: 'commonModel/gotoNewPage',
      payload: {newPage: '/login'},
    });
  }

  const callbackRemovePane = useCallback((targetKey) => {
    const {dispatch, dispatchModifyState } = props;
    const panesOld = commonUtils.isEmptyArr(panesRef.current) ? [] : panesRef.current;
    let lastIndex = -1;
    panesOld.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const panesComponentsOld = commonUtils.isEmptyArr(panesComponentsRef.current) ? [] : panesComponentsRef.current;
    const panesComponents = panesComponentsOld.filter(pane => pane.key.toString() !== targetKey);
    const panes = panesOld.filter(pane => pane.key.toString() !== targetKey);
    let activePane: any = {};

    if (panes.length > 0) { // && commonModel.activePane.key === targetKey 20211031不知为何加这一句，先去除。
      if (lastIndex > -1) {
        activePane = panes[lastIndex];
      } else {
        activePane = panes[0];
      }
    }

    dispatchModifyState({ panesComponents });
    const params = 'routeId=' + activePane.routeId + '&tabId=' + activePane.key + (activePane.dataId ? '&dataId=' + activePane.dataId : '');
    dispatch({
      type: 'commonModel/saveActivePane',
      payload: activePane,
    });
    dispatch({
      type: 'commonModel/savePanes',
      payload: panes,
    });
    dispatch({
      type: 'commonModel/gotoNewPage',
      payload: {newPage: activePane.route + '?' + params},
    });

  }, [panesComponentsRef.current]);

  const callbackModifyPane = useCallback((targetKey, stateInfo) => {
    const {dispatch } = props;
    const panes = commonUtils.isEmptyArr(panesRef.current) ? [] : panesRef.current;
    const index = panes.findIndex(pane => pane.key.toString() === targetKey);

    if (index > -1) {
      const activePane = { ...panes[index], ...stateInfo };
      panes[index] = activePane;
      const params = 'routeId=' + activePane.routeId + '&tabId=' + activePane.key + (activePane.dataId ? '&dataId=' + activePane.dataId : '');
      dispatch({
        type: 'commonModel/saveActivePane',
        payload: activePane,
      });
      dispatch({
        type: 'commonModel/savePanes',
        payload: panes,
      });
      dispatch({
        type: 'commonModel/gotoNewPage',
        payload: {newPage: activePane.route + '?' + params},
      });
    }
  }, [panesComponentsRef.current]);

  const callbackAddPane = useCallback(async (routeId, stateInfo) => {
    const {dispatch, dispatchModifyState, commonModel } = props;
    if (commonUtils.isEmpty(routeId)) {
      props.gotoError(dispatch, { code: '6002', msg: '路由Id不能为空！' });
      return;
    }
    let state: any = {...stateInfo};
    const url: string = application.urlPrefix + '/personal/getRouteContainer?id=' +
      routeId + '&groupId=' + commonModel.userInfo.groupId + '&shopId=' + commonModel.userInfo.shopId + '&downloadPrefix=' + application.urlUpload + '/downloadFile';
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      state = { ...state, routeId, ...interfaceReturn.data };
      if (!props.commonModel.userInfo.isManage && commonUtils.isEmptyArr(interfaceReturn.data.permissionData)) {
        props.gotoError(dispatch, { code: '6002', msg: '没有操作权限！' });
        return;
      }
      const panes = [...panesRef.current];
      const path = replacePath(state.routeData.routeName);
      const key = commonUtils.newId();
      const routeParams = 'routeId=' + state.routeId + '&tabId=' + key + (state.dataId ? '&dataId=' + state.dataId : '');
      const route: any = commonUtils.getRouteComponent(routeInfo, path);
      if (commonUtils.isNotEmptyObj(route) && route.title) {
        const pane = {key, title: state.routeData.viewName, route: path, ...state };
        panes.push(pane);
        const panesComponents = commonUtils.isEmptyArr(panesComponentsRef.current) ? [] : panesComponentsRef.current;
        panesComponents.push(commonUtils.panesComponent(pane, route, callbackAddPane, callbackRemovePane, callbackModifyPane));
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
          payload: {newPage: path + '?' + routeParams, state},
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

  const onClick = async ({ key }) => {
    const { dispatch, commonModel, dispatchModifyState } = props;
    const addState: any = {};
    const userInfo = {...commonModel.userInfo};
    const index = commonModel.userShop.findIndex(item => item.id === key);
    userInfo.userAbbr = commonModel.userShop[index].userAbbr;
    userInfo.groupId = commonModel.userShop[index].groupId;
    userInfo.groupName = commonModel.userShop[index].groupName;
    userInfo.shopId = commonModel.userShop[index].shopId;
    userInfo.shopName = commonModel.userShop[index].shopName;
    userInfo.isManage = commonModel.userShop[index].isManage;
    userInfo.shopInfo = commonModel.userShop[index].shopInfo;

    const params = { groupId: userInfo.groupId, shopId: userInfo.shopId };
    const url: string = application.urlPrefix + '/msg/getMsgCount' + commonUtils.paramGet(params);
    const interfaceReturn = (await request.getRequest(url, commonModel.token)).data;
    if (interfaceReturn.code === 1) {
      addState.mailCount = interfaceReturn.data;
      dispatchModifySelfState({ ...addState });
    } else {
      props.gotoError(dispatch, interfaceReturn);
      return;
    }

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

  const onMail = () => {
    // 消息列表
    callbackAddPane('743388342216818688', {});
  }

  const onInvitation = () => {
    dispatchModifySelfState({invitationIsVisible: true});
  }

  const onInvitationClose = () => {
    dispatchModifySelfState({invitationIsVisible: false});
  }



  const { commonModel } = props;
  const shop = useMemo(()=>{
    const menu = <Menu onClick={onClick}>
      { commonModel.userShop ? commonModel.userShop.map(item => {
        return <Menu.Item key={item.id}>{item.shopName}</Menu.Item>
      }) : '' }
    </Menu>;
    return (
    <div>{commonModel.userInfo.userName + '(' + commonModel.userInfo.userAbbr + ')'}
      {
        commonUtils.isEmptyArr(commonModel.userShop) ?
          <div>
            <button onClick={onInvitation}> 加入公司</button>
            <button onClick={onAddSet}> 创建公司</button>
          </div> :
          commonModel.userInfo && commonModel.userShop && commonModel.userShop.length === 1 ?
          commonModel.userInfo.shopName :
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
              {commonModel.userInfo.shopName}  <DownOutlined />
            </a>
          </Dropdown>
      }
      <a onClick={onMail}><MailOutlined />{modifySelfState.mailCount}</a>
      <button onClick={onSet}> 设置</button>
      </div>)}, [commonModel.userInfo, modifySelfState.mailCount]);
  return (
    <div>
      <ConfigProvider locale={zhCN}>
      <Row>
        <IndexMenu {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} callbackModifyPane={callbackModifyPane} />
        <a href="/">主页</a>
        <a href="/xwrManage">管理主页</a>
        <a href="/register"> register</a>
        <a href="/login"> login</a>
        <button onClick={onClear}> 清除缓存</button>
        <button onClick={onExit}> 退出</button>
        {shop}
        <Modal width={800} visible={modifySelfState.invitationIsVisible} closable={false} maskClosable={true} footer={null}>
          <ShopInvitation {...props} onInvitationClose={onInvitationClose} />
        </Modal>
      </Row>
      <div><TabsPages {...props} callbackAddPane={callbackAddPane} callbackRemovePane={callbackRemovePane} callbackModifyPane={callbackModifyPane} /></div>
      </ConfigProvider>
    </div>
  );
}

export default connect(commonUtils.mapStateToProps)(commonBase(IndexPage));
