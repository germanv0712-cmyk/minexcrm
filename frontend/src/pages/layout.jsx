// AppLayout, Sidebar, Topbar, RouterContext

// ============ Router ============
const RouterContext = React.createContext({ path: '#/dashboard', go: () => {} });

const RouterProvider = ({ children }) => {
  const [path, setPath] = React.useState(() => window.location.hash || '#/login');
  React.useEffect(() => {
    if (!window.location.hash) window.location.hash = '#/login';
    const onChange = () => setPath(window.location.hash || '#/login');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const go = React.useCallback((to) => {
    window.location.hash = to.startsWith('#') ? to : '#' + to;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return <RouterContext.Provider value={{ path, go }}>{children}</RouterContext.Provider>;
};

const useRouter = () => React.useContext(RouterContext);

// ============ Auth/Tenant context ============
const AppContext = React.createContext({});
const AppProvider = ({ children }) => {
  const [auth, setAuth] = React.useState(() => {
    const u = window.MxAuth?.getUser();
    return u
      ? { signed: true, user: u }
      : { signed: false, user: { name: 'Demo', role: 'ADMIN', email: '', avatar: 'DM', color: '#2563EB' } };
  });
  const [tenant, setTenant] = React.useState(MX.tenants[0]);
  const [dark, setDark] = React.useState(() => localStorage.getItem('mx_dark') === '1');
  React.useEffect(() => {
    if (dark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('mx_dark', dark ? '1' : '0');
  }, [dark]);
  return <AppContext.Provider value={{ auth, setAuth, tenant, setTenant, dark, setDark }}>{children}</AppContext.Provider>;
};
const useApp = () => React.useContext(AppContext);

// ============ RBAC ============
const ALL_ROLES = ['SUPER_ADMIN','ADMIN','MANAGER','FIELD','VIEWER','PORTAL'];
const MGMT      = ['SUPER_ADMIN','ADMIN','MANAGER'];
const OPS       = ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'];

// ============ Sidebar ============
const NAV = [
  { id: 'dashboard', labelKey: 'nav_dashboard', icon: 'LayoutDashboard', route: '/dashboard', roles: ['SUPER_ADMIN','ADMIN','MANAGER','FIELD','VIEWER'] },
  { id: 'projects',  labelKey: 'nav_projects',  icon: 'FolderKanban',    route: '/proyectos', roles: ['SUPER_ADMIN','ADMIN','MANAGER','FIELD','VIEWER'] },
  { id: 'clients',   labelKey: 'nav_clients',   icon: 'Building2',       route: '/clientes',  roles: MGMT },
  { id: 'pipeline',  labelKey: 'nav_pipeline',  icon: 'TrendingUp',      route: '/pipeline',  roles: MGMT },
  { id: 'field',     labelKey: 'nav_field',     icon: 'HardHat',         roles: OPS, children: [
    { id: 'drilling', labelKey: 'nav_drilling', route: '/perforaciones' },
    { id: 'topo',     labelKey: 'nav_topo',     route: '/topografia' },
    { id: 'geology',  labelKey: 'nav_geology',  route: '/geologia' },
    { id: 'visits',   labelKey: 'nav_visits',   route: '/visitas' },
  ]},
  { id: 'hse',       labelKey: 'nav_hse',       icon: 'ShieldAlert',     roles: OPS, children: [
    { id: 'incidents', labelKey: 'nav_incidents', route: '/hse/incidentes' },
    { id: 'permits',   labelKey: 'nav_permits',   route: '/hse/permisos' },
    { id: 'epp',       labelKey: 'nav_epp',       route: '/hse/epp' },
  ]},
  { id: 'fleet',    labelKey: 'nav_fleet',     icon: 'Truck',           route: '/flota',    roles: MGMT },
  { id: 'people',   labelKey: 'nav_personnel', icon: 'Users',           route: '/personal', roles: MGMT },
  { id: 'reports',  labelKey: 'nav_reports',   icon: 'BarChart3',       route: '/reportes', roles: ['SUPER_ADMIN','ADMIN','MANAGER','VIEWER'] },
  { id: 'portal',   labelKey: 'nav_portal',    icon: 'Globe',           route: '/portal',   roles: ['SUPER_ADMIN','ADMIN','MANAGER','PORTAL'] },
];
const SETTINGS_NAV = { id: 'settings', labelKey: 'nav_settings', icon: 'Settings', route: '/configuracion', roles: ['SUPER_ADMIN','ADMIN'] };

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { t } = useT();
  const { path, go } = useRouter();
  const { auth } = useApp();
  const userRole = (auth.user?.role || 'VIEWER').toUpperCase();
  const [openGroup, setOpenGroup] = React.useState(() => {
    if (path.includes('/perforaciones') || path.includes('/topografia') || path.includes('/geologia') || path.includes('/visitas')) return 'field';
    if (path.includes('/hse/')) return 'hse';
    return null;
  });
  React.useEffect(() => {
    if (path.includes('/perforaciones') || path.includes('/topografia') || path.includes('/geologia') || path.includes('/visitas')) setOpenGroup('field');
    if (path.includes('/hse/')) setOpenGroup('hse');
  }, [path]);

  const canSee = (it) => !it.roles || it.roles.includes(userRole);

  const isActive = (route) => path.startsWith('#' + route);

  const item = (it) => {
    const IconCmp = Icon[it.icon] || Icon.Folder;
    if (it.children) {
      const open = openGroup === it.id;
      const childActive = it.children.some((c) => isActive(c.route));
      if (collapsed) {
        return (
          <UI.Tooltip content={t(it.labelKey)} side="top" key={it.id}>
            <button onClick={() => { setCollapsed(false); setOpenGroup(it.id); }}
              className={`flex items-center justify-center w-10 h-10 rounded-lg mx-auto my-0.5 transition-colors ${childActive ? 'bg-primary-500/10 text-primary-300' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
              <IconCmp size={18}/>
            </button>
          </UI.Tooltip>
        );
      }
      return (
        <div key={it.id}>
          <button onClick={() => setOpenGroup(open ? null : it.id)}
            className={`flex items-center justify-between w-full px-3 py-2 rounded-lg my-0.5 text-sm transition-colors ${childActive ? 'bg-white/5 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
            <span className="inline-flex items-center gap-3"><IconCmp size={18}/>{t(it.labelKey)}</span>
            <Icon.ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`}/>
          </button>
          {open ? (
            <div className="ml-3 pl-3 border-l border-white/10 my-1 flex flex-col gap-0.5">
              {it.children.map((c) => (
                <button key={c.id} onClick={() => go(c.route)}
                  className={`text-left px-3 py-1.5 rounded-md text-[13px] transition-colors ${isActive(c.route) ? 'bg-primary-500/15 text-white font-medium' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
                  {t(c.labelKey)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      );
    }
    const active = isActive(it.route);
    if (collapsed) {
      return (
        <UI.Tooltip content={t(it.labelKey)} side="top" key={it.id}>
          <button onClick={() => go(it.route)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg mx-auto my-0.5 transition-colors ${active ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
            <IconCmp size={18}/>
          </button>
        </UI.Tooltip>
      );
    }
    return (
      <button key={it.id} onClick={() => go(it.route)}
        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg my-0.5 text-sm transition-colors ${active ? 'bg-primary-500 text-white shadow-sm' : 'text-neutral-300 hover:bg-white/5 hover:text-white'}`}>
        <IconCmp size={18}/>
        <span>{t(it.labelKey)}</span>
      </button>
    );
  };

  return (
    <aside className={`hidden md:flex flex-col bg-primary-900 text-neutral-100 border-r border-black/30 transition-all ${collapsed ? 'w-[68px]' : 'w-[244px]'} shrink-0`}>
      <div className={`h-14 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-3'} border-b border-white/5`}>
        {collapsed ? <UI.Logo dark withText={false} size={24}/> : <UI.Logo dark size={26}/>}
        {!collapsed ? (
          <button onClick={() => setCollapsed(true)} className="text-neutral-400 hover:text-white p-1.5 rounded-md hover:bg-white/5" aria-label="Colapsar">
            <Icon.PanelLeft size={16}/>
          </button>
        ) : null}
      </div>
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed ? 'px-1' : 'px-2'}`}>
        {NAV.filter(canSee).map(item)}
        <div className="my-2 border-t border-white/5"/>
        {canSee(SETTINGS_NAV) ? item(SETTINGS_NAV) : null}
      </nav>
      {collapsed ? (
        <button onClick={() => setCollapsed(false)} className="m-2 p-2 rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white flex items-center justify-center" aria-label="Expandir">
          <Icon.ChevronRight size={16}/>
        </button>
      ) : (
        <div className="m-3 p-3 rounded-lg bg-white/5 text-xs text-neutral-300">
          <div className="font-semibold text-white mb-1">Plan Enterprise</div>
          <div className="text-neutral-400">Hasta 12 proyectos activos · 250 GB</div>
          <button className="mt-2 text-primary-300 hover:text-white text-xs font-medium">Ver detalle →</button>
        </div>
      )}
    </aside>
  );
};

// ============ Topbar ============
const Topbar = ({ collapsed, setCollapsed, onMobileMenu }) => {
  const { t, lang, setLang } = useT();
  const { tenant, setTenant, dark, setDark, auth, setAuth } = useApp();
  const { go } = useRouter();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState('');
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);
  const [tenantOpen, setTenantOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const refs = {
    notif: React.useRef(null), user: React.useRef(null),
    tenant: React.useRef(null), lang: React.useRef(null), search: React.useRef(null),
  };
  React.useEffect(() => {
    const handle = (e) => {
      Object.entries(refs).forEach(([k, r]) => {
        if (r.current && !r.current.contains(e.target)) {
          if (k === 'notif') setNotifOpen(false);
          if (k === 'user') setUserOpen(false);
          if (k === 'tenant') setTenantOpen(false);
          if (k === 'lang') setLangOpen(false);
          if (k === 'search') setSearchOpen(false);
        }
      });
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const results = React.useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    if (!q) return [];
    const r = [];
    MX.projects.forEach((p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) ? r.push({ kind: 'Proyecto', label: p.name, sub: p.code, route: '/proyectos/' + p.id }) : null);
    MX.wells.forEach((w) => w.code.toLowerCase().includes(q) ? r.push({ kind: 'Pozo', label: w.code, sub: MX.projects.find(p => p.id === w.projectId)?.name, route: '/perforaciones/' + w.id }) : null);
    MX.people.forEach((u) => u.name.toLowerCase().includes(q) ? r.push({ kind: 'Persona', label: u.name, sub: u.role, route: '/personal' }) : null);
    MX.clients.forEach((c) => c.name.toLowerCase().includes(q) ? r.push({ kind: 'Cliente', label: c.name, sub: c.nit, route: '/clientes/' + c.id }) : null);
    return r.slice(0, 8);
  }, [searchQ]);

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center px-3 sm:px-5 gap-3 shrink-0">
      {/* Mobile menu */}
      <button onClick={onMobileMenu} className="md:hidden text-neutral-700 p-1.5 rounded-md hover:bg-neutral-100" aria-label="Menu">
        <Icon.Menu size={20}/>
      </button>
      {/* Desktop collapse handle */}
      <button onClick={() => setCollapsed(!collapsed)} className="hidden md:inline-flex text-neutral-500 hover:text-neutral-900 p-1.5 rounded-md hover:bg-neutral-100" aria-label="Toggle sidebar">
        <Icon.Menu size={18}/>
      </button>
      <div className="md:hidden">
        <UI.Logo size={22}/>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xl" ref={refs.search}>
        <UI.Input icon={Icon.Search}
          value={searchQ}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => { setSearchQ(e.target.value); setSearchOpen(true); }}
          placeholder={t('search_placeholder')}/>
        {searchOpen && (searchQ || results.length) ? (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-lg shadow-pop z-40 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-4 py-6 text-sm text-neutral-500 text-center">Sin resultados para "{searchQ}"</div>
            ) : results.map((r, i) => (
              <button key={i} onClick={() => { go(r.route); setSearchOpen(false); setSearchQ(''); }}
                className="w-full text-left px-4 py-2.5 hover:bg-neutral-50 flex items-center justify-between gap-3 border-b border-neutral-100 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{r.label}</div>
                  {r.sub ? <div className="text-xs text-neutral-500 truncate">{r.sub}</div> : null}
                </div>
                <UI.Badge kind="neutral" size="sm">{r.kind}</UI.Badge>
              </button>
            ))}
            <div className="px-4 py-2 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Resultados en vivo</span>
              <span className="font-mono">↵ para abrir</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Tenant selector */}
      <div className="relative hidden lg:block" ref={refs.tenant}>
        <button onClick={() => setTenantOpen(!tenantOpen)}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors">
          <span className="h-6 w-6 rounded bg-primary-700 text-white text-[10px] font-bold inline-flex items-center justify-center">{tenant.short}</span>
          <span className="text-sm font-medium text-neutral-900 truncate max-w-[140px]">{tenant.name}</span>
          <Icon.ChevronDown size={14} className="text-neutral-500"/>
        </button>
        {tenantOpen ? (
          <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-pop z-40 overflow-hidden">
            <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-neutral-500 bg-neutral-50">Cambiar de empresa</div>
            {MX.tenants.map((tt) => (
              <button key={tt.id} onClick={() => { setTenant(tt); setTenantOpen(false); }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-neutral-50 ${tt.id === tenant.id ? 'bg-primary-50' : ''}`}>
                <span className="h-7 w-7 rounded bg-primary-700 text-white text-[10px] font-bold inline-flex items-center justify-center">{tt.short}</span>
                <span className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-neutral-900 block truncate">{tt.name}</span>
                  <span className="text-[11px] text-neutral-500 font-mono">NIT {tt.nit}</span>
                </span>
                {tt.id === tenant.id ? <Icon.Check size={14} className="text-primary-500"/> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Lang */}
      <div className="relative" ref={refs.lang}>
        <button onClick={() => setLangOpen(!langOpen)}
          className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg hover:bg-neutral-100">
          <span className="text-[15px]">{lang === 'es' ? '🇨🇴' : '🇺🇸'}</span>
          <span className="text-xs font-semibold uppercase text-neutral-700">{lang}</span>
        </button>
        {langOpen ? (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-neutral-200 rounded-lg shadow-pop z-40 overflow-hidden">
            {[{ k: 'es', f: '🇨🇴', name: 'Español' }, { k: 'en', f: '🇺🇸', name: 'English' }].map((l) => (
              <button key={l.k} onClick={() => { setLang(l.k); setLangOpen(false); }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 ${l.k === lang ? 'bg-primary-50' : ''}`}>
                <span className="text-base">{l.f}</span>
                <span className="text-sm">{l.name}</span>
                {l.k === lang ? <Icon.Check size={12} className="ml-auto text-primary-500"/> : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Theme */}
      <UI.IconButton icon={dark ? Icon.Sun : Icon.Moon} onClick={() => setDark(!dark)} label="Tema"/>

      {/* Notifications */}
      <div className="relative" ref={refs.notif}>
        <button onClick={() => setNotifOpen(!notifOpen)}
          className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg hover:bg-neutral-100">
          <Icon.Bell size={18} className="text-neutral-700"/>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white"/>
        </button>
        {notifOpen ? (
          <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-neutral-200 rounded-lg shadow-pop z-40 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200">
              <span className="font-display font-semibold text-neutral-900">{t('notifications')}</span>
              <button className="text-xs text-primary-700 hover:text-primary-500 font-medium">Marcar como leído</button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {MX.notifications.map((n) => {
                const IconCmp = Icon[n.icon] || Icon.Bell;
                const accent = { danger: 'bg-danger-50 text-danger-700', warn: 'bg-warning-50 text-warning-700', info: 'bg-sky-50 text-sky-700', success: 'bg-success-50 text-success-700' }[n.severity];
                return (
                  <div key={n.id} className="px-4 py-3 hover:bg-neutral-50 flex items-start gap-3 border-b border-neutral-100 last:border-0 cursor-pointer">
                    <span className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${accent}`}><IconCmp size={14}/></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900">{n.title}</div>
                      <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{n.desc}</div>
                      <div className="text-[10px] text-neutral-400 mt-1 font-mono">{n.when}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-200 text-center">
              <button className="text-xs text-primary-700 hover:text-primary-500 font-medium">Ver todas las notificaciones</button>
            </div>
          </div>
        ) : null}
      </div>

      {/* User */}
      <div className="relative" ref={refs.user}>
        <button onClick={() => setUserOpen(!userOpen)} className="flex items-center gap-2 h-9 px-1 sm:pl-1 sm:pr-2 rounded-lg hover:bg-neutral-100">
          <UI.Avatar name={auth.user.name} color={auth.user.color} size={28}/>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-neutral-900 leading-none">{auth.user.name}</span>
            <span className="text-[10px] text-neutral-500 leading-none mt-0.5">{auth.user.role}</span>
          </div>
        </button>
        {userOpen ? (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-pop z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-200 flex items-center gap-3">
              <UI.Avatar name={auth.user.name} color={auth.user.color} size={40}/>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 truncate">{auth.user.name}</div>
                <div className="text-xs text-neutral-500 truncate">{auth.user.email}</div>
              </div>
            </div>
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm flex items-center gap-2 text-neutral-700"><Icon.IdCard size={14}/>{t('profile')}</button>
              <button onClick={() => { go('/configuracion'); setUserOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm flex items-center gap-2 text-neutral-700"><Icon.Settings size={14}/>{t('nav_settings')}</button>
              <div className="my-1 border-t border-neutral-200"/>
              <button onClick={async () => { await window.MxAuth?.logout().catch(() => {}); setAuth({ signed: false, user: { name: 'Demo', role: 'ADMIN', email: '', avatar: 'DM', color: '#2563EB' } }); go('/login'); }} className="w-full text-left px-4 py-2 hover:bg-neutral-50 text-sm flex items-center gap-2 text-danger-700"><Icon.LogOut size={14}/>{t('logout')}</button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
};

// ============ Mobile bottom nav ============
const MobileBottomNav = () => {
  const { t } = useT();
  const { go, path } = useRouter();
  const tabs = [
    { id: 'dashboard', icon: Icon.LayoutDashboard, route: '/dashboard', label: t('nav_dashboard') },
    { id: 'projects', icon: Icon.FolderKanban, route: '/proyectos', label: t('nav_projects') },
    { id: 'visits', icon: Icon.MapPin, route: '/visitas', label: t('nav_visits') },
    { id: 'hse', icon: Icon.ShieldAlert, route: '/hse/incidentes', label: 'HSE' },
    { id: 'more', icon: Icon.MoreHorizontal, route: '/configuracion', label: 'Más' },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-neutral-200 flex h-16">
      {tabs.map((t) => {
        const active = path.startsWith('#' + t.route);
        return (
          <button key={t.id} onClick={() => go(t.route)} className={`flex-1 flex flex-col items-center justify-center gap-0.5 ${active ? 'text-primary-700' : 'text-neutral-500'}`}>
            <t.icon size={20}/>
            <span className="text-[10px] font-medium">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// ============ Mobile drawer for sidebar ============
const MobileNavDrawer = ({ open, onClose }) => {
  const { t } = useT();
  const { go, path } = useRouter();
  const { auth } = useApp();
  const userRole = (auth.user?.role || 'VIEWER').toUpperCase();
  const canSee = (it) => !it.roles || it.roles.includes(userRole);
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}/>
      <aside className="absolute left-0 top-0 h-full w-72 bg-primary-900 text-neutral-100 p-3 overflow-y-auto">
        <div className="flex items-center justify-between mb-3 px-2">
          <UI.Logo dark/>
          <button onClick={onClose} className="text-neutral-300 p-2"><Icon.X size={18}/></button>
        </div>
        {NAV.filter(canSee).map((it) => {
          const IconCmp = Icon[it.icon];
          if (it.children) {
            return (
              <div key={it.id} className="mt-2">
                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-neutral-400 flex items-center gap-2"><IconCmp size={14}/>{t(it.labelKey)}</div>
                {it.children.map((c) => (
                  <button key={c.id} onClick={() => { go(c.route); onClose(); }}
                    className={`block w-full text-left px-6 py-2 text-sm rounded-lg ${path.startsWith('#' + c.route) ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:bg-white/5'}`}>
                    {t(c.labelKey)}
                  </button>
                ))}
              </div>
            );
          }
          return (
            <button key={it.id} onClick={() => { go(it.route); onClose(); }}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm ${path.startsWith('#' + it.route) ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:bg-white/5'}`}>
              <IconCmp size={18}/>{t(it.labelKey)}
            </button>
          );
        })}
        {canSee(SETTINGS_NAV) ? (
          <button onClick={() => { go(SETTINGS_NAV.route); onClose(); }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm mt-2 ${path.startsWith('#' + SETTINGS_NAV.route) ? 'bg-primary-500 text-white' : 'text-neutral-300 hover:bg-white/5'}`}>
            <Icon.Settings size={18}/>{t(SETTINGS_NAV.labelKey)}
          </button>
        ) : null}
      </aside>
    </div>
  );
};

// ============ App layout ============
const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = React.useState(() => localStorage.getItem('mx_collapsed') === '1');
  const [mobileNav, setMobileNav] = React.useState(false);
  React.useEffect(() => { localStorage.setItem('mx_collapsed', collapsed ? '1' : '0'); }, [collapsed]);
  return (
    <div className="min-h-screen h-screen flex bg-neutral-50">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <MobileNavDrawer open={mobileNav} onClose={() => setMobileNav(false)}/>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} onMobileMenu={() => setMobileNav(true)}/>
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6 fade-in">{children}</div>
        </main>
        <MobileBottomNav/>
      </div>
    </div>
  );
};

window.Layout = { RouterContext, RouterProvider, useRouter, AppContext, AppProvider, useApp, AppLayout, NAV };
