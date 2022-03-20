export const routeInfo: any[] = [
  {
    path: '/xwrSale', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrFinance/saleReconcile', title: '销售订单', name: 'saleOrder', component: () => import('./routes/saleReconcile/SaleReconcile'),
    }]
  },
];