export const routeInfo: any[] = [
  {
    path: '/xwrProductInventory', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrProductInventory/productStorage', title: '成品入库', name: 'productStorage', component: () => import('./routes/productStorage/ProductStorage'),
    }]
  },
];