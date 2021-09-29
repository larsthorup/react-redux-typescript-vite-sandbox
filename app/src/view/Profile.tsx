import React, { useState, useCallback } from 'react';
import { useNavigate } from '../lib/react-redux-history';
import { historyReplace } from '../lib/redux-history';

import { useDispatch, useSelector } from '../store';
import { signingOut } from '../saga/auth';
import auth, { User } from '../store/auth';
import TextField from './TextField';

const LoggedIn: React.FC<{ user: User }> = ({ user }) => {
  const dispatch = useDispatch();
  const [isEditEnabled, setIsEditEnabled] = useState(false);
  const logoutHandler = () => {
    dispatch(signingOut());
    dispatch(historyReplace({ pathname: '/' }));
  };
  const nameChangeHandler = useCallback(
    (name: string) => {
      dispatch(auth.actions.changeUserName({ name }));
    },
    [dispatch]
  );
  const editHandler = () => {
    setIsEditEnabled(true);
  };
  const cancelHandler = () => {
    setIsEditEnabled(false);
  };
  return (
    <>
      <p>
        {!isEditEnabled && (
          <>
            <span>{user.name}</span>
            <button onClick={editHandler}>Edit</button>
          </>
        )}
        {isEditEnabled && (
          <>
            <TextField
              label="user name"
              value={user.name}
              onChange={nameChangeHandler}
            />
            <button onClick={cancelHandler}>Cancel</button>
          </>
        )}
      </p>
      <p>
        <button onClick={logoutHandler}>Logout</button>
      </p>
    </>
  );
};

const NotLoggedIn: React.FC = () => {
  return <p>Not logged in</p>;
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const profile = user ? <LoggedIn user={user} /> : <NotLoggedIn />;
  return (
    <div className="Profile">
      {profile}
      <button onClick={navigate('/')}>Home</button>
    </div>
  );
};

export default Profile;
