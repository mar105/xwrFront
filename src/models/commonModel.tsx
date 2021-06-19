import { routerRedux } from 'dva/router';
import * as application from '../application';
import {message} from "antd";

export default {
  namespace: 'commonModel',
  state: {
    token: localStorage.getItem(`${application.prefix}token`) || '',
    userInfo: JSON.parse(localStorage.getItem(`${application.prefix}userInfo`) || '{}'),
    userShop: JSON.parse(localStorage.getItem(`${application.prefix}userShop`) || '[]'),
    stompClient: null,
    panes: JSON.parse(localStorage.getItem(`${application.prefix}panes`) || '[]'),
    activePane: JSON.parse(localStorage.getItem(`${application.prefix}activePane`) || '{}'),
  },
  reducers: {
    saveToken(state, { payload: token }) {
      localStorage.setItem(`${application.prefix}token`, token);
      return { ...state, token };
    },
    saveUserInfo(state, { payload: userInfo }) {
      localStorage.setItem(`${application.prefix}userInfo`, JSON.stringify(userInfo));
      return { ...state, userInfo };
    },
    saveUserShop(state, { payload: userShop }) {
      localStorage.setItem(`${application.prefix}userShop`, JSON.stringify(userShop));
      return { ...state, userShop };
    },
    saveStompClient(state, { payload: stompClient }) {
      return { ...state, stompClient };
    },
    savePanes(state, { payload: panes }) {
      localStorage.setItem(`${application.prefix}panes`, JSON.stringify(panes));
      return { ...state, panes };
    },
    saveActivePane(state, { payload: activePane }) {
      localStorage.setItem(`${application.prefix}activePane`, JSON.stringify(activePane));
      return { ...state, activePane };
    },
  },
  effects: {
    * gotoNewPage({ payload }, { put }) {
      //state与search不能传，原因是刷新后为空了，现在存入activePane中。
      yield put(routerRedux.push({pathname: payload.newPage, state: payload.state, search: payload.search}));
    },
    * gotoError({ payload }, { put }) {
      const { code, msg } = payload;
      if (code === '5001') {
        yield put(routerRedux.push('/login'));
      }
      message.destroy();
      message.error(msg);
    },
    * gotoSuccess({ payload }, { put }) {
      const { msg } = payload;
      message.destroy();
      message.success(msg);
    },
  },
};
