import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrPurchase">完善店铺</a>
      <a href="/xwrPurchase/purchaseOrder">purchaseOrder</a>
    </div>
  );
}

export default connect()(IndexPage);
