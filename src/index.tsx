import dva from 'dva';
import { createBrowserHistory } from 'history';
import { message } from 'antd';
import './index.css';
import 'antd/dist/antd.css';

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
