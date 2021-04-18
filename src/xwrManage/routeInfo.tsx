import {Layout} from "antd";

export const routeInfo: any[] = [{
    path: '/xwrManage/login', layout: Layout, name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/xwrManage/register', layout: Layout, name: 'register', component: () => import('./routes/Register'),
  }, {
    path: '/xwrManage', layout: Layout, name: 'index', component: () => import('./routes/IndexPage'),
  }, {
    path: '/xwrManage/route', title: '路由信息', name: 'module', component: () => import('./routes/route/Route'),
  }, {
    path: '/xwrManage/container', title: '容器信息', name: 'container', component: () => import('./routes/container/Container'),
  },
];