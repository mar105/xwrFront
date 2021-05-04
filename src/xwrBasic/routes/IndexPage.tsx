import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrBasic">完善店铺</a>
      <a href="/xwrBasic/customer">customer</a>
    </div>
  );
}

export default connect()(IndexPage);
