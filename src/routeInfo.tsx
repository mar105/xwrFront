export const routeInfo: any[] = [{
    path: '/login', name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/register', name: 'register', component: () => import('./routes/register/Register'),
  }, {
    path: '/', name: 'index', component: () => import('./routes/IndexPage'),
  },
];