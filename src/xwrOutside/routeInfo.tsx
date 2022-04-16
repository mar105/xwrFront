export const routeInfo: any[] = [
  {
    path: '/xwrOutside', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrOutside/outsideOrder', title: '外协订单', name: 'outsideOrder', component: () => import('./routes/outsideOrder/OutsideOrder'),
    }]
  },
];