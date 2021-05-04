import {Layout} from "antd";

export const routeInfo: any[] = [{
    path: '/login', layout: Layout, name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/register', layout: Layout, name: 'register', component: () => import('./routes/register/Register'),
  }, {
    path: '/', layout: Layout, name: 'index', component: () => import('./routes/IndexPage'),
  },
];