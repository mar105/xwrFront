export const routeInfo: any[] = [
  {
    path: '/xwrMaterialInventory', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrMaterialInventory/initMaterial', title: '材料期初', name: 'initMaterial', component: () => import('./routes/initMaterial/InitMaterial'),
    }, {
      path: '/xwrMaterialInventory/purchaseStorage', title: '采购入库', name: 'purchaseStorage', component: () => import('./routes/purchaseStorage/PurchaseStorage'),
    }, {
      path: '/xwrMaterialInventory/materialDraw', title: '材料领用', name: 'materialDraw', component: () => import('./routes/materialDraw/MaterialDraw'),
    }, {
      path: '/xwrMaterialInventory/materialAllocate', title: '材料调拨', name: 'materialAllocate', component: () => import('./routes/materialAllocate/MaterialAllocate'),
    }]
  },
];