export const routeInfo: any[] = [
  {
    path: '/xwrBasic', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrBasic/customer', title: '客户', name: 'customer', component: () => import('./routes/customer/Customer'),
    }, {
      path: '/xwrBasic/categoryList', title: '分类列表', name: 'commonList', component: () => import('./routes/category/CategoryList'),

    }, {
      path: '/xwrBasic/commonList', title: '通用列表', name: 'commonList', component: () => import('./routes/commonList/CommonList'),

    }]
  },
];