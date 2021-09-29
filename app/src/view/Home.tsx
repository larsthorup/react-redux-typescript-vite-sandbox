import React from "react";
import { useNavigate } from "../lib/react-redux-history";

import { useSelector } from "../store";

const Home: React.FC = () => {
  const user = useSelector((state) => state.auth.user);
  // const navigate = useNavigate();
  const replace = useNavigate({ replace: true });
  const loggedIn = !!user;
  const status = loggedIn ? (
    <p>
      {/* <button onClick={navigate("/profile")}>Profile</button> */}
      {/* <button onClick={navigate("/people")}>People</button> */}
    </p>
  ) : (
    <p>
      Please
      <button onClick={replace("/signin")}>Sign in</button>
    </p>
  );
  return <div className="Home">{status}</div>;
};

export default Home;
