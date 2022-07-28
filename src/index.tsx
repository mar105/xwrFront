/*
 * @Author: xulinyu xlyhacker@gmail.com
 * @Date: 2022-07-25 21:50:19
 * @LastEditors: xulinyu xlyhacker@gmail.com
 * @LastEditTime: 2022-07-28 22:18:35
 * @FilePath: \xwrFront\src\index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import dva from 'dva';
import { createBrowserHistory } from 'history';
import { message } from 'antd';
import 'antd/dist/antd.less';

// 1. Initialize
const app = dva({
  history: createBrowserHistory(),
  onError(err) {
    message.destroy();
    message.error(err.message);
  },
});

// 2. Plugins
// app.use({});

// 3. Model
// app.model(require('./models/example').default);
app.model(require('./models/commonModel').default);

// 4. Router
app.router(require('./router').default);

// 5. Start
app.start('#root');
