import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';

import { App } from 'app';
import { createStores } from 'app/stores';

const fixtures = [
  // new PostModel({ title: 'Title1', body: 'Subject SUbject Usbject' })
];

// prepare MobX stores
const history = createBrowserHistory();
const rootStore = createStores(history, fixtures);

// render react DOM
ReactDOM.render(
  <Provider {...rootStore}>
    <App history={history} />
  </Provider>,
  document.getElementById('root')
);
