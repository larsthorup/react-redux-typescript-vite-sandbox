import { expect } from "chai";

import { createActionCreator, isType } from "./redux-action";

describe("redux-action", () => {
  it("createActionCreator", () => {
    const signin = createActionCreator<{ name: string }>("SIGNIN");
    const signinAction = signin({ name: "ulrik" });
    expect(signinAction).to.deep.equal({
      type: "SIGNIN",
      payload: {
        name: "ulrik",
      },
    });
    expect(signin.toString()).to.equal("SIGNIN");
  });

  it("isType", () => {
    const signin = createActionCreator<{ name: string }>("SIGNIN");
    const signout = createActionCreator("SIGNOUT");
    const signinAction = signin({ name: "ulrik" });
    expect(isType(signinAction, signin)).to.be.true; // eslint-disable-line @typescript-eslint/no-unused-expressions
    expect(isType(signinAction, signout)).to.be.false; // eslint-disable-line @typescript-eslint/no-unused-expressions
    if (isType(signinAction, signin)) {
      expect(signinAction.payload.name).to.equal("ulrik");
    } else {
      expect.fail();
    }
  });
});
