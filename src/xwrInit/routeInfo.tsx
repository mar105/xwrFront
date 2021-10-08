export const routeInfo: any[] = [
  {
    path: '/xwrInit', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrInit/initCustomer', title: '客户期初', name: 'initCustomer', component: () => import('./routes/initCustomer/InitCustomer'),
    }, {
      path: '/xwrInit/initSupply', title: '供应商期初', name: 'initCustomer', component: () => import('./routes/initSupply/InitSupply'),
    }, {
      path: '/xwrInit/initFinance', title: '财务期初', name: 'initFinance', component: () => import('./routes/initFinance/InitFinance'),
    }, {
      path: '/xwrInit/initProduct', title: '产品期初', name: 'initProduct', component: () => import('./routes/initProduct/InitProduct'),
    }]
  },
];