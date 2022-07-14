import * as xwrBasicRouteInfo from "./xwrBasic/routeInfo";
import * as xwrSaleRouteInfo from "./xwrSale/routeInfo";
import * as xwrProductionRouteInfo from "./xwrProduction/routeInfo";
import * as xwrProductInventoryRouteInfo from "./xwrProductInventory/routeInfo";
import * as xwrMaterialInventoryRouteInfo from "./xwrMaterialInventory/routeInfo";
import * as xwrPurchaseRouteInfo from "./xwrPurchase/routeInfo";
import * as xwrFinanceRouteInfo from "./xwrFinance/routeInfo";
import * as xwrOutsideRouteInfo from "./xwrOutside/routeInfo";

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
    }, {
      path: '/personalContainer', name: 'personalContainer', title: '个性化设置', component: () => import('./routes/personalContainer/PersonalContainer'),
    }, {
      path: '/examineFlow', name: 'examineFlow', title: '审核流程', component: () => import('./routes/examineFlow/ExamineFlow'),
    }, {
      path: '/examineCondition', name: 'examineCondition', title: '审核条件', component: () => import('./routes/examineCondition/ExamineCondition'),
    }, {
      path: '/msg', name: 'msg', title: '消息', component: () => import('./routes/msg/Msg'),
    }]
  },
];

//替换的原因是因为分模块打包后，再刷新会根据路由直接跳转到子模块路由上去。为了能在panes上展现。
export const replacePath = (pathOld) => {
  let path = pathOld;
  path = path.replace('/xwrBasic/', '/');                // 基础
  path = path.replace('/xwrSale/', '/');                 // 销售
  path = path.replace('/xwrProduction/', '/');           // 生产
  path = path.replace('/xwrProductInventory/', '/');     // 产品库存
  path = path.replace('/xwrMaterialInventory/', '/');    // 材料库存
  path = path.replace('/xwrFinance/', '/');              // 财务
  path = path.replace('/xwrPurchase/', '/');             // 采购
  path = path.replace('/xwrOutside/', '/');              // 外协
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
mergeRouteInfo(routeInfoNew, xwrSaleRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrProductionRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrProductInventoryRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrMaterialInventoryRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrFinanceRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrPurchaseRouteInfo.routeInfo);
mergeRouteInfo(routeInfoNew, xwrOutsideRouteInfo.routeInfo);

export const routeInfo: any[] = [...routeInfoNew];