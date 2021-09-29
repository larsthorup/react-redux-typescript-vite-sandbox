import { expect } from "chai";
import * as Redux from "redux";
import * as History from "history";

import * as ReduxHistory from "./redux-history";

it("redux-history", () => {
  // given initial setup
  const rootReducer = Redux.combineReducers({
    location: ReduxHistory.reducer,
  });
  type RootState = ReturnType<typeof rootReducer>;
  const locationSlicer = (state: RootState) => state.location;
  const middleware = Redux.compose(
    Redux.applyMiddleware(ReduxHistory.createMiddleware(locationSlicer))
  );
  const store: Redux.Store = Redux.createStore(rootReducer, middleware);
  ReduxHistory.listen(store);

  // then initial route is '/'
  expect(ReduxHistory.history.location.pathname).to.equal("/");
  expect(store.getState().location.pathname).to.equal("/");

  // when dispatching historyPush action
  store.dispatch(ReduxHistory.historyPush({ pathname: "/signin" }));

  // then route is '/signin'
  expect(ReduxHistory.history.location.pathname).to.equal("/signin");
  expect(store.getState().location.pathname).to.equal("/signin");

  // when dispatching historyPush action
  store.dispatch(ReduxHistory.historyReplace({ pathname: "/" }));

  // then route is '/'
  expect(ReduxHistory.history.location.pathname).to.equal("/");
  expect(store.getState().location.pathname).to.equal("/");
});
