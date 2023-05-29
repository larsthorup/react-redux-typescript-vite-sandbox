import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { connect, setupStore } from "../root";
import { BrowserHistory, createBrowserHistory } from "history";
import App, { homePath, peoplePath, profilePath, signinPath, tasksPath } from "./App";
import LoginForm from "./LoginForm";
import Home from "./Home";
import PeopleTable from "./People";
import { getRowRenderCount, resetRowRenderCount } from "../lib/react-table";
import TaskTable from "./Tasks";
import Profile from "./Profile";
import auth from "../store/auth";

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

for (let i = 0; i < 100; ++i)
  describe("App (react)", function () {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    describe(Home.name, () => {
      it("enables user to go to login screen", () => {
        // Given: setup
        mockLocation(homePath);
        const store = setupStore();
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const { root } = TestRenderer.create(connect(<App />, store));

        // Then: user is not logged in
        expect(store.getState().auth.user).toBeNull();
        const signinButton = root.findByProps({ children: "Sign in" });

        // When: navigate to sign in
        signinButton.props.onClick({ preventDefault: vi.fn() });

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
        const { root, toJSON } = TestRenderer.create(connect(<App />, store));

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
        expect(vi.getTimerCount()).toBe(1); // Note: auth delay
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        root.findByProps({ children: "Error: Authorization failed" });

        // When: login with correct password
        passwordInput.props.onChange({ target: { value: "p" } });
        form.props.onSubmit({ preventDefault: vi.fn() });

        // Then: show loading indicator
        root.findByProps({ children: "Authorizing..." });

        // Then: eventually navigate to Home page
        expect(vi.getTimerCount()).toBe(1); // Note: auth delay
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
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
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const { root, toJSON } = TestRenderer.create(connect(<App />, store));

        // Then: eventually on people page
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        // console.log(JSON.stringify(toJSON(), null, 2));
        root.findByProps({ children: "Add one more" });
        root.findByProps({ children: "Edit Adam" });

        // Then: each row rendered only once (but counted twice when running under vite dev server, but not the bundle)
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // Then: number of selected people is 0
        expect(
          root.findAllByProps({ type: "checkbox", checked: true })
        ).toHaveLength(0);

        // When: select first person
        root
          .findAllByProps({ type: "checkbox" })[1]
          .props.onChange({ target: { checked: true } }); // Note: skipping header checkbox

        // Then: eventually number of selected people is 1
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        expect(
          root.findAllByProps({ type: "checkbox", checked: true })
        ).toHaveLength(1);

        // Then: just that row is re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: select all people
        root
          .findAllByProps({ type: "checkbox" })[0]
          .props.onChange({ target: { checked: true } }); // Note: header checkbox

        // Then: number of selected people is 4
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        expect(
          root.findAllByProps({ type: "checkbox", checked: true })
        ).toHaveLength(5); // Note: including header checkbox

        // Then: all rows are re-rendered
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: click first edit button
        root.findByProps({ children: "Edit Adam" }).props.onClick();

        // Then: see edit form
        const saveButton = root.findByProps({ children: "Save name" });

        // When: change name and click save
        root
          .findByProps({ placeholder: "name" })
          .props.onChange({ target: { value: "AdamX" } });
        saveButton.props.onClick();

        // When: click close
        root.findByProps({ children: "Close AdamX" }).props.onClick();

        // Then: see updated name
        root.findByProps({ children: "Edit AdamX" });

        // Then: only that row was re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: add new person
        root.findByProps({ children: "Add one more" }).props.onClick();

        // Then: see added person
        root.findByProps({ children: "Edit Unnamed" });

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
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const { root, toJSON } = TestRenderer.create(connect(<App />, store));

        // Then: eventually on task page
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        const editButton = root.findByProps({ children: "Edit" });

        // Then: each row rendered only once
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: click edit button
        editButton.props.onClick();

        // Then: see edit form
        const saveButton = root.findByProps({ children: "Save" });

        // Then: each row rendered only once
        expect(getRowRenderCount()).to.equal(4);
        resetRowRenderCount();

        // When: change name and click save
        expect(
          root.findAllByProps({ placeholder: "title" })[2].props.value
        ).toBe("Swim");
        root
          .findAllByProps({ placeholder: "title" })[2]
          .props.onChange({ target: { value: "Swimming" } });

        // Then: only that row was re-rendered
        expect(getRowRenderCount()).to.equal(1);
        resetRowRenderCount();

        // When: click save button
        saveButton.props.onClick();

        // Then: data is saved
        expect(store.getState().task[1].title).toBe("Swimming");
      });
    });

    describe(Profile.name, () => {
      it("should allow user to logout", async () => {
        // Given: setup
        mockLocation(profilePath);
        const store = setupStore();
        store.dispatch(auth.actions.signin({ user: { name: 'Peter' } }));
        const { replace } =
          vi.mocked(createBrowserHistory).mock.results[0].value;

        // When: rendered
        const { root, toJSON } = TestRenderer.create(connect(<App />, store));

        // Then: is on profile page
        await vi.runAllTimersAsync(); // Note: flush pending timers and promises
        root.findByProps({ children: "Peter" });
        const logoutButton = root.findByProps({ children: "Logout" });

        // When: logout
        logoutButton.props.onClick();

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
