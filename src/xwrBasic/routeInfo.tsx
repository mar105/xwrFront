export const routeInfo: any[] = [
  {
    path: '/xwrBasic', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrBasic/customer', title: '客户', name: 'customer', component: () => import('./routes/customer/Customer'),
    },{
      path: '/xwrBasic/commonList', title: '列表', name: 'commonList', component: () => import('./routes/category/CategoryList'),

    }]
  },
];