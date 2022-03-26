export const routeInfo: any[] = [
  {
    path: '/xwrProductInventory', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrProductInventory/initProduct', title: '产品期初', name: 'initProduct', component: () => import('./routes/initProduct/InitProduct'),
    }, {
      path: '/xwrProductInventory/productStorage', title: '成品入库', name: 'productStorage', component: () => import('./routes/productStorage/ProductStorage'),
    }]
  },
];