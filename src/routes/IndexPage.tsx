import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrManage">进入管理系统</a>
      <a href="/xwrBasic">进入基础信息</a>
      <a href="/register">register</a>
      <a href="/login">login</a>
    </div>
  );
}

export default connect()(IndexPage);
