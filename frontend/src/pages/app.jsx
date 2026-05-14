// App.jsx — root + routing
const { RouterProvider, useRouter, AppProvider, AppLayout } = Layout;

const PageRoot = () => {
  const { path } = useRouter();
  // Parse hash route: #/segment/subsegment
  const clean = path.replace(/^#\/?/, '');
  const segs = clean.split('/').filter(Boolean);
  const root = segs[0] || 'login';

  // Login is full screen (no AppLayout)
  if (root === 'login' || root === '') return <PageLogin/>;

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
            return <UI.EmptyState title="Página no encontrada" desc="La sección a la que intentas acceder no existe." action={<UI.Button onClick={() => window.location.hash = '#/dashboard'}>Ir al Dashboard</UI.Button>}/>;
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
