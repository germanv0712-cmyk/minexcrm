// Shared UI primitives
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ============ Toast system ============
const ToastContext = React.createContext({ push: () => {} });
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((xs) => [...xs, { id, ...t }]);
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== id)), t.duration || 3200);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id}
            className={`fade-in flex items-start gap-3 rounded-card shadow-pop bg-white border border-neutral-200 p-3 pr-4
              ${t.kind === 'success' ? 'border-l-4 border-l-success-500' :
                t.kind === 'error'   ? 'border-l-4 border-l-danger-500' :
                t.kind === 'warn'    ? 'border-l-4 border-l-warning-500' :
                                       'border-l-4 border-l-primary-500'}`}>
            <div className={`mt-0.5 ${t.kind === 'success' ? 'text-success-500' : t.kind === 'error' ? 'text-danger-500' : t.kind === 'warn' ? 'text-warning-500' : 'text-primary-500'}`}>
              {t.kind === 'success' ? <Icon.CircleCheck size={18}/> :
               t.kind === 'error'   ? <Icon.CircleAlert size={18}/> :
               t.kind === 'warn'    ? <Icon.CircleAlert size={18}/> :
                                      <Icon.Bell size={18}/>}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-900">{t.title}</div>
              {t.desc && <div className="text-xs text-neutral-600 mt-0.5">{t.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
const useToast = () => React.useContext(ToastContext);

// ============ Buttons ============
const Button = ({ kind = 'primary', size = 'md', icon: IconCmp, iconRight: IconR, children, className = '', ...rest }) => {
  const sizes = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };
  const kinds = {
    primary: 'bg-primary-500 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-900',
    ghost: 'bg-transparent hover:bg-neutral-100 text-neutral-700',
    danger: 'bg-danger-500 hover:bg-danger-700 text-white shadow-sm',
    success: 'bg-success-500 hover:bg-success-700 text-white shadow-sm',
    dark: 'bg-primary-900 hover:bg-primary-700 text-white shadow-sm',
  };
  return (
    <button {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${sizes[size]} ${kinds[kind]} ${className}`}>
      {IconCmp ? <IconCmp size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}/> : null}
      <span>{children}</span>
      {IconR ? <IconR size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}/> : null}
    </button>
  );
};

const IconButton = ({ icon: IconCmp, className = '', size = 'md', label, ...rest }) => {
  const sizes = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' };
  return (
    <button {...rest} aria-label={label} title={label}
      className={`inline-flex items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors ${sizes[size]} ${className}`}>
      <IconCmp size={16}/>
    </button>
  );
};

// ============ Card ============
const Card = ({ children, className = '', padding = true, ...rest }) => (
  <div {...rest} className={`bg-white border border-neutral-200 rounded-card shadow-card ${padding ? 'p-5' : ''} ${className}`}>{children}</div>
);

const CardHeader = ({ title, subtitle, right, icon: IconCmp, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 ${className}`}>
    <div className="flex items-start gap-3 min-w-0">
      {IconCmp ? (
        <span className="shrink-0 mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <IconCmp size={16}/>
        </span>
      ) : null}
      <div className="min-w-0">
        <div className="font-display font-semibold text-neutral-900 text-[15px] leading-tight">{title}</div>
        {subtitle ? <div className="text-xs text-neutral-600 mt-0.5">{subtitle}</div> : null}
      </div>
    </div>
    {right}
  </div>
);

// ============ Badge ============
const Badge = ({ kind = 'neutral', children, dot = false, size = 'md', className = '' }) => {
  const k = {
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    primary: 'bg-primary-50 text-primary-700 border-primary-300/40',
    success: 'bg-success-50 text-success-700 border-success-500/20',
    warn:    'bg-warning-50 text-warning-700 border-warning-500/20',
    danger:  'bg-danger-50 text-danger-700 border-danger-500/20',
    info:    'bg-sky-50 text-sky-700 border-sky-500/20',
  }[kind];
  const sz = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-[11px] px-2 py-0.5';
  const dotColor = { neutral: 'bg-neutral-400', primary: 'bg-primary-500', success: 'bg-success-500', warn: 'bg-warning-500', danger: 'bg-danger-500', info: 'bg-sky-500' }[kind];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${k} ${sz} ${className}`}>
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}/> : null}
      {children}
    </span>
  );
};

const statusBadge = (s, t) => {
  const map = {
    active:      { k: 'success', label: t('active') },
    paused:      { k: 'warn',    label: t('paused') },
    alert:       { k: 'danger',  label: t('alert') },
    completed:   { k: 'primary', label: t('completed') },
    inprogress:  { k: 'info',    label: t('inprogress') },
    overdue:     { k: 'danger',  label: t('overdue') },
    pending:     { k: 'warn',    label: t('pending') },
    approved:    { k: 'success', label: t('approved') },
    rejected:    { k: 'danger',  label: t('rejected') },
    draft:       { k: 'neutral', label: t('draft') },
    sent:        { k: 'info',    label: t('sent') },
    operational: { k: 'success', label: 'Operativo' },
    maintenance: { k: 'warn',    label: 'En mantenimiento' },
    out:         { k: 'danger',  label: 'Fuera de servicio' },
    open:        { k: 'warn',    label: 'Abierto' },
    investigation:{ k: 'info',   label: 'En investigación' },
    closed:      { k: 'success', label: 'Cerrado' },
  };
  const m = map[s] || { k: 'neutral', label: s };
  return <Badge kind={m.k} dot>{m.label}</Badge>;
};

// ============ Avatar ============
const Avatar = ({ name, color = '#1E3A8A', size = 32, className = '' }) => {
  const initials = (name || '?').split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className={`inline-flex items-center justify-center rounded-full text-white font-semibold ${className}`}
      style={{ width: size, height: size, backgroundColor: color, fontSize: Math.max(10, Math.floor(size * 0.38)) }}>
      {initials}
    </span>
  );
};

// ============ Drawer ============
const Drawer = ({ open, onClose, title, subtitle, width = 'max-w-xl', children, footer }) => {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-neutral-900/40 fade-in" onClick={onClose}/>
      <div className={`absolute right-0 top-0 h-full w-full ${width} bg-white border-l border-neutral-200 shadow-pop flex flex-col fade-in`}>
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-neutral-200">
          <div>
            <div className="font-display font-semibold text-neutral-900 text-base">{title}</div>
            {subtitle ? <div className="text-xs text-neutral-600 mt-0.5">{subtitle}</div> : null}
          </div>
          <IconButton icon={Icon.X} onClick={onClose} label="Cerrar"/>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-neutral-200 px-6 py-3 bg-neutral-50">{footer}</div> : null}
      </div>
    </div>
  );
};

// ============ Modal ============
const Modal = ({ open, onClose, title, children, footer, width = 'max-w-lg' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/50 fade-in" onClick={onClose}/>
      <div className={`relative bg-white rounded-card shadow-pop w-full ${width} fade-in`}>
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-neutral-200">
          <div className="font-display font-semibold text-neutral-900">{title}</div>
          <IconButton icon={Icon.X} onClick={onClose} label="Cerrar"/>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer ? <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50 rounded-b-card flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
};

// ============ Inputs ============
const Field = ({ label, hint, error, children, required }) => (
  <label className="block">
    {label ? <span className="mx-label">{label} {required ? <span className="text-danger-500">*</span> : null}</span> : null}
    {children}
    {error ? <span className="text-xs text-danger-700 mt-1 block">{error}</span> : null}
    {!error && hint ? <span className="text-xs text-neutral-500 mt-1 block">{hint}</span> : null}
  </label>
);

const Input = ({ icon: IconCmp, className = '', ...rest }) => (
  IconCmp ? (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
        <IconCmp size={16}/>
      </span>
      <input className={`mx-input pl-9 ${className}`} {...rest}/>
    </div>
  ) : <input className={`mx-input ${className}`} {...rest}/>
);

const Select = ({ children, className = '', ...rest }) => (
  <div className="relative">
    <select className={`mx-input appearance-none pr-9 ${className}`} {...rest}>{children}</select>
    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-400 pointer-events-none"><Icon.ChevronDown size={16}/></span>
  </div>
);

const Textarea = ({ className = '', rows = 4, ...rest }) => (
  <textarea rows={rows} className={`mx-input py-2 ${className}`} style={{ height: 'auto' }} {...rest}/>
);

const Checkbox = ({ label, checked, onChange, className = '' }) => (
  <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}>
    <span className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-primary-500 border-primary-500' : 'bg-white border-neutral-300'}`}>
      {checked ? <Icon.Check size={12} className="text-white"/> : null}
    </span>
    <input type="checkbox" className="sr-only" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)}/>
    {label ? <span className="text-sm text-neutral-700">{label}</span> : null}
  </label>
);

