import { routerRedux } from 'dva/router';
import { application } from '../application';

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
      yield put(routerRedux.push(payload.newPage));
    },
    * gotoError({ payload }, { put }) {
      const { code, msg } = payload.interfaceReturn;
      if (code === 'login') {
        yield put(routerRedux.push('Login'));
        throw new Error(msg);
      } else {
        throw new Error(msg);
      }
    },
  },
};
