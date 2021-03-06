import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { socketMiddleware } from './socketClient';
import rootReducer from './reducers';

import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// Thunk middleware: if you dispatch a function, Redux Thunk middleware will give it dispatch as an argument
const store = createStore(
  rootReducer,
  applyMiddleware(thunkMiddleware, socketMiddleware)
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

registerServiceWorker();
