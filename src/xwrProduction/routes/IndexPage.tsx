import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrProduction">完善店铺</a>
      <a href="/xwrProduction/workOrder">saleOrder</a>
    </div>
  );
}

export default connect()(IndexPage);
