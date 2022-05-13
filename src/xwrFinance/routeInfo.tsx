export const routeInfo: any[] = [
  {
    path: '/xwrFinance', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrFinance/initCustomer', title: '客户期初', name: 'initCustomer', component: () => import('./routes/initCustomer/InitCustomer'),
    }, {
      path: '/xwrFinance/initSupply', title: '供应商期初', name: 'initCustomer', component: () => import('./routes/initSupply/InitSupply'),
    }, {
      path: '/xwrFinance/initFinance', title: '财务期初', name: 'initFinance', component: () => import('./routes/initFinance/InitFinance'),
    },{
      path: '/xwrFinance/saleInvoice', title: '销售发票', name: 'saleInvoice', component: () => import('./routes/saleInvoice/SaleInvoice'),
    },{
      path: '/xwrFinance/purchaseInvoice', title: '采购发票', name: 'purchaseInvoice', component: () => import('./routes/purchaseInvoice/PurchaseInvoice'),
    },{
      path: '/xwrFinance/customerFinance', title: '客户财务调整', name: 'customerFinance', component: () => import('./routes/customerFinance/CustomerFinance'),
    }]
  },
];