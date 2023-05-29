import React, { Suspense } from "react";
import { Routes } from "../lib/react-redux-history";

import { useRoutes } from "../store";
import Home from "./Home";
import LoginForm from "./LoginForm";

import "./App.css";

const Profile = React.lazy(() => import("./Profile"));
const People = React.lazy(() => import("./People"));
const Tasks = React.lazy(() => import("./Tasks"));

export const homePath = "/";
export const signinPath = "/signin";
export const profilePath = "/profile";
export const peoplePath = "/people";
export const tasksPath = "/tasks";
const routes: Routes = {
  [homePath]: <Home />,
  [signinPath]: <LoginForm />,
  [profilePath]: <Profile />,
  [peoplePath]: <People />,
  [tasksPath]: <Tasks />,
};

const App: React.FC = () => {
  const routeResult = useRoutes(routes);
  const Loading = () => <div>Loading...</div>;
  return (
    <div className="App">
      <header className="App-header">
        <Suspense fallback={<Loading />}>{routeResult}</Suspense>
      </header>
    </div>
  );
};

export default App;
