import { act } from "react";
import ReactReconciler from "react-reconciler";

import {
  ConcurrentRoot,
  // DiscreteEventPriority,
  // ContinuousEventPriority,
  DefaultEventPriority,
} from "react-reconciler/constants";
import { assert } from "ts-essentials";

type Container = ReactReconciler.OpaqueRoot;

interface TextInstance {
  text: string;
}

interface Instance {
  // root: RootStore
  type: string;
  // parent: Instance | null
  children: Node[];
  props: Record<string, unknown>;
  // object: O & { __r3f?: Instance<O> }
  // eventCount: number
  // handlers: Partial<EventHandlers>
  // attach?: AttachType<O>
  // previousAttach?: any
  // isHidden: boolean
}

type Node = Instance | TextInstance;

interface HostConfig {
  type: string;
  props: Instance["props"];
  container: Container;
  instance: Instance;
  textInstance: TextInstance;
  suspenseInstance: Instance;
  hydratableInstance: never;
  publicInstance: Instance | TextInstance; // Instance['object']
  hostContext: unknown;
  updatePayload: never;
  childSet: never;
  timeoutHandle: number | undefined;
  noTimeout: -1;
}

const reconciler = ReactReconciler<
  HostConfig["type"],
  HostConfig["props"],
  HostConfig["container"],
  HostConfig["instance"],
  HostConfig["textInstance"],
  HostConfig["suspenseInstance"],
  HostConfig["hydratableInstance"],
  HostConfig["publicInstance"],
  HostConfig["hostContext"],
  HostConfig["updatePayload"],
  HostConfig["childSet"],
  HostConfig["timeoutHandle"],
  HostConfig["noTimeout"]
>({
  // host config options
  supportsMutation: true,
  createInstance(
    type,
    props
    // rootContainerInstance,
    // hostContext,
    // internalInstanceHandle
  ) {
    // console.log("createInstance", { type, props });
    const { children, ...propsCleaned } = props;
    return {
      type,
      props: propsCleaned,
      children: [],
    };
  },
  createTextInstance(
    text
    // rootContainerInstance,
    // hostContext,
    // internalInstanceHandle
  ) {
    // console.log("createTextInstance", { text });
    return { text };
  },
  appendChildToContainer(container, child) {
    // console.log("appendChildToContainer", { container, child });
    container.children.push(child);
  },
  removeChildFromContainer(container, child) {
    console.log("TODO: removeChildFromContainer", { container, child });
  },
  appendChild(parent, child) {
    // console.log("appendChild", { parent, child });
    if (!child) return;
    parent.children.push(child);
  },
  appendInitialChild(parent, child) {
    // console.log("appendInitialChild", { parent, child });
    if (!child) return;
    parent.children.push(child);
  },
  removeChild(parent, child) {
    // console.log("removeChild", { parent, child });
    if (!child) return;
    parent.children.splice(parent.children.indexOf(child), 1);
  },
  insertBefore(parent, child, beforeChild) {
    // console.log("insertBefore", { parent, child, beforeChild });
    if (!child || !beforeChild) return;
    parent.children.splice(parent.children.indexOf(beforeChild), 0, child);
  },
  hideInstance() {},
  unhideInstance() {},
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps
    // rootContainerInstance,
    // currentHostContext
  ) {
    console.log("TODO: prepareUpdate", { type, oldProps, newProps });
    return null;
  },
  commitUpdate(
    instance,
    // updatePayload,
    type,
    oldProps,
    newProps
    // finishedWork
  ) {
    // console.log("TODO: commitUpdate", { type, oldProps, newProps, instance });
    instance.props = newProps;
  },
  commitTextUpdate(textInstance, oldText, newText) {
    // console.log("commitTextUpdate:", { textInstance, oldText, newText });
    textInstance.text = newText;
  },
  finalizeInitialChildren() {
    return false;
  },
  getChildHostContext(parentHostContext) {
    return parentHostContext;
  },
  getPublicInstance(instance) {
    return instance;
  },
  getRootHostContext() {
    return {};
  },
  prepareForCommit() {
    return null;
  },
  resetAfterCommit() {
    // Logic after committing changes
  },
  shouldSetTextContent() {
    return false;
  },
  // @ts-expect-error TODO: figure out the typing issue here
  getCurrentUpdatePriority() {
    return DefaultEventPriority;
  },
  resolveUpdatePriority() {
    return DefaultEventPriority;
  },
  setCurrentUpdatePriority() {},
  clearContainer() {
    // Logic for clearing container
  },
  maySuspendCommit() {
    return false;
  },
  detachDeletedInstance() {
    // Logic for detaching deleted instance
  },
});

