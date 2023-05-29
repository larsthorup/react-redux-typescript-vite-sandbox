import TestRenderer, { act } from "react-test-renderer";

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// import { getRowRenderCount, resetRowRenderCount } from "../lib/react-table";
import { createRootElement } from "../root";
import { BrowserHistory, createBrowserHistory } from "history";
import { homePath, signinPath } from "./App";

vi.hoisted(() => vi.stubGlobal("window", {}));
vi.mock("history", () => ({
  createBrowserHistory: vi.fn(),
}));

// console.log(JSON.stringify(toJSON(), null, 2));
// await new Promise((resolve) => setTimeout(resolve, 1000));

describe("App (react)", function () {
  beforeEach(() => {
    vi.mocked(createBrowserHistory).mockClear();
  });
  describe(homePath, () => {
    it("enables user to go to login screen", () => {
      // Given: setup
      vi.mocked(createBrowserHistory).mockReturnValue({
        listen: vi.fn(),
        location: {
          pathname: homePath,
        },
        replace: vi.fn(),
      } as unknown as BrowserHistory);
      const rootElement = createRootElement();
      const { replace } = vi.mocked(createBrowserHistory).mock.results[0].value;

      // When: rendered
      const { root } = TestRenderer.create(rootElement);

      // Then: user is on home screen, because they are not logged in
      const signinButton = root.findByProps({ children: "Sign in" });

      // When: navigate to sign in
      signinButton.props.onClick({ preventDefault: vi.fn() });

      // Then: navigation to Signin page
      expect(replace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: signinPath })
      );
    });
  });

  describe(signinPath, () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should let the user login", async () => {
      // Given: setup
      // TODO: extract
      vi.mocked(createBrowserHistory).mockReturnValue({
        listen: vi.fn(),
        location: {
          pathname: signinPath,
        },
        replace: vi.fn(),
      } as unknown as BrowserHistory);
      const rootElement = createRootElement();
      const { replace } = vi.mocked(createBrowserHistory).mock.results[0].value;

      // When: rendered
      const { root, toJSON } = TestRenderer.create(rootElement);

      // When: login with wrong password
      const usernameInput = root.findByProps({ placeholder: "User name" });
      usernameInput.props.onChange({ target: { value: "Lars" } });
      const passwordInput = root.findByProps({
        placeholder: "Password (use 'p')",
      });
      passwordInput.props.onChange({ target: { value: "w" } });
      const form = root.findByType("form");
      form.props.onSubmit({ preventDefault: vi.fn() });

      // Then: show loading indicator
      root.findByProps({ children: "Authorizing..." });

      // Then: eventually show error message
      expect(vi.getTimerCount()).to.equal(1); // Note: auth delay
      await vi.runAllTimersAsync(); // Note: flush pending timers and promises
      root.findByProps({ children: "Error: Authorization failed" });

      // When: login with correct password
      passwordInput.props.onChange({ target: { value: "p" } });
      form.props.onSubmit({ preventDefault: vi.fn() });

      // Then: show loading indicator
      root.findByProps({ children: "Authorizing..." });

      // Then: eventually navigate to Home page
      expect(vi.getTimerCount()).to.equal(1); // Note: auth delay
      await vi.runAllTimersAsync(); // Note: flush pending timers and promises
      expect(replace).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: homePath })
      );
    });
  });

  it("app flow", async () => {
    // // When: navigate to people page
    // await userEvent.click(getPeopleButton());
    // // Then: eventually on people page
    // expect(await screen.findByText("Ronja")).to.exist;
    // // Then: each row rendered only once (but counted twice when running under vite dev server, but not the bundle)
    // expect(getRowRenderCount()).to.equal(4);
    // resetRowRenderCount();
    // // Then: number of selected people is 0
    // expect(
    //   screen
    //     .getAllByRole("checkbox")
    //     .filter((cb) => (cb as HTMLInputElement).checked)
    // ).to.have.length(0);
    // // When: select first person
    // await userEvent.click(screen.getAllByRole("checkbox")[1]); // Note: skipping header checkbox
    // // Then: number of selected people is 1
    // expect(
    //   screen
    //     .getAllByRole("checkbox")
    //     .filter((cb) => (cb as HTMLInputElement).checked)
    // ).to.have.length(1);
    // // Then: just that row is re-rendered
    // expect(getRowRenderCount()).to.equal(1);
    // resetRowRenderCount();
    // // When: select all people
    // await userEvent.click(screen.getAllByRole("checkbox")[0]); // Note: header checkbox
    // // Then: number of selected people is 4
    // expect(
    //   screen
    //     .getAllByRole("checkbox")
    //     .filter((cb) => (cb as HTMLInputElement).checked)
    // ).to.have.length(5); // Note: including header checkbox
    // // Then: all rows are re-rendered
    // expect(getRowRenderCount()).to.equal(4);
    // resetRowRenderCount();
    // // When: click first edit button
    // await userEvent.click(screen.getByRole("button", { name: "Edit Adam" }));
    // // Then: see edit form
    // await screen.findAllByRole("button", { name: "Save name" });
    // // When: change name and click save
    // await userEvent.type(screen.getByPlaceholderText("name"), "X");
    // await userEvent.click(screen.getByRole("button", { name: "Save name" }));
    // // When: click close
    // await userEvent.click(screen.getByRole("button", { name: "Close AdamX" }));
    // // Then: see updated name
    // expect(await screen.findByText("AdamX")).to.exist;
    // // Then: only that row was re-rendered
    // expect(getRowRenderCount()).to.equal(1);
    // resetRowRenderCount();
    // // When: add new person
    // await userEvent.click(screen.getByRole("button", { name: "Add one more" }));
    // // Then: see added person
    // expect(await screen.findByText("Unnamed")).to.exist;
    // // Then: only all rows are re-rendered
    // // TODO: avoid re-rendering all rows including the new one
    // expect(getRowRenderCount()).to.equal(5);
    // resetRowRenderCount();
    // // When: navigate back
    // await userEvent.click(screen.getByText("Back"));
    // // When: navigate to task page
    // await userEvent.click(screen.getByText("Tasks"));
    // // Then: eventually on task page
    // expect(await screen.findByText("Swim")).to.exist;
    // // Then: each row rendered only once
    // expect(getRowRenderCount()).to.equal(4);
    // resetRowRenderCount();
    // // When: click edit button
    // await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    // // Then: see edit form
    // await screen.findAllByRole("button", { name: "Save" });
    // // Then: each row rendered only once
    // expect(getRowRenderCount()).to.equal(4);
    // resetRowRenderCount();
    // // When: change name and click save
    // expect(
    //   (screen.getAllByPlaceholderText("title")[2] as HTMLInputElement).value
    // ).to.equal("Swim");
    // await userEvent.type(screen.getAllByPlaceholderText("title")[2], "ming");
    // // Then: only that row was re-rendered
    // expect(getRowRenderCount()).to.equal(1);
    // resetRowRenderCount();
    // // When: click save button
    // await userEvent.click(screen.getByRole("button", { name: "Save" }));
    // // Then: updated value is shown
    // expect(await screen.findByText("Swimming")).to.exist;
    // // When: navigate back
    // await userEvent.click(screen.getByText("Back"));
    // // Then: is on home page:
    // await screen.findByText("Profile");
    // expect(getProfileButton()).to.exist;
    // // When: navigate to profile
    // await userEvent.click(getProfileButton());
    // // When: waiting for lazy load
    // await waitFor(getLoggedInStatus);
    // // Then: is on profile page
    // expect(getLoggedInStatus()).to.exist;
    // expect(getLogoutButton()).to.exist;
    // // When: logout
    // await userEvent.click(getLogoutButton());
    // // Then: logged out
    // expect(getLoggedOutStatus()).to.exist;
  });
});
