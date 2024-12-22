import queryString from "query-string";
import * as R from "ramda";
import { UnknownAction, Middleware, Store } from "redux";
import * as History from "history";
import { createActionCreator, isType } from "./redux-action";

// Note: this library is a simple implementation of a Redux-first router
// inspired by this blog post: https://www.freecodecamp.org/news/an-introduction-to-the-redux-first-routing-model-98926ebf53cb/

// Also described in this blog post: https://www.fullstackagile.eu/2020/03/04/routing/

export const createHistory = () => History.createBrowserHistory();

// In Redux we prefer to work with `hash` and `search` elements as destructured objects,
// instead of the string returned by the raw `history` API
export type State = Readonly<{
  hash: queryString.ParsedQuery<string>;
  pathname: string;
  search: queryString.ParsedQuery<string>;
}>;

export type Props = Readonly<{
  hash?: queryString.ParsedQuery<string>;
  pathname: string;
  search?: queryString.ParsedQuery<string>;
}>;

const stringifyWithPrefix = (
  prefix: string,
  hash: queryString.ParsedQuery<string>
) => {
  const hashString = queryString.stringify(hash);
  return hashString === "" ? "" : prefix + hashString;
};

const stringify = (state: State): History.Location => {
  return {
    hash: stringifyWithPrefix("#", state.hash),
    key: "default",
    pathname: state.pathname,
    search: stringifyWithPrefix("?", state.search),
    state: null,
  };
};

const stringifyPayload = (payload: Props): History.Location => {
  return stringify({
    hash: payload.hash || {},
    pathname: payload.pathname,
    search: payload.search || {},
  });
};

// Redux action to dispatch in the history listener below. Not for use outside this library
const locationChanged = createActionCreator<History.Location>(
  "locationChanged"
);

// Redux actions to update location state
export const historyBack = createActionCreator("historyBack");
export const historyPush = createActionCreator<Props>("historyPush");
export const historyReplace = createActionCreator<Props>("historyReplace");

export const initialState: State = {
  hash: {},
  pathname: "/",
  search: {},
};

export const reducer = (
  state: State = initialState,
  action: UnknownAction
): State => {
  // Note: historyPush and historyReplace actions are not handled in the reducer
  // instead they are handled in the middleware below where the URL will be
  // updated through the history API. This update will fire a historyChange action
  // causing the redux state to be updated accordingly
  if (isType(action, locationChanged)) {
    const location = {
      hash: queryString.parse(action.payload.hash) || {},
      pathname: action.payload.pathname,
      search: queryString.parse(action.payload.search) || {},
    };
    // console.log("locationChanged", location, state);
    return R.equals(state, location) ? state : location;
  } else {
    return state;
  }
};

// The middleware execute side effects against the history API for history actions
export const createMiddleware = <TRootState extends object>(slicer: Slicer<TRootState>, history: History.BrowserHistory): Middleware => {
  return (store) => (next) => (action: unknown) => {
    const state = slicer(store.getState());
    if (isType(action, historyBack)) {
      history.back();
    } else if (isType(action, historyPush)) {
      const { payload } = action;
      if (!R.equals(state, payload)) {
        history.push(stringifyPayload(payload));
      }
    } else if (isType(action, historyReplace)) {
      const { payload } = action;
      if (!R.equals(state, payload)) {
        history.replace(stringifyPayload(payload));
      }
    } else {
      next(action);
    }
  };
};

export interface Listener {
  unlisten: () => void;
}

// Note: update redux state with the initial location from the history API
// and attach a listener to get convert all URL updates into dispatched historyChange actions
export const listen = (store: Store, history: History.BrowserHistory): Listener => {
  const unlisten = history.listen(({ location }) => {
    store.dispatch(locationChanged(location));
  });
  const { location } = history;
  store.dispatch(
    locationChanged({
      ...location,
      pathname: location.pathname,
    })
  );
  return { unlisten };
};

export type Slicer<TRootState extends object> = (state: TRootState) => State;
