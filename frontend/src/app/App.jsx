import { jsx } from "react/jsx-runtime";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
function App() {
  return /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsx(ProjectProvider, { children: /* @__PURE__ */ jsx(AppProvider, { children: /* @__PURE__ */ jsx(RouterProvider, { router }) }) }) });
}
export {
  App as default
};
