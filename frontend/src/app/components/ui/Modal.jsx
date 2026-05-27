import { jsx, jsxs } from "react/jsx-runtime";
import { X } from "./Icons";
import { motion, AnimatePresence } from "motion/react";
function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = "max-w-lg", footer }) {
  return /* @__PURE__ */ jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.93, y: 24 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.93, y: 24 },
        transition: { type: "spring", damping: 30, stiffness: 340 },
        className: `relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full ${maxWidth} overflow-hidden flex flex-col max-h-[90vh]`,
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-gray-900 dark:text-white", children: title }),
              subtitle && /* @__PURE__ */ jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: subtitle })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onClose,
                className: "p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors",
                children: /* @__PURE__ */ jsx(X, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "px-6 overflow-y-auto flex-1", children }),
          footer && /* @__PURE__ */ jsx("div", { className: "px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0", children: footer })
        ]
      }
    )
  ] }) });
}
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirmar", danger = false }) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose,
      title,
      maxWidth: "max-w-sm",
      footer: /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("button", { onClick: onClose, className: "flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors", children: "Cancelar" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              onConfirm();
              onClose();
            },
            className: `flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"}`,
            children: confirmLabel
          }
        )
      ] }),
      children: /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 pb-2", children: message })
    }
  );
}
export {
  ConfirmModal,
  Modal
};
