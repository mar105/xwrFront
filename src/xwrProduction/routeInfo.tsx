export const routeInfo: any[] = [
  {
    path: '/xwrProduction', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrProduction/workOrder', title: '生产单', name: 'workOrder', component: () => import('./routes/workOrder/WorkOrder'),
    }]
  },
];