// ============ Tooltip ============
const Tooltip = ({ content, children, side = 'top', className = '' }) => (
  <span className={`relative inline-flex group ${className}`}>
    {children}
    <span className={`pointer-events-none absolute z-30 ${side === 'top' ? 'bottom-full mb-2 left-1/2 -translate-x-1/2' : 'top-full mt-2 left-1/2 -translate-x-1/2'} opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[11px] px-2 py-1 rounded whitespace-nowrap shadow-lg`}>
      {content}
    </span>
  </span>
);

// ============ Empty state ============
const EmptyState = ({ icon: IconCmp = Icon.Folder, title, desc, action }) => (
  <div className="flex flex-col items-center justify-center text-center px-6 py-12">
    <div className="h-16 w-16 rounded-2xl bg-primary-50 text-primary-700 flex items-center justify-center mb-4">
      <IconCmp size={28}/>
    </div>
    <div className="font-display font-semibold text-neutral-900">{title}</div>
    {desc ? <div className="text-sm text-neutral-600 mt-1 max-w-md">{desc}</div> : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);

// ============ Section header ============
const SectionHeader = ({ title, subtitle, breadcrumbs = [], actions, kpi }) => (
  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between mb-6">
    <div className="min-w-0">
      {breadcrumbs.length > 0 ? (
        <nav className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <Icon.ChevronRight size={12} className="text-neutral-400"/> : null}
              {b.onClick ? <button onClick={b.onClick} className="hover:text-primary-700 transition-colors">{b.label}</button> : <span className={i === breadcrumbs.length - 1 ? 'text-neutral-700 font-medium' : ''}>{b.label}</span>}
            </React.Fragment>
          ))}
        </nav>
      ) : null}
      <h1 className="font-display font-bold text-neutral-900 text-2xl leading-tight">{title}</h1>
      {subtitle ? <p className="text-sm text-neutral-600 mt-1">{subtitle}</p> : null}
    </div>
    {actions ? <div className="flex items-center gap-2 flex-wrap">{actions}</div> : null}
  </div>
);

