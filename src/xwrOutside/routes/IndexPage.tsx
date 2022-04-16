import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrOutside">完善店铺</a>
      <a href="/xwrOutside/outsideOrder">saleOrder</a>
    </div>
  );
}

export default connect()(IndexPage);
