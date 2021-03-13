import * as React from 'react';
import { connect } from 'dva';


function IndexPage({ commonModel }) {
  return (
    <div>
      <a href="/xwrManage">管理主页</a>
      <a href="/xwrManage/register">register</a>
      <a href="/xwrManage/login">login</a>
      <div>{commonModel.userInfo.userName}</div>
    </div>
  );
}

export default connect(({ commonModel } : { commonModel: any }) => ({ commonModel }))(IndexPage);
