import * as React from 'react';
import { Route, Switch, routerRedux } from 'dva/router';
import dynamic from 'dva/dynamic';
import { Layout } from 'antd';

const { ConnectedRouter } = routerRedux;
function RouterConfig(history: any, app: any) {
  const routeInfo: any[] = [];
  const routeIndex = {
    path: '/', name: 'index', layout: Layout, component: () => import('./routes/IndexPage'),
  };
  routeInfo.push(routeIndex);

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
              // component={Component}
            />
          );
        })
      }
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;