// ============ Table primitive ============
const Table = ({ columns, rows, onRowClick, selectable = false, selected = [], onSelectChange, empty }) => {
  const allSel = selectable && rows.length > 0 && rows.every((r) => selected.includes(r.id));
  return (
    <div className="overflow-x-auto -mx-5 sm:mx-0">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
            {selectable ? (
              <th className="px-4 py-3 w-10">
                <Checkbox checked={allSel} onChange={(v) => onSelectChange && onSelectChange(v ? rows.map((r) => r.id) : [])}/>
              </th>
            ) : null}
            {columns.map((c, i) => (
              <th key={i} className={`px-4 py-3 font-semibold ${c.right ? 'text-right' : ''} ${c.width || ''}`}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-8 text-center text-neutral-500">{empty || 'Sin resultados'}</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id}
                className={`group hover:bg-neutral-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(r)}>
              {selectable ? (
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.includes(r.id)} onChange={(v) => onSelectChange && onSelectChange(v ? [...selected, r.id] : selected.filter((x) => x !== r.id))}/>
                </td>
              ) : null}
              {columns.map((c, i) => (
                <td key={i} className={`px-4 py-3 ${c.right ? 'text-right' : ''} ${c.mono ? 'font-mono text-[12.5px]' : ''} ${c.tdClass || ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============ Progress bar ============
const Progress = ({ value = 0, color = 'bg-primary-500', className = '', size = 'md' }) => (
  <div className={`w-full rounded-full bg-neutral-100 overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2'} ${className}`}>
    <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}/>
  </div>
);

// ============ KPI Tile ============
const KPI = ({ icon: IconCmp, label, value, unit, delta, tooltip, sparkline, accent = 'primary', extra }) => {
  const accentMap = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    warn:    'bg-warning-50 text-warning-700',
    danger:  'bg-danger-50 text-danger-700',
    info:    'bg-sky-50 text-sky-700',
  };
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${accentMap[accent]}`}><IconCmp size={14}/></span>
            <span className="truncate">{label}</span>
            {tooltip ? <Tooltip content={tooltip}><span className="text-neutral-400 cursor-help"><Icon.CircleAlert size={13}/></span></Tooltip> : null}
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display font-bold text-3xl text-neutral-900 leading-none">{value}</span>
            {unit ? <span className="text-sm text-neutral-500 font-medium">{unit}</span> : null}
          </div>
          {delta || extra ? (
            <div className="mt-2 flex items-center gap-3 text-xs">
              {delta ? (
                <span className={`inline-flex items-center gap-1 font-medium ${delta.value > 0 ? 'text-success-700' : delta.value < 0 ? 'text-danger-700' : 'text-neutral-600'}`}>
                  {delta.value > 0 ? <Icon.ArrowUp size={12}/> : delta.value < 0 ? <Icon.ArrowDown size={12}/> : null}
                  {Math.abs(delta.value)}% {delta.label}
                </span>
              ) : null}
              {extra}
            </div>
          ) : null}
        </div>
        {sparkline ? <div className="w-24 h-12 shrink-0">{sparkline}</div> : null}
      </div>
    </Card>
  );
};

// ============ Tabs ============
const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div className={`flex gap-1 border-b border-neutral-200 overflow-x-auto ${className}`}>
    {tabs.map((t) => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${value === t.id ? 'text-primary-700' : 'text-neutral-600 hover:text-neutral-900'}`}>
        <span className="inline-flex items-center gap-2">
          {t.icon ? <t.icon size={14}/> : null}
          {t.label}
          {t.count != null ? <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded-full">{t.count}</span> : null}
        </span>
        {value === t.id ? <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-primary-500 rounded-full"/> : null}
      </button>
    ))}
  </div>
);

// ============ Logo ============
const Logo = ({ size = 28, dark = false, withText = true }) => (
  <div className="inline-flex items-center gap-2">
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="2" y="2" width="28" height="28" rx="8" fill={dark ? '#FFFFFF' : '#0A2540'}/>
      <path d="M7 24L13 12L16 18L19 13L25 24H7Z" fill={dark ? '#0A2540' : '#0EA5E9'}/>
      <circle cx="22" cy="9" r="2.4" fill={dark ? '#0EA5E9' : '#93C5FD'}/>
    </svg>
    {withText ? (
      <span className={`font-display font-bold tracking-tight text-[17px] ${dark ? 'text-white' : 'text-neutral-900'}`}>
        Minex<span className="text-primary-500">CRM</span>
      </span>
    ) : null}
  </div>
);

// ============ Mini Colombia map (SVG) ============
// Simplified outline. Pin coords are projected from lat/lng to viewBox 0..400 x 0..500.
// Colombia rough bounds: lat -4..13, lng -79..-67. We use lat 14..-5 -> y 0..500, lng -79..-66 -> x 0..400
const projectColombia = (lat, lng) => {
  const x = ((lng - -79) / (-66 - -79)) * 400;
  const y = ((14 - lat) / (14 - -5)) * 500;
  return { x, y };
};

const ColombiaMap = ({ pins = [], onPinClick, height = 420 }) => {
  const [hover, setHover] = useState(null);
  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox="0 0 400 500" className="w-full h-full" role="img" aria-label="Mapa de Colombia">
        <defs>
          <linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFF6FF"/>
            <stop offset="100%" stopColor="#DBEAFE"/>
          </linearGradient>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="14" height="14">
            <circle cx="2" cy="2" r="0.8" fill="#CBD5E1"/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="400" height="500" fill="url(#seaG)"/>
        <rect x="0" y="0" width="400" height="500" fill="url(#dots)" opacity="0.5"/>
        {/* Simplified Colombia outline */}
        <path d="
          M 165 30
          L 220 22 L 250 32 L 270 40 L 290 60 L 305 90 L 295 110
          L 320 120 L 332 145 L 320 170 L 305 175 L 295 200
          L 305 220 L 295 245 L 270 270 L 250 305 L 220 320
          L 200 345 L 190 380 L 175 410 L 150 430 L 130 440
          L 110 425 L 100 400 L 90 370 L 80 340 L 78 310
          L 65 285 L 55 255 L 48 220 L 50 185 L 60 150
          L 72 120 L 90 95 L 108 70 L 130 50 Z"
          fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5"/>
        {/* Department divisions (decorative) */}
        <g stroke="#E2E8F0" strokeWidth="1" fill="none" strokeDasharray="3 2">
          <path d="M 110 180 L 240 175"/>
          <path d="M 100 240 L 250 240"/>
          <path d="M 95 300 L 220 310"/>
          <path d="M 150 100 L 200 200 L 170 350"/>
        </g>
        {/* Region labels */}
        <g fill="#94A3B8" fontSize="9" fontFamily="Inter">
          <text x="195" y="50">La Guajira</text>
          <text x="170" y="100">Cesar</text>
          <text x="135" y="190">Antioquia</text>
          <text x="175" y="220">Boyacá</text>
          <text x="135" y="250">Caldas</text>
          <text x="125" y="350">Cauca</text>
        </g>
        {/* Pins */}
        {pins.map((p) => {
          const { x, y } = projectColombia(p.lat, p.lng);
          const color = p.status === 'active' ? '#10B981' : p.status === 'paused' ? '#F59E0B' : p.status === 'alert' ? '#EF4444' : '#2563EB';
          return (
            <g key={p.id} transform={`translate(${x}, ${y})`} onClick={() => onPinClick && onPinClick(p)}
               onMouseEnter={() => setHover(p)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <circle r="9" fill={color} opacity="0.25"/>
              <circle r="5" fill={color} stroke="#fff" strokeWidth="2"/>
            </g>
          );
        })}
      </svg>
      {hover ? (() => {
        const { x, y } = projectColombia(hover.lat, hover.lng);
        return (
          <div className="absolute bg-white border border-neutral-200 rounded-lg shadow-pop p-3 text-xs pointer-events-none"
            style={{ left: `${(x / 400) * 100}%`, top: `${(y / 500) * 100}%`, transform: 'translate(-50%, -120%)', minWidth: 200 }}>
            <div className="font-display font-semibold text-neutral-900 text-[13px]">{hover.code}</div>
            <div className="text-neutral-700 mt-0.5">{hover.name}</div>
            <div className="text-neutral-500 mt-1 font-mono text-[10px]">{hover.lat.toFixed(2)}°N, {hover.lng.toFixed(2)}°W</div>
            <div className="mt-2 flex items-center gap-2">
              {statusBadge(hover.status, (k) => ({ active: 'Activo', paused: 'En pausa', alert: 'Alerta', completed: 'Completado' }[k] || k))}
              <span className="text-neutral-700">{hover.progress}%</span>
            </div>
          </div>
        );
      })() : null}
    </div>
  );
};

// ============ Mini sparkline (SVG, no recharts dep) ============
const Sparkline = ({ data, color = '#2563EB', height = 36 }) => {
  if (!data || data.length === 0) return null;
  const vals = data.map((d) => d.v != null ? d.v : d);
  const min = Math.min(...vals), max = Math.max(...vals);
  const w = 100, h = height;
  const step = w / (vals.length - 1);
  const pts = vals.map((v, i) => `${i * step},${h - ((v - min) / Math.max(1, max - min)) * (h - 6) - 3}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polyline points={pts} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace('#','')})`}/>
    </svg>
  );
};

// ============ Stripe placeholder image (for photos) ============
const PlaceholderImg = ({ label = 'imagen', color = '#0A2540', height = 140, ratio, className = '' }) => (
  <div className={`relative overflow-hidden rounded-lg ${className}`}
       style={ratio ? { aspectRatio: ratio } : { height }}>
    <div className="absolute inset-0" style={{ backgroundColor: color }}/>
    <div className="absolute inset-0 stripe-bg opacity-30"/>
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="font-mono text-[10px] uppercase tracking-wide text-white/90 bg-black/30 px-2 py-1 rounded">{label}</span>
    </div>
  </div>
);

// ============ FAB ============
const FAB = ({ icon: IconCmp = Icon.Plus, onClick, label = 'Nuevo' }) => (
  <button onClick={onClick} aria-label={label}
    className="md:hidden fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full bg-primary-500 text-white shadow-pop flex items-center justify-center active:scale-95 transition">
    <IconCmp size={22}/>
  </button>
);

window.UI = {
  ToastProvider, useToast,
  Button, IconButton,
  Card, CardHeader,
  Badge, statusBadge,
  Avatar, Drawer, Modal,
  Field, Input, Select, Textarea, Checkbox,
  Tooltip, EmptyState, SectionHeader,
  Table, Progress, KPI, Tabs, Logo,
  ColombiaMap, projectColombia,
  Sparkline, PlaceholderImg, FAB,
};
