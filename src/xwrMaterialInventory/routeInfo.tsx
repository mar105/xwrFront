export const routeInfo: any[] = [
  {
    path: '/xwrMaterialInventory', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrMaterialInventory/purchaseStorage', title: '采购入库', name: 'purchaseStorage', component: () => import('./routes/purchaseStorage/PurchaseStorage'),
    }, {
      path: '/xwrMaterialInventory/materialDraw', title: '材料领用', name: 'materialDraw', component: () => import('./routes/materialDraw/MaterialDraw'),
    }]
  },
];