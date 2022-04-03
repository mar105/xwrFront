export const routeInfo: any[] = [
  {
    path: '/xwrPurchase', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrPurchase/materialRequirePlan', title: '材料需求计划', name: 'materialRequirePlan', component: () => import('./routes/materialRequirePlan/MaterialRequirePlan'),
    }, {
      path: '/xwrPurchase/purchaseOrder', title: '采购订单', name: 'purchaseOrder', component: () => import('./routes/purchaseOrder/PurchaseOrder'),
    }]
  },
];