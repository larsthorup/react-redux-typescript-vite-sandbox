import React, { act } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { connect, setupStore } from "../root";
import { BrowserHistory, createBrowserHistory } from "history";
import App, {
  homePath,
  peoplePath,
  profilePath,
  signinPath,
  tasksPath,
} from "./App";
import LoginForm from "./LoginForm";
import Home from "./Home";
import PeopleTable from "./People";
import { getRowRenderCount, resetRowRenderCount } from "../lib/react-table";
import TaskTable from "./Tasks";
import Profile from "./Profile";
import auth from "../store/auth";
import { change, click, submit, TestRenderer } from "@larsthorup/react-test-renderer";

vi.hoisted(() => vi.stubGlobal("window", {}));
vi.mock("history", () => ({
  createBrowserHistory: vi.fn(),
}));
beforeEach(() => {
  vi.mocked(createBrowserHistory).mockClear();
});
const mockLocation = (pathname: string) => {
  vi.mocked(createBrowserHistory).mockReturnValueOnce({
    listen: vi.fn(),
    location: { pathname },
    replace: vi.fn(),
  } as unknown as BrowserHistory);
};

for (let i = 0; i < 1; ++i)
  describe("App (react)", function () {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe(Home.name, () => {
      it("enables user to go to login screen", async () => {
        // Given: setup
        mockLocation(homePath);
        const store = setupStore();
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const renderer = await TestRenderer.create(connect(<App />, store));

        // Then: user is not logged in
        expect(store.getState().auth.user).toBeNull();

        // When: navigate to sign in
        await click(renderer.findByText("Sign in"), { preventDefault: vi.fn() });

        // Then: navigation to Signin page
        expect(replace).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: signinPath })
        );
      });
    });

    describe(LoginForm.name, () => {
      it("should let the user login", async () => {
        // Given: setup
        mockLocation(signinPath);
        const store = setupStore();
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const renderer = await TestRenderer.create(connect(<App />, store));

        // When: login with wrong password
        await change(renderer.findByProps({ placeholder: "User name" }), {
          target: { value: "Lars" },
        });
        const passwordInput = renderer.findByProps({
          placeholder: "Password (use 'p')",
        });
        await change(passwordInput, { target: { value: "w" } });
        const form = renderer.findByType("form");
        await submit(form, { preventDefault: vi.fn() });

        // Then: show loading indicator
        renderer.findByText("Authorizing...");

        // Then: eventually show error message
        expect(vi.getTimerCount()).toBe(1); // Note: auth delay
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        renderer.findByText("Error: Authorization failed");

        // When: login with correct password
        await change(passwordInput, { target: { value: "p" } });
        await submit(form, { preventDefault: vi.fn() });

        // Then: show loading indicator
        renderer.findByText("Authorizing...");

        // Then: eventually navigate to Home page
        expect(vi.getTimerCount()).toBe(1); // Note: auth delay
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        expect(replace).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: homePath })
        );

        // Then: user is logged in
        expect(store.getState().auth.user).toEqual({ name: "Lars" });
      });
    });

    describe(PeopleTable.name, () => {
      it("should efficiently render an editable table", async () => {
        // Given: setup
        mockLocation(peoplePath);
        const store = setupStore();

        // When: rendered
        const renderer = await TestRenderer.create(connect(<App />, store));

        // Then: eventually on people page
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        expect(renderer.findByText("Add one more")).toBeDefined();
        expect(renderer.findByText("Edit Adam")).toBeDefined();

        // Then: each row rendered only once (but counted twice when running under vite dev server, but not the bundle)
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // Then: number of selected people is 0
        expect(
          renderer.findByProps({ type: "checkbox", checked: true })
        ).not.toBeDefined();

        // When: select first person
        await change(renderer.findAllByProps({ type: "checkbox" })[1], {
          target: { checked: true },
        });

        // Then: eventually number of selected people is 1
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        expect(
          renderer.findAllByProps({ type: "checkbox", checked: true })
        ).toHaveLength(1);

        // Then: just that row is re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: select all people
        await change(renderer.findAllByProps({ type: "checkbox" })[0], {
          target: { checked: true },
        });

        // Then: number of selected people is 4
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        expect(
          renderer.findAllByProps({ type: "checkbox", checked: true })
        ).toHaveLength(5); // Note: including header checkbox

        // Then: all rows are re-rendered
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: click first edit button
        await click(renderer.findByText("Edit Adam"));

        // Then: see edit form
        const saveButton = renderer.findByText("Save name");

        // When: change name and click save
        await change(renderer.findByProps({ placeholder: "name" }), {
          target: { value: "AdamX" },
        });
        await click(saveButton);

        // When: click close
        await click(renderer.findByText("Close AdamX"));

        // Then: see updated name
        expect(renderer.findByText("Edit AdamX")).toBeDefined();

        // Then: only that row was re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: add new person
        await click(renderer.findByText("Add one more"));

        // Then: see added person
        expect(renderer.findByText("Edit Unnamed")).toBeDefined();

        // Then: only all rows are re-rendered
        // TODO: avoid re-rendering all rows including the new one
        expect(getRowRenderCount()).to.equal(5);
        resetRowRenderCount();
      });
    });

    describe(TaskTable.name, () => {
      it("should efficiently render an editable table", async () => {
        // Given: setup
        mockLocation(tasksPath);
        const store = setupStore();

        const renderer = await TestRenderer.create(connect(<App />, store));

        // Then: eventually on task page
        await act(async () => {
          await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        });
        const editButton = renderer.findByText("Edit");

        // Then: each row rendered only once
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: click edit button
        await click(editButton);

        // Then: see edit form
        const saveButton = renderer.findByText("Save");

        // Then: each row rendered only once
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: change name and click save
        expect(
          renderer.findAllByProps({ placeholder: "title" })[2].props.value
        ).toBe("Swim");
        await change(renderer.findAllByProps({ placeholder: "title" })[2], {
          target: { value: "Swimming" },
        });

        // Then: only that row was re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: click save button
        await click(saveButton);

        // Then: data is saved
        expect(store.getState().task[1].title).toBe("Swimming");
      });
    });

    describe(Profile.name, () => {
      it("should allow user to logout", async () => {
        // Given: setup
        mockLocation(profilePath);
        const store = setupStore();
        store.dispatch(auth.actions.signin({ user: { name: "Peter" } }));
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        const renderer = await TestRenderer.create(connect(<App />, store));
        // console.log(JSON.stringify(renderer.root, null, 2));

        // Then: is on profile page
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        renderer.findByText("Peter");
        const logoutButton = renderer.findByText("Logout");

        // When: logout
        await click(logoutButton);

        // Then: eventually navigate to Home page
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        expect(replace).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: homePath })
        );

        // Then: user is logged out
        expect(store.getState().auth.user).toBeNull();
      });
    });
  });
