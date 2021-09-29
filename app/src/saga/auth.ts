import auth from '../store/auth';
import { Saga } from '../store';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const signingIn: Saga<{
  password: string;
  username: string;
}> = ({ password, username }) => async (dispatch) => {
  await wait(500); // Note: simulating slow fetch
  if (password === 'p') {
    dispatch(auth.actions.signin({ user: { name: username } }));
  } else {
    throw new Error('Authorization failed');
  }
};

export const signingOut: Saga = () => async (dispatch) => {
  dispatch(auth.actions.signout());
};
