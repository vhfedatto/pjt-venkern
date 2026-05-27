const COLOR_MAP = {
  "#6366f1": { bg: "bg-indigo-100", text: "text-indigo-700" },
  "#8b5cf6": { bg: "bg-violet-100", text: "text-violet-700" },
  "#ec4899": { bg: "bg-pink-100", text: "text-pink-700" },
  "#10b981": { bg: "bg-emerald-100", text: "text-emerald-700" },
  "#f59e0b": { bg: "bg-amber-100", text: "text-amber-700" },
  "#3b82f6": { bg: "bg-blue-100", text: "text-blue-700" },
  "#ef4444": { bg: "bg-red-100", text: "text-red-700" },
  "#14b8a6": { bg: "bg-teal-100", text: "text-teal-700" },
  "#f97316": { bg: "bg-orange-100", text: "text-orange-700" }
};
function getTeamColors(color) {
  return COLOR_MAP[color?.toLowerCase()] ?? { bg: "bg-indigo-100", text: "text-indigo-700" };
}
export {
  getTeamColors
};
