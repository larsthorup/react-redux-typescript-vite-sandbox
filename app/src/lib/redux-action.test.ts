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
    const signoutAction = signout();
    expect(isType(signinAction, signin)).to.be.true;
    expect(isType(signinAction, signout)).to.be.false;
    if (isType(signinAction, signin)) {
      expect(signinAction.payload.name).to.equal("ulrik");
    } else {
      expect.fail();
    }
  });
});
