import * as React from 'react';
import { connect } from 'dva';

function IndexPage() {
  return (
    <div>
      <a href="/xwrProductInventory">完善店铺</a>
      <a href="/xwrProductInventory/productStorage">saleOrder</a>
    </div>
  );
}

export default connect()(IndexPage);
