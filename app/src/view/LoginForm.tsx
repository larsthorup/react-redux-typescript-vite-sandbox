import React, { useState } from 'react';
import { historyReplace } from '../lib/redux-history';
import { useDispatch } from '../store';

import { signingIn } from '../saga/auth';
import useSaga from '../lib/useSaga';

const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setPassword(e.target.value);
  const onUsernameChange: React.ChangeEventHandler<HTMLInputElement> = (e) =>
    setUsername(e.target.value);
  const [
    signingInSaga,
    { error, isRunning: isAuthorizing },
  ] = useSaga(signingIn, { throwOnError: true });
  const onSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    try {
      await dispatch(signingInSaga({ password, username }));
      dispatch(historyReplace({ pathname: '/' }));
    } catch (err) {
      // handled with useSaga
    }
  };
  return (
    <form className="LoginForm" onSubmit={onSubmit}>
      <input
        name="username"
        placeholder="User name"
        value={username}
        onChange={onUsernameChange}
      />
      <br />
      <input
        name="password"
        placeholder="Password (use 'p')"
        value={password}
        onChange={onPasswordChange}
        type="password"
      />
      <br />
      {!isAuthorizing && <button type="submit">Login</button>}
      {error && <p>Error: {error.message}</p>}
      {isAuthorizing && <p>Authorizing...</p>}
    </form>
  );
};

export default LoginForm;
