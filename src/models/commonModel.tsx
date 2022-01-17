import { routerRedux } from 'dva/router';
import * as application from '../application';
import {notification} from "antd";

export default {
  namespace: 'commonModel',
  state: {
    token: localStorage.getItem(application.prefix + 'token') || '',
    userInfo: JSON.parse(localStorage.getItem(application.prefix + 'userInfo') || '{}'),
    userShop: JSON.parse(localStorage.getItem(application.prefix + 'userShop') || '[]'),
    stompClient: null,
    panes: JSON.parse(localStorage.getItem(application.prefix + 'panes') || '[]'),
    activePane: JSON.parse(localStorage.getItem(application.prefix + 'activePane') || '{}'),
    commonConstant: JSON.parse(localStorage.getItem(application.prefix + 'commonConstant') || '[]'),
    formulaParamList: JSON.parse(localStorage.getItem(application.prefix + 'formulaParamList') || '[]'),
    formulaList: JSON.parse(localStorage.getItem(application.prefix + 'formulaList') || '[]'),
  },
  reducers: {
    saveToken(state, { payload: token }) {
      localStorage.setItem(application.prefix + 'token', token);
      return { ...state, token };
    },
    saveUserInfo(state, { payload: userInfo }) {
      localStorage.setItem(application.prefix + 'userInfo', JSON.stringify(userInfo));
      return { ...state, userInfo };
    },
    saveUserShop(state, { payload: userShop }) {
      localStorage.setItem(application.prefix + 'userShop', JSON.stringify(userShop));
      return { ...state, userShop };
    },
    saveStompClient(state, { payload: stompClient }) {
      return { ...state, stompClient };
    },
    savePanes(state, { payload: panes }) {
      localStorage.setItem(application.prefix + 'panes', JSON.stringify(panes));
      return { ...state, panes };
    },
    saveActivePane(state, { payload: activePane }) {
      localStorage.setItem(application.prefix + 'activePane', JSON.stringify(activePane));
      return { ...state, activePane };
    },
    saveCommonConstant(state, { payload: commonConstant }) {
      localStorage.setItem(application.prefix + 'commonConstant', JSON.stringify(commonConstant));
      return { ...state, commonConstant };
    },
    saveFormulaParamList(state, { payload: formulaParamList }) {
      localStorage.setItem(application.prefix + 'formulaParamList', JSON.stringify(formulaParamList));
      return { ...state, formulaParamList };
    },
    saveFormulaList(state, { payload: formulaList }) {
      localStorage.setItem(application.prefix + 'formulaList', JSON.stringify(formulaList));
      return { ...state, formulaList };
    },
  },
  effects: {
    * gotoNewPage({ payload }, { put }) {
      //state与search不能传，原因是刷新后为空了，现在存入activePane中。
      yield put(routerRedux.push({pathname: payload.newPage, state: payload.state, search: payload.search}));
    },
    * gotoError({ payload }, { put }) {
      const { code, msg, errorMsg } = payload;
      if (code === '5001') {
        const prefix = application.prefix === 'xwrMain' ? '' : '/' + application.prefix;
        yield put(routerRedux.push(prefix + '/login'));
      }
      console.error(errorMsg);
      notification.error({message: msg});
    },
    * gotoSuccess({ payload }, { put }) {
      const { msg } = payload;
      // message.destroy();
      notification.success({message: msg});
    },
  },
};
