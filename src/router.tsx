import * as React from 'react';
import { Route, Switch, routerRedux } from 'dva/router';
import dynamic from 'dva/dynamic';
import { Layout } from 'antd';

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  const routeInfo: any[] = [{
      path: '/', name: 'index', component: () => import('./routes/IndexPage'),
  }, {
      path: '/register', name: 'register', component: () => import('./routes/Register'),
  }, {
    path: '/login', name: 'login', component: () => import('./routes/Login'),
  }, {
    path: '/loginManage', name: 'loginManage', component: () => import('./routes/manage/LoginManage'),
  }, {
    path: '/indexManage', name: 'indexManage', component: () => import('./routes/manage/IndexManage'),
    children: {
      path: '/config', name: 'config', component: () => import('./routes/manage/LoginManage'),
    }
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
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
