import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { history } from './helpers';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import rootReducer from './reducers';
import AppComponent from './app/AppComponent';
import '@patternfly/react-core/dist/styles/base.css';
import { routerMiddleware } from 'connected-react-router';
import { initMigMeta } from './mig_meta';

const middleware = applyMiddleware(thunk, logger, routerMiddleware(history));
const store = createStore(rootReducer, middleware);

// Some amount of meta data is delievered to the app by the server that
// we need to pick off of the window and insert into the redux tree
const migMeta = window['_mig_meta'];
store.dispatch(initMigMeta(migMeta))

render(
  <Provider store={store}>
    <AppComponent />
  </Provider>,
  document.getElementById('root'),
);
