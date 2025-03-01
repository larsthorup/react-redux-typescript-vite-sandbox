import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expect } from "chai";

import { getRowRenderCount as getRowRenderCountReal, resetRowRenderCount } from "../lib/react-table";
import { createRootElement } from "../root";

function getRowRenderCount() {
  const rowRenderCount = getRowRenderCountReal();
  console.log({ rowRenderCount });
  return rowRenderCount;
}

describe("App (in DOM)", function () {
  if (this) this.timeout(5000); // Note: only for Mocha

  it("auth flow", async () => {
    const getLoggedOutStatus = () => screen.getByText("Please");
    const getLoggedInStatus = () => screen.getByText("Lars");
    const getLogoutButton = () => screen.getByText("Logout");
    const getLoginButton = () => screen.getByText("Login");
    const getSigninButton = () => screen.getByText("Sign in");
    const getProfileButton = () => screen.getByText("Profile");
    const getPeopleButton = () => screen.getByText("People");

    // When: rendered
    render(createRootElement());

    // Then: is logged out
    expect(getLoggedOutStatus()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When: navigate to sign in
    await userEvent.click(getSigninButton());

    // When: login with wrong password
    const usernameInput = screen.getByPlaceholderText("User name");
    const passwordInput = screen.getByPlaceholderText("Password (use 'p')");
    await userEvent.type(usernameInput, "Lars");
    await userEvent.type(passwordInput, "w");
    await userEvent.click(getLoginButton());

    // Then: eventually see error message
    await screen.findByText("Error: Authorization failed");

    // When: login with correct password
    await userEvent.type(passwordInput, "{backspace}p");
    await userEvent.click(getLoginButton());

    // When: waiting for fetch
    await waitFor(getProfileButton);

    // Then: is on home page
    expect(getPeopleButton()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When: navigate to people page
    await userEvent.click(getPeopleButton());

    // Then: eventually on people page
    expect(await screen.findByText("Ronja")).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // Then: each row rendered only once (but counted twice when running under vite dev server, but not the bundle)
    expect(getRowRenderCount()).to.equal(4);
    resetRowRenderCount();
    expect(getRowRenderCount()).to.equal(0);

    // Then: number of selected people is 0
    expect(
      screen
        .getAllByRole("checkbox")
        .filter((cb) => (cb as HTMLInputElement).checked)
    ).to.have.length(0);

    // When: select first person
    expect(getRowRenderCount()).to.equal(0);
    await userEvent.click(screen.getAllByRole("checkbox")[1]); // Note: skipping header checkbox

    // Then: number of selected people is 1
    expect(
      screen
        .getAllByRole("checkbox")
        .filter((cb) => (cb as HTMLInputElement).checked)
    ).to.have.length(1);

    // Then: just that row is re-rendered
    // TODO: fix this!
    getRowRenderCount(); // expect(getRowRenderCount()).to.equal(1);
    resetRowRenderCount();

    // When: select all people
    await userEvent.click(screen.getAllByRole("checkbox")[0]); // Note: header checkbox

    // Then: number of selected people is 4
    expect(
      screen
        .getAllByRole("checkbox")
        .filter((cb) => (cb as HTMLInputElement).checked)
    ).to.have.length(5); // Note: including header checkbox

    // Then: all rows are re-rendered
    expect(getRowRenderCount()).to.equal(4);
    resetRowRenderCount();

    // When: click first edit button
    await userEvent.click(screen.getByRole("button", { name: "Edit Adam" }));

    // Then: see edit form
    await screen.findAllByRole("button", { name: "Save name" });

    // When: change name and click save
    await userEvent.type(screen.getByPlaceholderText("name"), "X");
    await userEvent.click(screen.getByRole("button", { name: "Save name" }));

    // When: click close
    await userEvent.click(screen.getByRole("button", { name: "Close AdamX" }));

    // Then: see updated name
    expect(await screen.findByText("AdamX")).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // Then: only that row was re-rendered
    expect(getRowRenderCount()).to.equal(1);
    resetRowRenderCount();

    // When: add new person
    await userEvent.click(screen.getByRole("button", { name: "Add one more" }));
    
    // Then: see added person
    expect(await screen.findByText("Unnamed")).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // Then: only all rows are re-rendered
    // TODO: avoid re-rendering all rows including the new one
    expect(getRowRenderCount()).to.equal(5);
    resetRowRenderCount();

    // When: navigate back
    await userEvent.click(screen.getByText("Back"));

    // When: navigate to task page
    await userEvent.click(screen.getByText("Tasks"));

    // Then: eventually on task page
    expect(await screen.findByText("Swim")).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // Then: each row rendered only once
    expect(getRowRenderCount()).to.equal(4);
    resetRowRenderCount();

    // When: click edit button
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));

    // Then: see edit form
    await screen.findAllByRole("button", { name: "Save" });

    // Then: each row rendered only once
    expect(getRowRenderCount()).to.equal(4);
    resetRowRenderCount();

    // When: change name and click save
    expect(
      (screen.getAllByPlaceholderText("title")[2] as HTMLInputElement).value
    ).to.equal("Swim");
    await userEvent.type(screen.getAllByPlaceholderText("title")[2], "ming");

    // Then: only that row was re-rendered
    expect(getRowRenderCount()).to.equal(1);
    resetRowRenderCount();

    // When: click save button
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    // Then: updated value is shown
    expect(await screen.findByText("Swimming")).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When: navigate back
    await userEvent.click(screen.getByText("Back"));

    // Then: is on home page:
    await screen.findByText("Profile");
    expect(getProfileButton()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When: navigate to profile
    await userEvent.click(getProfileButton());

    // When: waiting for lazy load
    await waitFor(getLoggedInStatus);

    // Then: is on profile page
    expect(getLoggedInStatus()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions
    expect(getLogoutButton()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions

    // When: logout
    await userEvent.click(getLogoutButton());

    // Then: logged out
    expect(getLoggedOutStatus()).to.exist; // eslint-disable-line @typescript-eslint/no-unused-expressions
  });
});
