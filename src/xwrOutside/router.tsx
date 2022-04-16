import * as React from 'react';
import { Route, Switch, routerRedux, Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';
import {routeInfo} from "./routeInfo";

const { ConnectedRouter } = routerRedux;

function RouterConfig({ history, app }) {
  // 递归实现路由的方法
  const mapRouteMethod = (routeArr) => {
    return routeArr.map(({ path, children, ...dynamics }, index) => {
      // @ts-ignore
      const Component: any = dynamic({ app, ...dynamics });
      if (children) {
        return <Route key={index} path={path} render={(props) => {
          return (<Component {...props}> {mapRouteMethod(children)} </Component>)
        }} />
      } else {
        return <Route key={index} path={path} exact render={(props) => {return <Component {...props} /> } } />
      }
    })
  }
  return (
    <ConnectedRouter history={history}>
      <Switch>
        {mapRouteMethod(routeInfo)}
        <Redirect to="/xwrOutside"/>
      </Switch>
    </ConnectedRouter>
  );
}

export default RouterConfig;