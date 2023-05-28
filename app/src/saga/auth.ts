import auth from '../store/auth';
import { Saga } from '../store';

export const signingIn: Saga<{
  password: string;
  username: string;
}> = ({ password, username }) => async (dispatch) => {
  await Promise.resolve(); // Note: simulate server delay
  if (password === 'p') {
    dispatch(auth.actions.signin({ user: { name: username } }));
  } else {
    throw new Error('Authorization failed');
  }
};

export const signingOut: Saga = () => async (dispatch) => {
  dispatch(auth.actions.signout());
};
