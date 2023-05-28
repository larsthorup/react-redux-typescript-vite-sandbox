import React, { ReactElement } from "react";
import App from "./view/App";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";
import ReduxThunk from "redux-thunk";
import * as ReduxHistory from "./lib/redux-history";
import { rootReducer, Store, locationSlicer } from "./store";

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
  const middleware = composeEnhancers(
    Redux.applyMiddleware(ReduxThunk),
    Redux.applyMiddleware(historyMiddleware)
  );
  const store = Redux.createStore(rootReducer, middleware);
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
