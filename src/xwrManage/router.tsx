import * as React from 'react';
import { Route, Switch, routerRedux, Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';
import { Layout } from 'antd';
import {routeInfo} from "./routeInfo";

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {


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
