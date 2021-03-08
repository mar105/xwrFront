import * as React from 'react';
import { connect } from 'dva';

function IndexManage() {
  return (
    <div>
      <a href="/IndexManage">管理主页</a>
      <a href="/IndexPage">发布课程</a>
      <a href="/register">register</a>
      <a href="/loginManage">login</a>
    </div>
  );
}

export default connect()(IndexManage);
