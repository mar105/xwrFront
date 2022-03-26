export const routeInfo: any[] = [
  {
    path: '/xwrMaterialInventory', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrMaterialInventory/initMaterial', title: '材料期初', name: 'initMaterial', component: () => import('./routes/initMaterial/InitMaterial'),
    }]
  },
];