import * as React from 'react';
import { Route, Switch, routerRedux, Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';
import { Layout } from 'antd';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routeInfo: any[] = [{
    path: '/xwrManage/login', layout: Layout, name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/xwrManage/register', layout: Layout, name: 'register', component: () => import('./routes/Register'),
  }, {
    path: '/xwrManage', layout: Layout, name: 'index', component: () => import('./routes/IndexPage'),
    }, {
    path: '/xwrManage/route', name: 'module', component: () => import('./routes/Route'),
  }, {
  //   path: '/indexManage', name: 'indexManage', component: () => import('./routes/manage/IndexManage'),
  //   children: {
  //     path: '/config', name: 'config', component: () => import('./routes/manage/LoginManage'),
  //   }
  },

  ];
  // const routeIndex = {
  //     path: '/', name: 'index', layout: Layout, components: () => import('./routes/IndexPage'),
  // };
  // routeInfo.push(routeIndex);

  return (
    <ConnectedRouter history={history}>
      <Switch>
        {
        routeInfo.map(({ path, name, layout, ...dynamics }) => {
          const Component: any = dynamic({ app, ...dynamics });
          return (
            <Route
              path={path}
              key={name}
              exact
              render={(props) => {
                if (layout) {
                  return <Layout><Component {...props} /></Layout>;
                }
                return <Component {...props} />;
              }}
              // components={Component}
            />
          );
        })
      }
      <Redirect to="/xwrManage"/>
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
