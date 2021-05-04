import { routerRedux } from 'dva/router';
import * as application from '../application';
import {message} from "antd";

export default {
  namespace: 'commonModel',
  state: {
    token: localStorage.getItem(`${application.prefix}token`) || '',
    userInfo: localStorage.getItem(`${application.prefix}userInfo`) || '',
    provinceCityArea: localStorage.getItem(`${application.prefix}provinceCityArea`) || [],
  },
  reducers: {
    saveToken(state, { payload: token }) {
      localStorage.setItem(`${application.prefix}token`, token);
      return { ...state, token };
    },
    saveUserInfo(state, { payload: userInfo }) {
      localStorage.setItem(`${application.prefix}userInfo`, userInfo);
      return { ...state, userInfo };
    },
    saveProvinceCityArea(state, { payload: provinceCityArea }) {
      localStorage.setItem(`${application.prefix}provinceCityArea`, provinceCityArea);
      return { ...state, provinceCityArea };
    },
  },
  effects: {
    * gotoNewPage({ payload }, { put }) {
      console.log('11111', payload.newPage);
      yield put(routerRedux.push(payload.newPage));
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
