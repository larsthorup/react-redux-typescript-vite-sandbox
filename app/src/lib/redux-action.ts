import { UnknownAction, isAction } from "redux"

export interface PayloadAction<TPayload> extends UnknownAction {
  type: string;
  payload: TPayload;
}

export interface UnknownActionCreator {
  type: string;
}

export interface ActionCreator<Payload> extends UnknownActionCreator {
  (payload: Payload): PayloadAction<Payload>;
}

export const isType = <Payload>(
  action: unknown,
  actionCreator: ActionCreator<Payload>
): action is PayloadAction<Payload> => {
  return isAction(action) && action.type === actionCreator.type;
};

export const createActionCreator = <Payload = void>(
  type: string
): ActionCreator<Payload> =>
  Object.assign(
    (payload: Payload) => {
      const action: PayloadAction<Payload> = {
        type,
        payload
      };
      return action;
    },
    {
      type,
      toString: () => type
    }
  ) as ActionCreator<Payload>;
