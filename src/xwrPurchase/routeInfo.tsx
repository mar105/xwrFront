export const routeInfo: any[] = [
  {
    path: '/xwrPurchase', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrPurchase/purchaseOrder', title: '销售订单', name: 'purchaseOrder', component: () => import('./routes/purchaseOrder/PurchaseOrder'),
    }]
  },
];