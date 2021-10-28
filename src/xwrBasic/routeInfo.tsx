export const routeInfo: any[] = [
  {
    path: '/xwrBasic', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/xwrBasic/customer', title: '客户', name: 'customer', component: () => import('./routes/customer/Customer'),
    }, {
      path: '/xwrBasic/categoryList', title: '分类列表', name: 'categoryList', component: () => import('./routes/category/CategoryList'),
    }, {
      path: '/xwrBasic/commonList', title: '通用列表', name: 'commonList', component: () => import('./routes/commonList/CommonList'),
    }, {
      path: '/xwrBasic/selectList', title: '选择列表', name: 'selectList', component: () => import('./routes/selectList/SelectList'),
    }, {
      path: '/xwrBasic/formulaParam', title: '公式参数', name: 'formulaParam', component: () => import('./routes/formulaParam/FormulaParam'),
    }, {
      path: '/xwrBasic/formula', title: '公式信息', name: 'formula', component: () => import('./routes/formula/Formula'),
    }, {
      path: '/xwrBasic/material', title: '材料信息', name: 'material', component: () => import('./routes/material/Material'),
    }, {
      path: '/xwrBasic/productCategory', title: '产品分类', name: 'productCategory', component: () => import('./routes/productCategory/ProductCategory'),
    }, {
      path: '/xwrBasic/product', title: '产品信息', name: 'product', component: () => import('./routes/product/Product'),
    }, {
      path: '/xwrBasic/process', title: '工艺信息', name: 'process', component: () => import('./routes/process/Process'),
    }, {
      path: '/xwrBasic/machine', title: '设备信息', name: 'machine', component: () => import('./routes/commonMaster/CommonMaster'),
    }, {
      path: '/xwrBasic/team', title: '班组信息', name: 'team', component: () => import('./routes/team/Team'),
    }, {
      path: '/xwrBasic/exchange', title: '汇率信息', name: 'currency', component: () => import('./routes/exchange/Exchange'),
    }]
  },
];