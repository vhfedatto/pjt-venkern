import { Fragment, jsx, jsxs } from "react/jsx-runtime";
const base = (paths, extra) => (props) => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...extra,
    ...props,
    children: paths
  }
);
const ChevronDown = base(/* @__PURE__ */ jsx("path", { d: "m6 9 6 6 6-6" }));
const ChevronDownIcon = ChevronDown;
const ChevronRight = base(/* @__PURE__ */ jsx("path", { d: "m9 18 6-6-6-6" }));
const ChevronRightIcon = ChevronRight;
const ChevronLeft = base(/* @__PURE__ */ jsx("path", { d: "m15 18-6-6 6-6" }));
const ChevronLeftIcon = ChevronLeft;
const ChevronUp = base(/* @__PURE__ */ jsx("path", { d: "m18 15-6-6-6 6" }));
const ChevronUpIcon = ChevronUp;
const ArrowRight = base(/* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
  /* @__PURE__ */ jsx("path", { d: "m12 5 7 7-7 7" })
] }));
const ArrowLeft = base(/* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "m12 19-7-7 7-7" }),
  /* @__PURE__ */ jsx("path", { d: "M19 12H5" })
] }));
const MoreHorizontal = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "19", cy: "12", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "5", cy: "12", r: "1" })
  ] })
);
const MoreHorizontalIcon = MoreHorizontal;
const PanelLeft = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 3v18" })
  ] })
);
const PanelLeftIcon = PanelLeft;
const GripVertical = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "12", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "5", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "19", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "12", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "5", r: "1" }),
    /* @__PURE__ */ jsx("circle", { cx: "15", cy: "19", r: "1" })
  ] })
);
const GripVerticalIcon = GripVertical;
const Menu = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "6", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "18", y2: "18" })
  ] })
);
const X = base(/* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M18 6 6 18" }),
  /* @__PURE__ */ jsx("path", { d: "m6 6 12 12" })
] }));
const XIcon = X;
const Search = base(/* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
  /* @__PURE__ */ jsx("path", { d: "m21 21-4.3-4.3" })
] }));
const SearchIcon = Search;
const Filter = base(/* @__PURE__ */ jsx("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }));
const Plus = base(/* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M5 12h14" }),
  /* @__PURE__ */ jsx("path", { d: "M12 5v14" })
] }));
const Minus = base(/* @__PURE__ */ jsx("path", { d: "M5 12h14" }));
const MinusIcon = Minus;
const List = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "6", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "21", y1: "18", y2: "18" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "6", y2: "6" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "12", y2: "12" }),
    /* @__PURE__ */ jsx("line", { x1: "3", x2: "3.01", y1: "18", y2: "18" })
  ] })
);
const LayoutGrid = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "3", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "14", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "14", y: "14", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "7", x: "3", y: "14", rx: "1" })
  ] })
);
const LayoutDashboard = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "7", height: "9", x: "3", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "5", x: "14", y: "3", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "9", x: "14", y: "12", rx: "1" }),
    /* @__PURE__ */ jsx("rect", { width: "7", height: "5", x: "3", y: "16", rx: "1" })
  ] })
);
const Check = base(/* @__PURE__ */ jsx("path", { d: "M20 6 9 17l-5-5" }));
const CheckIcon = Check;
const CheckCheck = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M18 6 7 17l-5-5" }),
    /* @__PURE__ */ jsx("path", { d: "m22 10-7.5 7.5L13 16" })
  ] })
);
const CheckCircle2 = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
  ] })
);
const Circle = base(/* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }));
const CircleIcon = Circle;
const XCircle = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("path", { d: "m15 9-6 6" }),
    /* @__PURE__ */ jsx("path", { d: "m9 9 6 6" })
  ] })
);
const AlertTriangle = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 9v4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 17h.01" })
  ] })
);
const TriangleAlert = AlertTriangle;
const User = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "7", r: "4" })
  ] })
);
const Users = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    /* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
  ] })
);
const UserPlus = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("line", { x1: "19", x2: "19", y1: "8", y2: "14" }),
    /* @__PURE__ */ jsx("line", { x1: "22", x2: "16", y1: "11", y2: "11" })
  ] })
);
const UserMinus = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("line", { x1: "22", x2: "16", y1: "11", y2: "11" })
  ] })
);
const UserCog = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "18", cy: "15", r: "3" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 15H6a4 4 0 0 0-4 4v2" }),
    /* @__PURE__ */ jsx("path", { d: "m21.7 16.4-.9-.3" }),
    /* @__PURE__ */ jsx("path", { d: "m15.2 13.9-.9-.3" }),
    /* @__PURE__ */ jsx("path", { d: "m16.6 18.7.3-.9" }),
    /* @__PURE__ */ jsx("path", { d: "m19.1 12.2.3-.9" }),
    /* @__PURE__ */ jsx("path", { d: "m19.6 18.7-.4-1" }),
    /* @__PURE__ */ jsx("path", { d: "m16.8 12.3-.4-1" }),
    /* @__PURE__ */ jsx("path", { d: "m14.3 16.6 1-.4" }),
    /* @__PURE__ */ jsx("path", { d: "m20.7 13.8 1-.4" })
  ] })
);
const Mail = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "20", height: "16", x: "2", y: "4", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" })
  ] })
);
const MailOpen = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" }),
    /* @__PURE__ */ jsx("path", { d: "m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" })
  ] })
);
const MessageSquare = base(
  /* @__PURE__ */ jsx("path", { d: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" })
);
const MessageCircle = base(
  /* @__PURE__ */ jsx("path", { d: "M7.9 20A9 9 0 1 0 4 16.1L2 22Z" })
);
const Send = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m22 2-7 20-4-9-9-4Z" }),
    /* @__PURE__ */ jsx("path", { d: "M22 2 11 13" })
  ] })
);
const AtSign = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" })
  ] })
);
const Hash = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "9", y2: "9" }),
    /* @__PURE__ */ jsx("line", { x1: "4", x2: "20", y1: "15", y2: "15" }),
    /* @__PURE__ */ jsx("line", { x1: "10", x2: "8", y1: "3", y2: "21" }),
    /* @__PURE__ */ jsx("line", { x1: "16", x2: "14", y1: "3", y2: "21" })
  ] })
);
const Bell = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
    /* @__PURE__ */ jsx("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" })
  ] })
);
const Shield = base(
  /* @__PURE__ */ jsx("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" })
);
const ShieldAlert = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 8v4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16h.01" })
  ] })
);
const ShieldCheck = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }),
    /* @__PURE__ */ jsx("path", { d: "m9 12 2 2 4-4" })
  ] })
);
const Clock = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
    /* @__PURE__ */ jsx("polyline", { points: "12 6 12 12 16 14" })
  ] })
);
const Calendar = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M8 2v4" }),
    /* @__PURE__ */ jsx("path", { d: "M16 2v4" }),
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M3 10h18" })
  ] })
);
const CalendarDays = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M8 2v4" }),
    /* @__PURE__ */ jsx("path", { d: "M16 2v4" }),
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "4", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M3 10h18" }),
    /* @__PURE__ */ jsx("path", { d: "M8 14h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M12 14h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M16 14h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M8 18h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M12 18h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M16 18h.01" })
  ] })
);
const CalendarClock = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" }),
    /* @__PURE__ */ jsx("path", { d: "M16 2v4" }),
    /* @__PURE__ */ jsx("path", { d: "M8 2v4" }),
    /* @__PURE__ */ jsx("path", { d: "M3 10h5" }),
    /* @__PURE__ */ jsx("path", { d: "M17.5 17.5 16 16.3V14" }),
    /* @__PURE__ */ jsx("circle", { cx: "16", cy: "16", r: "6" })
  ] })
);
const FileText = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }),
    /* @__PURE__ */ jsx("path", { d: "M14 2v4a2 2 0 0 0 2 2h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 9H8" }),
    /* @__PURE__ */ jsx("path", { d: "M16 13H8" }),
    /* @__PURE__ */ jsx("path", { d: "M16 17H8" })
  ] })
);
const ClipboardList = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1" }),
    /* @__PURE__ */ jsx("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }),
    /* @__PURE__ */ jsx("path", { d: "M12 11h4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 16h4" }),
    /* @__PURE__ */ jsx("path", { d: "M8 11h.01" }),
    /* @__PURE__ */ jsx("path", { d: "M8 16h.01" })
  ] })
);
const Download = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    /* @__PURE__ */ jsx("polyline", { points: "7 10 12 15 17 10" }),
    /* @__PURE__ */ jsx("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
  ] })
);
const Image = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsx("circle", { cx: "9", cy: "9", r: "2" }),
    /* @__PURE__ */ jsx("path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" })
  ] })
);
const Copy = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
  ] })
);
const Pencil = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" }),
    /* @__PURE__ */ jsx("path", { d: "m15 5 4 4" })
  ] })
);
const Trash2 = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 6h18" }),
    /* @__PURE__ */ jsx("path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
    /* @__PURE__ */ jsx("path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
    /* @__PURE__ */ jsx("line", { x1: "10", x2: "10", y1: "11", y2: "17" }),
    /* @__PURE__ */ jsx("line", { x1: "14", x2: "14", y1: "11", y2: "17" })
  ] })
);
const RefreshCw = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }),
    /* @__PURE__ */ jsx("path", { d: "M21 3v5h-5" }),
    /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }),
    /* @__PURE__ */ jsx("path", { d: "M8 16H3v5" })
  ] })
);
const LogOut = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }),
    /* @__PURE__ */ jsx("polyline", { points: "16 17 21 12 16 7" }),
    /* @__PURE__ */ jsx("line", { x1: "21", x2: "9", y1: "12", y2: "12" })
  ] })
);
const LogIn = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }),
    /* @__PURE__ */ jsx("polyline", { points: "10 17 15 12 10 7" }),
    /* @__PURE__ */ jsx("line", { x1: "15", x2: "3", y1: "12", y2: "12" })
  ] })
);
const BarChart3 = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M3 3v18h18" }),
    /* @__PURE__ */ jsx("path", { d: "M18 17V9" }),
    /* @__PURE__ */ jsx("path", { d: "M13 17V5" }),
    /* @__PURE__ */ jsx("path", { d: "M8 17v-3" })
  ] })
);
const TrendingUp = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("polyline", { points: "22 7 13.5 15.5 8.5 10.5 2 17" }),
    /* @__PURE__ */ jsx("polyline", { points: "16 7 22 7 22 13" })
  ] })
);
const ListChecks = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "m3 17 2 2 4-4" }),
    /* @__PURE__ */ jsx("path", { d: "m3 7 2 2 4-4" }),
    /* @__PURE__ */ jsx("path", { d: "M13 6h8" }),
    /* @__PURE__ */ jsx("path", { d: "M13 12h8" }),
    /* @__PURE__ */ jsx("path", { d: "M13 18h8" })
  ] })
);
const Star = base(
  /* @__PURE__ */ jsx("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" })
);
const Sun = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "4" }),
    /* @__PURE__ */ jsx("path", { d: "M12 2v2" }),
    /* @__PURE__ */ jsx("path", { d: "M12 20v2" }),
    /* @__PURE__ */ jsx("path", { d: "m4.93 4.93 1.41 1.41" }),
    /* @__PURE__ */ jsx("path", { d: "m17.66 17.66 1.41 1.41" }),
    /* @__PURE__ */ jsx("path", { d: "M2 12h2" }),
    /* @__PURE__ */ jsx("path", { d: "M20 12h2" }),
    /* @__PURE__ */ jsx("path", { d: "m6.34 17.66-1.41 1.41" }),
    /* @__PURE__ */ jsx("path", { d: "m19.07 4.93-1.41 1.41" })
  ] })
);
const Moon = base(
  /* @__PURE__ */ jsx("path", { d: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" })
);
const Palette = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor" }),
    /* @__PURE__ */ jsx("path", { d: "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" })
  ] })
);
const Settings = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "3" })
  ] })
);
const Phone = base(
  /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10.5 19.36 19.36 0 0 1 1.64 2a2 2 0 0 1 1.97-2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.86-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
);
const MapPin = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }),
    /* @__PURE__ */ jsx("circle", { cx: "12", cy: "10", r: "3" })
  ] })
);
const Building2 = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }),
    /* @__PURE__ */ jsx("path", { d: "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }),
    /* @__PURE__ */ jsx("path", { d: "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" }),
    /* @__PURE__ */ jsx("path", { d: "M10 6h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 10h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 14h4" }),
    /* @__PURE__ */ jsx("path", { d: "M10 18h4" })
  ] })
);
const Boxes = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z" }),
    /* @__PURE__ */ jsx("path", { d: "m7 16.5-4.74-2.85" }),
    /* @__PURE__ */ jsx("path", { d: "m7 16.5 5-3" }),
    /* @__PURE__ */ jsx("path", { d: "M7 16.5v5.17" }),
    /* @__PURE__ */ jsx("path", { d: "M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z" }),
    /* @__PURE__ */ jsx("path", { d: "m17 16.5-5-3" }),
    /* @__PURE__ */ jsx("path", { d: "m17 16.5 4.74-2.85" }),
    /* @__PURE__ */ jsx("path", { d: "M17 16.5v5.17" }),
    /* @__PURE__ */ jsx("path", { d: "M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z" }),
    /* @__PURE__ */ jsx("path", { d: "M12 8 7.26 5.15" }),
    /* @__PURE__ */ jsx("path", { d: "m12 8 4.74-2.85" }),
    /* @__PURE__ */ jsx("path", { d: "M12 13.5V8" })
  ] })
);
const Trello = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
    /* @__PURE__ */ jsx("rect", { width: "3", height: "9", x: "7", y: "7" }),
    /* @__PURE__ */ jsx("rect", { width: "3", height: "5", x: "14", y: "7" })
  ] })
);
const Link2 = base(
  /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("path", { d: "M9 17H7A5 5 0 0 1 7 7h2" }),
    /* @__PURE__ */ jsx("path", { d: "M15 7h2a5 5 0 1 1 0 10h-2" }),
    /* @__PURE__ */ jsx("line", { x1: "8", x2: "16", y1: "12", y2: "12" })
  ] })
);
const Loader2 = base(
  /* @__PURE__ */ jsx("path", { d: "M21 12a9 9 0 1 1-6.219-8.56" })
);
export {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  AtSign,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  Calendar,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCheck,
  CheckCircle2,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  ChevronUp,
  ChevronUpIcon,
  Circle,
  CircleIcon,
  ClipboardList,
  Clock,
  Copy,
  Download,
  FileText,
  Filter,
  GripVertical,
  GripVerticalIcon,
  Hash,
  Image,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  List,
  ListChecks,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  MailOpen,
  MapPin,
  Menu,
  MessageCircle,
  MessageSquare,
  Minus,
  MinusIcon,
  Moon,
  MoreHorizontal,
  MoreHorizontalIcon,
  Palette,
  PanelLeft,
  PanelLeftIcon,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  SearchIcon,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Sun,
  Trash2,
  Trello,
  TrendingUp,
  TriangleAlert,
  User,
  UserCog,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
  XIcon
};