export class TestRenderer {
  root: Instance;

  constructor() {
    this.root = { type: "", props: {}, children: [] };
  }

  static async create(element: React.ReactNode) {
    const renderer = new TestRenderer();
    const container = reconciler.createContainer(
      renderer.root, // containerInfo
      ConcurrentRoot, // tag
      null, // hydration callbacks
      false, // isStrictMode
      null, // concurrentUpdatesByDefaultOverride
      "", // identifierPrefix
      console.error, // onRecoverableError
      null // transitionCallbacks
    );
    container.onUncaughtError = (error: unknown) => {
      console.error(error);
    };
    await act(async () => {
      reconciler.updateContainer(element, container, null, null);
    });
    return renderer;
  }

  find(predicate: NodePredicate) {
    return find(this.root, predicate);
  }

  findByType(type: string) {
    return find(this.root, byType(type));
  }

  findByProps(props: Instance["props"]) {
    return find(this.root, byProps(props));
  }

  findByText(text: string) {
    return find(this.root, byText(text));
  }

  findAll(predicate: NodePredicate) {
    return findAll(this.root, predicate);
  }

  findAllByType(type: string) {
    findAll(this.root, byType(type));
  }

  findAllByProps(props: Instance["props"]) {
    return findAll(this.root, byProps(props));
  }

  findAllByText(text: string) {
    return findAll(this.root, byText(text));
  }
}

function isInstance(node: Node): node is Instance {
  return "type" in node;
}

type NodePredicate = (node: Node) => boolean;

function find(node: Node, predicate: NodePredicate): Instance | undefined {
  if (!isInstance(node)) return undefined;
  if (predicate(node)) {
    return node;
  }
  for (const child of node.children) {
    const found = find(child, predicate);
    if (found) {
      return found;
    }
  }
}

function findAll(node: Node, predicate: NodePredicate): Instance[] {
  const found = [];
  if (isInstance(node)) {
    if (predicate(node)) {
      found.push(node);
    }
    for (const child of node.children) {
      found.push(...findAll(child, predicate));
    }
  }
  return found;
}

const byType = (type: string) => (node: Node) =>
  isInstance(node) && node.type === type;
const byText = (text: string) => (node: Node) =>
  isInstance(node) &&
  node.children[0] &&
  !isInstance(node.children[0]) &&
  node.children[0].text === text;
const byProps = (props: Instance["props"]) => (node: Node) => {
  if (isInstance(node)) {
    for (const key in props) {
      if (
        typeof node.props[key] === "object" &&
        typeof props[key] === "object" &&
        node.props[key] !== null &&
        props[key] !== null
      ) {
        const value = node.props[key] as Record<string, object>;
        return Object.entries(props[key]).every(
          ([subKey, subValue]) => value[subKey] === subValue
        );
      } else if (node.props[key] !== props[key]) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
};

export async function click(node?: Instance, props: Instance["props"] = {}) {
  assert(node);
  const { onClick } = node.props;
  assert(typeof onClick === "function");
  await act(async () => {
    onClick(props);
  });
}

export async function change(node?: Instance, props: Instance["props"] = {}) {
  assert(node);
  const { onChange } = node.props;
  assert(typeof onChange === "function");
  await act(async () => {
    onChange(props);
  });
}

export async function submit(node?: Instance, props: Instance["props"] = {}) {
  assert(node);
  const { onSubmit } = node.props;
  assert(typeof onSubmit === "function");
  await act(async () => {
    onSubmit(props);
  });
}
