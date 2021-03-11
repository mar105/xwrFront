import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/IndexPage">管理主页</a>
      <a href="/IndexPage">发布课程</a>
      <a href="/register">register</a>
      <a href="/xwrManage/login">login</a>
    </div>
  );
}

export default connect()(IndexPage);
