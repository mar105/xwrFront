export const routeInfo: any[] = [
  {
    path: '/xwrInit', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrInit/initCustomer', title: '客户期初', name: 'initCustomer', component: () => import('./routes/initCustomer/InitCustomer'),
    }]
  },
];