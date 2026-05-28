const COLORS = ['from-violet-500 to-purple-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600', 'from-amber-500 to-orange-600', 'from-cyan-500 to-sky-600', 'from-fuchsia-500 to-violet-600', 'from-green-500 to-emerald-600'];
function getColor(name) {
  let h = 0;
  for (const c of name) h = h * 31 + c.charCodeAt(0) >>> 0;
  return COLORS[h % COLORS.length];
}
function getInitials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}
const STATUS_DOT = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  busy: 'bg-red-500',
  away: 'bg-amber-400'
};
const SIZES = {
  xs: {
    div: 'w-6 h-6',
    text: 'text-[10px]',
    dot: 'w-2 h-2 -bottom-0.5 -right-0.5'
  },
  sm: {
    div: 'w-8 h-8',
    text: 'text-xs',
    dot: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5'
  },
  md: {
    div: 'w-10 h-10',
    text: 'text-sm',
    dot: 'w-3 h-3 bottom-0 right-0'
  },
  lg: {
    div: 'w-12 h-12',
    text: 'text-base',
    dot: 'w-3.5 h-3.5 bottom-0 right-0'
  },
  xl: {
    div: 'w-16 h-16',
    text: 'text-xl',
    dot: 'w-4 h-4 bottom-0.5 right-0.5'
  }
};
export function Avatar({
  name,
  size = 'md',
  status,
  className = ''
}) {
  const sz = SIZES[size];
  const color = getColor(name);
  const initials = getInitials(name);
  return <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sz.div} rounded-full bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
        <span className={`text-white font-bold ${sz.text}`}>{initials}</span>
      </div>
      {status && <span className={`absolute ${sz.dot} rounded-full ${STATUS_DOT[status]} ring-2 ring-white dark:ring-gray-800`} />}
    </div>;
}