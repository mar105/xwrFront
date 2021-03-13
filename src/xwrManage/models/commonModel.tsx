import { routerRedux } from 'dva/router';
import * as application from '../application';

export default {
  namespace: 'commonModel',
  state: {
    token: localStorage.getItem(`${application.prefix}token`) || '',
    userInfo: JSON.parse(localStorage.getItem(`${application.prefix}userInfo`) || '{}'),
    provinceCityArea: JSON.parse(localStorage.getItem(`${application.prefix}provinceCityArea`) || '[]'),
  },
  reducers: {
    saveToken(state, { payload: token }) {
      localStorage.setItem(`${application.prefix}token`, token);
      return { ...state, token };
    },
    saveUserInfo(state, { payload: userInfo }) {
      console.log('userInfo', userInfo);
      localStorage.setItem(`${application.prefix}userInfo`, JSON.stringify(userInfo));
      return { ...state, userInfo };
    },
    saveProvinceCityArea(state, { payload: provinceCityArea }) {
      localStorage.setItem(`${application.prefix}provinceCityArea`, JSON.stringify(provinceCityArea));
      return { ...state, provinceCityArea };
    },
  },
  effects: {
    * gotoNewPage({ payload }, { put }) {
      yield put(routerRedux.push(payload.newPage));
    },
    * gotoError({ payload }, { put }) {
      const { code, msg } = payload.interfaceReturn;
      console.log('payload', msg, code);
      if (code === 'login') {
        yield put(routerRedux.push('login'));
        throw new Error(msg);
      } else {
        throw new Error(msg);
      }
    },
  },
};
