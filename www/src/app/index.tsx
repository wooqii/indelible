import * as React from 'react';
import { hot } from 'react-hot-loader';
import { Router, Route, Switch } from 'react-router';
import { Root } from 'app/containers/Root';
import { Posts } from 'app/containers/Posts';

// render react DOM
export const App = hot(module)(({ history }) => (
  <Root>
    <Router history={history}>
      <Switch>
        <Route path="/" component={Posts} />
      </Switch>
    </Router>
  </Root>
));
