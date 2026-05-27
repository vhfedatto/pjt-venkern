import { jsx, jsxs } from "react/jsx-runtime";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { useState } from "react";
import { Input } from "./input";
import { cn } from "./utils";
function PasswordInput({ className, ...props }) {
  const [visible, setVisible] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      Input,
      {
        ...props,
        type: visible ? "text" : "password",
        className: cn("pr-10", className)
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setVisible((value) => !value),
        className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:pointer-events-none disabled:opacity-50",
        "aria-label": visible ? "Ocultar senha" : "Mostrar senha",
        tabIndex: -1,
        children: visible ? /* @__PURE__ */ jsx(EyeSlash, { size: 18, weight: "duotone" }) : /* @__PURE__ */ jsx(Eye, { size: 18, weight: "duotone" })
      }
    )
  ] });
}
export {
  PasswordInput
};
