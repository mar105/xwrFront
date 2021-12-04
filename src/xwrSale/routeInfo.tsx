export const routeInfo: any[] = [
  {
    path: '/xwrSale', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrSale/saleOrder', title: '销售订单', name: 'saleOrder', component: () => import('./routes/saleOrder/SaleOrder'),
    }]
  },
];