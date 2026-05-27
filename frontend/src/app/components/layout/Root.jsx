import { jsx, jsxs } from "react/jsx-runtime";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toaster } from "sonner";
function Root() {
  return /* @__PURE__ */ jsxs("div", { className: "flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950", children: [
    /* @__PURE__ */ jsx(Sidebar, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col flex-1 min-w-0 overflow-hidden", children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsx(Outlet, {}) })
    ] }),
    /* @__PURE__ */ jsx(Toaster, { position: "top-right", richColors: true, closeButton: true, expand: true })
  ] });
}
export {
  Root
};
