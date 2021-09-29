import { compile, match } from "path-to-regexp";
import { useSelector, useDispatch } from "react-redux";
import { Slicer, historyReplace, historyPush } from "./redux-history";
import { ReactNode } from "react";

export type Routes = { [key: string]: ReactNode };

export const useNavigate = ({ replace } = { replace: false }) => {
  const dispatch = useDispatch();
  return (route: string, params = {}, hash = {}) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      const pathname = compile(route, { encode: encodeURIComponent })(params);
      const actionCreator = replace ? historyReplace : historyPush;
      dispatch(actionCreator({ hash, pathname, search: {} }));
    };
};

const findMatchResult = (routes: Routes, pathname: string) => {
  for (const routePath of Object.keys(routes)) {
    const matchResult = match(routePath)(pathname);
    if (matchResult) {
      return routePath;
    }
  }
};

export const useRoutes = (routes: Routes, slicer: Slicer): ReactNode | null => {
  const pathname = useSelector((state) => slicer(state).pathname);
  const routePath = findMatchResult(routes, pathname);
  return routePath ? routes[routePath] : null;
};

export const usePath = <T extends {}>(routePath: string, slicer: Slicer): T => {
  const pathname = useSelector((state) => slicer(state).pathname);
  const matchResult = match(routePath, { decode: decodeURIComponent })(
    pathname
  );
  return (matchResult ? matchResult.params : {}) as T;
};

export const useHash = <T extends {}>(slicer: Slicer): T => {
  const hash = useSelector((state) => slicer(state).hash);
  return hash as T;
};
