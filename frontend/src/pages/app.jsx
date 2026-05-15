// App.jsx — root + routing
const { RouterProvider, useRouter, AppProvider, AppLayout, useApp } = Layout;

// ─── RBAC route guards ────────────────────────────────────────────────────────
const ROUTE_ROLES = {
  dashboard:     ['SUPER_ADMIN','ADMIN','MANAGER','FIELD','VIEWER'],
  proyectos:     ['SUPER_ADMIN','ADMIN','MANAGER','FIELD','VIEWER'],
  clientes:      ['SUPER_ADMIN','ADMIN','MANAGER'],
  pipeline:      ['SUPER_ADMIN','ADMIN','MANAGER'],
  perforaciones: ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'],
  topografia:    ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'],
  geologia:      ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'],
  visitas:       ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'],
  hse:           ['SUPER_ADMIN','ADMIN','MANAGER','FIELD'],
  flota:         ['SUPER_ADMIN','ADMIN','MANAGER'],
  personal:      ['SUPER_ADMIN','ADMIN','MANAGER'],
  reportes:      ['SUPER_ADMIN','ADMIN','MANAGER','VIEWER'],
  portal:        ['SUPER_ADMIN','ADMIN','MANAGER','PORTAL'],
  configuracion: ['SUPER_ADMIN','ADMIN'],
};

function defaultRoute(role) {
  const r = (role || '').toUpperCase();
  if (r === 'PORTAL') return '/portal';
  return '/dashboard';
}

const PageRoot = () => {
  const { path, go } = useRouter();
  const { auth } = useApp();
  const userRole = (auth.user?.role || 'VIEWER').toUpperCase();

  const clean = path.replace(/^#\/?/, '');
  const segs = clean.split('/').filter(Boolean);
  const root = segs[0] || 'login';

  // Login is full screen (no AppLayout)
  if (root === 'login' || root === '') return <PageLogin/>;

  // Route guard — redirect if role not allowed
  const allowed = ROUTE_ROLES[root];
  if (allowed && !allowed.includes(userRole)) {
    React.useEffect(() => { go(defaultRoute(userRole)); }, []);
    return null;
  }

  // All other routes go inside AppLayout
  return (
    <AppLayout>
      {(() => {
        switch (root) {
          case 'dashboard': return <PageDashboard/>;
          case 'proyectos':
            if (segs[1]) return <PageProjectDetail id={segs[1]}/>;
            return <PageProjects/>;
          case 'clientes':
            if (segs[1]) return <PageClientDetail id={segs[1]}/>;
            return <PageClients/>;
          case 'pipeline': return <PagePipeline/>;
          case 'perforaciones':
            if (segs[1]) return <PageWellDetail id={segs[1]}/>;
            return <PageDrilling/>;
          case 'topografia': return <PageTopo/>;
          case 'geologia':   return <PageGeology/>;
          case 'visitas':    return <PageVisits/>;
          case 'hse':
            return <PageHSE sub={segs[1] === 'incidentes' ? 'incidents' : segs[1] === 'permisos' ? 'permits' : segs[1] === 'epp' ? 'epp' : 'incidents'}/>;
          case 'flota':         return <PageFleet/>;
          case 'personal':      return <PagePersonnel/>;
          case 'reportes':      return <PageReports/>;
          case 'portal':        return <PagePortal/>;
          case 'configuracion': return <PageSettings/>;
          default:
            return <UI.EmptyState title="Página no encontrada" desc="La sección a la que intentas acceder no existe." action={<UI.Button onClick={() => go(defaultRoute(userRole))}>Volver al inicio</UI.Button>}/>;
        }
      })()}
    </AppLayout>
  );
};

const App = () => (
  <LangProvider>
    <AppProvider>
      <UI.ToastProvider>
        <RouterProvider>
          <PageRoot/>
        </RouterProvider>
      </UI.ToastProvider>
    </AppProvider>
  </LangProvider>
);

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App/>);
