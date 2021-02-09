import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/IndexPage">完善店铺</a>
      <a href="/IndexPage">发布课程</a>
      <a href="/aaa">register</a>
    </div>
  );
}

export default connect()(IndexPage);
