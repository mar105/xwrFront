import {Layout} from "antd";

export const routeInfo: any[] = [
  {
    path: '/xwrBasic', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrBasic/customer', layout: Layout, name: 'customer', component: () => import('./routes/customer/customer'),
    },]
  },
];