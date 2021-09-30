import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expect } from "chai";

import { createRootElement } from "../root";
import { getRowRenderCount, resetRowRenderCount } from "../lib/react-table";

describe("App", () => {
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
    expect(getLoggedOutStatus()).to.exist;

    // When: navigate to sign in
    userEvent.click(getSigninButton());

    // When: login with wrong password
    const usernameInput = screen.getByPlaceholderText("User name");
    const passwordInput = screen.getByPlaceholderText("Password (use 'p')");
    userEvent.type(usernameInput, "Lars");
    userEvent.type(passwordInput, "w");
    userEvent.click(getLoginButton());

    // Then: eventually see error message
    await screen.findByText("Error: Authorization failed");

    // When: login with correct password
    userEvent.type(passwordInput, "{backspace}p");
    userEvent.click(getLoginButton());

    // When: waiting for fetch
    await waitFor(getProfileButton);

    // Then: is on home page
    expect(getPeopleButton()).to.exist;

    // When: navigate to people page
    userEvent.click(getPeopleButton());

    // Then: eventually on people page
    expect(await screen.findByText("Ronja")).to.exist;

    // Then: each row rendered only once (but counted twice when running under vite dev server, but not the bundle)
    expect(getRowRenderCount()).to.equal(4);
    resetRowRenderCount();

    // Then: number of selected people is 0
    expect(
      screen
        .getAllByRole("checkbox")
        .filter((cb) => (cb as HTMLInputElement).checked)
    ).to.have.length(0);

    // When: select first person
    userEvent.click(screen.getAllByRole("checkbox")[1]); // Note: skipping header checkbox

    // Then: number of selected people is 1
    expect(
      screen
        .getAllByRole("checkbox")
        .filter((cb) => (cb as HTMLInputElement).checked)
    ).to.have.length(1);

    // Then: just that row is re-rendered
    expect(getRowRenderCount()).to.equal(1);
    resetRowRenderCount();

    // When: select all people
    userEvent.click(screen.getAllByRole("checkbox")[0]); // Note: header checkbox

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
    userEvent.click(screen.getByRole("button", { name: "Edit Adam" }));

    // Then: see edit form
    await screen.findAllByRole("button", { name: "Save name" });

    // When: change name and click save
    userEvent.type(screen.getByPlaceholderText("name"), "X");
    userEvent.click(screen.getByRole("button", { name: "Save name" }));

    // When: click close
    userEvent.click(screen.getByRole("button", { name: "Close AdamX" }));

    // Then: see updated name
    expect(await screen.findByText("AdamX")).to.exist;

    // Then: only that row was re-rendered
    expect(getRowRenderCount()).to.equal(1);

    // When: navigate back
    userEvent.click(screen.getByText("Back"));

    // Then: is on home page:
    await screen.findByText("Profile");
    expect(getProfileButton()).to.exist;

    // When: navigate to profile
    userEvent.click(getProfileButton());

    // When: waiting for lazy load
    await waitFor(getLoggedInStatus);

    // Then: is on profile page
    expect(getLoggedInStatus()).to.exist;
    expect(getLogoutButton()).to.exist;

    // When: logout
    userEvent.click(getLogoutButton());

    // Then: logged out
    expect(getLoggedOutStatus()).to.exist;
  });
});
