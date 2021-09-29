import { expect } from "chai";
import React, { ReactElement } from "react";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
import {
  fireEvent,
  render,
  waitFor,
  getNodeText,
} from "@testing-library/react";

import * as ReduxHistory from "./redux-history";
import * as ReactReduxHistory from "./react-redux-history";

it("react-redux-history", async () => {
  // given initial setup
  const rootReducer = Redux.combineReducers({
    location: ReduxHistory.reducer,
  });
  type RootState = ReturnType<typeof rootReducer>;
  type Store = Redux.Store<RootState>;
  const locationSlicer = (state: RootState) => state.location;
  const usePath = <T extends {}>(routePath: string): T =>
    ReactReduxHistory.usePath(routePath, locationSlicer);
  const useHash = <T extends {}>(): T =>
    ReactReduxHistory.useHash(locationSlicer);
  const useRoutes = (routes: ReactReduxHistory.Routes) =>
    ReactReduxHistory.useRoutes(routes, locationSlicer);
  const middleware = Redux.compose(
    Redux.applyMiddleware(ReduxHistory.createMiddleware(locationSlicer))
  );
  const store: Store = Redux.createStore(rootReducer, middleware);
  ReduxHistory.listen(store);
  const RoutePath = {
    Home: "/",
    Profile: "/profile/:id",
    Signin: "/signin",
  };
  const Home = () => {
    const navigate = ReactReduxHistory.useNavigate();
    return (
      <>
        <div>Home</div>
        <button onClick={navigate(RoutePath.Signin)}>Login</button>
        <button
          onClick={navigate(RoutePath.Profile, { id: "%20" }, { tab: "all" })}
        >
          Profile
        </button>
      </>
    );
  };
  const Signin = () => <div>Signin</div>;
  const Profile = () => {
    const { id } = usePath<{ id: string }>(RoutePath.Profile);
    const { tab } = useHash<{ tab: string }>();
    return (
      <div>
        Profile-{id}-{tab}
      </div>
    );
  };
  const routes: ReactReduxHistory.Routes = {
    [RoutePath.Home]: <Home />,
    [RoutePath.Profile]: <Profile />,
    [RoutePath.Signin]: <Signin />,
  };
  const App = () => {
    const routeResult = useRoutes(routes);
    return <>{routeResult}</>;
  };
  const rootComponent: ReactElement = (
    <ReactRedux.Provider store={store}>
      <App />
    </ReactRedux.Provider>
  );
  const { container, debug, getByText } = render(rootComponent);
  debug(container);

  // then initially Home is rendered
  expect(getByText("Home")).to.exist;

  // when navigating
  fireEvent.click(getByText("Login"));

  // then Signin is rendered
  await waitFor(() => getByText("Signin"));

  // when clicking browser back
  ReduxHistory.history.back();

  // then Home is rendered
  await waitFor(() => getByText("Home"));

  // when navigating with hash parameter
  fireEvent.click(getByText("Profile"));

  // then Profile is rendered with that parameter
  await waitFor(() => getByText("Profile-%20-all"));

  // when navigating to non-existing page
  ReduxHistory.history.push("/notyet");

  // then nothing is rendered
  expect(getNodeText(container)).to.equal("");

  // navigate back twice
  ReduxHistory.history.back();
  ReduxHistory.history.back();

  // then Home is rendered
  await waitFor(() => getByText("Home"));
});
