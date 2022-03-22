export const routeInfo: any[] = [
  {
    path: '/xwrSale', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrFinance/saleReconcile', title: '销售对账', name: 'saleReconcile', component: () => import('./routes/saleReconcile/SaleReconcile'),
    },{
      path: '/xwrFinance/saleInvoice', title: '销售发票', name: 'saleInvoice', component: () => import('./routes/saleInvoice/SaleInvoice'),
    }]
  },
];