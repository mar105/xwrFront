import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrSale">完善店铺</a>
      <a href="/xwrSale/saleOrder">saleOrder</a>
    </div>
  );
}

export default connect()(IndexPage);
