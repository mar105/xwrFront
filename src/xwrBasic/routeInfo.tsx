export const routeInfo: any[] = [
  {
    path: '/xwrBasic', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrBasic/customer', title: '客户', name: 'customer', component: () => import('./routes/customer/Customer'),
    }, {
      path: '/xwrBasic/categoryList', title: '分类列表', name: 'commonList', component: () => import('./routes/category/CategoryList'),
    }, {
      path: '/xwrBasic/commonList', title: '通用列表', name: 'commonList', component: () => import('./routes/commonList/CommonList'),
    }, {
      path: '/xwrBasic/formulaParam', title: '公式参数', name: 'formulaParam', component: () => import('./routes/formulaParam/FormulaParam'),
    }, {
      path: '/xwrBasic/formula', title: '公式信息', name: 'formula', component: () => import('./routes/formula/Formula'),
    }]
  },
];