import { act, getNodeText, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect } from "chai";
import React, { ReactElement } from "react";
import * as ReactRedux from "react-redux";
import * as Redux from "redux";

import * as ReactReduxHistory from "./react-redux-history";
import * as ReduxHistory from "./redux-history";

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
  const history = ReduxHistory.createHistory();
  const middleware = Redux.compose(
    Redux.applyMiddleware(
      ReduxHistory.createMiddleware(locationSlicer, history)
    )
  );
  const store: Store = Redux.createStore(rootReducer, middleware);
  ReduxHistory.listen(store, history);
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
  const { container, debug, getByText, findByText } = render(rootComponent);
  // debug(container);

  // then initially Home is rendered
  expect(getByText("Home")).to.exist;

  // when navigating
  await userEvent.click(getByText("Login"));

  // then Signin is rendered
  await findByText("Signin");

  // when clicking browser back
  act(() => {
    history.back();
  });

  // then Home is rendered
  await findByText("Home");

  // when navigating with hash parameter
  await userEvent.click(getByText("Profile"));

  // then Profile is rendered with that parameter
  await findByText("Profile-%20-all");

  // when navigating to non-existing page
  act(() => {
    history.push("/notyet");
  });

  // then nothing is rendered
  expect(getNodeText(container)).to.equal("");

  // navigate back
  act(() => {
    history.back();
  });

  // then previous page (Profile with that parameter) is rendered
  await findByText("Profile-%20-all");

  // navigate back once more
  history.back();

  // then previous page (Home) is rendered
  await findByText("Home");
});
