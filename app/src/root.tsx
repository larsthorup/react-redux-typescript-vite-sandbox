import React, { ReactElement } from "react";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";
import { thunk } from "redux-thunk";
import * as ReduxHistory from "./lib/redux-history";
import { rootReducer, Store, locationSlicer } from "./store";

import App from "./view/App";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof Redux.compose;
  }
}

export const createRootElement = (): ReactElement => {
  const store = setupStore();
  return connect(<App />, store);
};

export const setupStore = (): Store => {
  const history = ReduxHistory.createHistory();
  const historyMiddleware = ReduxHistory.createMiddleware(locationSlicer, history);
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || Redux.compose;
  const middleware = [thunk, historyMiddleware];
  const storeEnhancer = composeEnhancers(Redux.applyMiddleware(...middleware));
  const store = Redux.legacy_createStore(rootReducer, storeEnhancer);
  ReduxHistory.listen(store, history);
  return store;
};

export const connect = (element: ReactElement, store: Store): ReactElement => {
  return (
    <ReactRedux.Provider store={store}>
      <React.StrictMode>{element}</React.StrictMode>
    </ReactRedux.Provider>
  );
};
