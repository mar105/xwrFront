import * as xwrBasicRouteInfo from "./xwrBasic/routeInfo";
import * as xwrInitRouteInfo from "./xwrInit/routeInfo";
import * as xwrSaleRouteInfo from "./xwrSale/routeInfo";

const xwrMainRouteInfo: any[] = [{
    path: '/login', name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/register', name: 'register', component: () => import('./routes/register/Register'),
  }, {
    path: '/', name: 'index', component: () => import('./routes/IndexPage'),
    children: [{
      path: '/shop', name: 'shop', title: '公司信息', component: () => import('./routes/shop/Shop'),
    }, {
      path: '/userPermission', name: 'userPermission', title: '用户信息', component: () => import('./routes/userPermission/UserPermission'),
    }, {
      path: '/businessPermission', name: 'businessPermission', title: '用户权限', component: () => import('./routes/businessPermission/BusinessPermission'),
    }]
  },
];

//替换的原因是因为分模块打包后，再刷新会根据路由直接跳转到子模块路由上去。为了能在panes上展现。
export const replacePath = (pathOld) => {
  let path = pathOld;
  path = path.replace('/xwrBasic/', '/');
  path = path.replace('/xwrInit/', '/');
  path = path.replace('/xwrSale/', '/');
  return path;
}
const mergeRouteInfo = (routeInfo, childRouteInfo) => {
  const index = routeInfo.findIndex(item => item.path === '/');
  if (index > -1) {
    childRouteInfo.forEach(item => {
      if (item.children) {
        item.children.forEach(childOld => {
          const child = {...childOld};
          child.path = replacePath(childOld.path);
          routeInfo[index].children.push(child);
        });
      }
    });
  }
}

const routeInfoNew: any = [];
routeInfoNew.push(...xwrMainRouteInfo);
mergeRouteInfo(routeInfoNew, xwrBasicRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrInitRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrSaleRouteInfo.routeInfo);

export const routeInfo: any[] = [...routeInfoNew];