export interface AnyAction {
  type: string;
}

export interface PayloadAction<TPayload> extends AnyAction {
  type: string;
  payload: TPayload;
}

export interface AnyActionCreator {
  type: string;
}

export interface ActionCreator<Payload> extends AnyActionCreator {
  (payload: Payload): PayloadAction<Payload>;
}

export const isType = <Payload>(
  action: AnyAction,
  actionCreator: ActionCreator<Payload>
): action is PayloadAction<Payload> => {
  return action.type === actionCreator.type;
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
