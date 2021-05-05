export const routeInfo: any[] = [{
    path: '/xwrManage/login', name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/xwrManage/register', name: 'register', component: () => import('./routes/Register'),
  }, {
    path: '/xwrManage', name: 'index', component: () => import('./routes/IndexPage'),
      children: [{
        path: '/xwrManage/route', title: '路由信息', name: 'module', component: () => import('./routes/route/Route'),
      }, {
        path: '/xwrManage/container', title: '容器信息', name: 'container', component: () => import('./routes/container/Container'),
      }, {
        path: '/xwrManage/permission', title: '权限信息', name: 'permission', component: () => import('./routes/permission/Permission'),
      }, {
        path: '/xwrManage/constant', title: '常量信息', name: 'constant', component: () => import('./routes/constant/Constant'),
      },]
  },
];