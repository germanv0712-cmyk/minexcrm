// Clients (list + detail)
const PageClients = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  return (
    <>
      <UI.SectionHeader
        title={t('nav_clients')}
        subtitle="Empresas mineras y operadoras con las que trabajamos"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_clients') }]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>{t('export')}</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus}>Nuevo cliente</UI.Button>
          </>
        }/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Clientes activos</div>
          <div className="font-display font-bold text-2xl mt-1">{MX.clients.length}</div>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">LTV total (COP)</div>
          <div className="font-display font-bold text-2xl mt-1 font-mono">${(MX.clients.reduce((a, c) => a + c.ltv, 0) / 1e9).toFixed(1)}B</div>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Proyectos activos</div>
          <div className="font-display font-bold text-2xl mt-1">{MX.clients.reduce((a, c) => a + c.activeProjects, 0)}</div>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">NPS comercial</div>
          <div className="font-display font-bold text-2xl mt-1">8,6 <span className="text-sm font-normal text-success-700">↗ +0.4</span></div>
        </UI.Card>
      </div>

      <UI.Card padding={false}>
        <UI.Table
          columns={[
            { label: 'Cliente', render: (c) => (
              <div className="inline-flex items-center gap-3">
                <span className="h-10 w-10 rounded-lg text-white font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>
                <div>
                  <div className="font-medium text-neutral-900">{c.name}</div>
                  <div className="text-[11px] text-neutral-500 font-mono">NIT {c.nit}</div>
                </div>
              </div>
            )},
            { label: 'Contacto principal', render: (c) => (
              <div>
                <div className="text-sm text-neutral-900">{c.contact}</div>
                <div className="text-[11px] text-neutral-500">{c.email}</div>
              </div>
            )},
            { label: 'Región', render: (c) => <span className="inline-flex items-center gap-1 text-sm text-neutral-700"><Icon.MapPin size={12} className="text-neutral-400"/>{c.region}</span> },
            { label: 'Proyectos', right: true, render: (c) => <span className="font-mono font-semibold">{c.activeProjects}</span> },
            { label: 'Tier', render: (c) => <UI.Badge kind={c.tier === 'A' ? 'success' : c.tier === 'B' ? 'info' : 'neutral'} dot>{c.tier}</UI.Badge> },
            { label: 'LTV', right: true, render: (c) => <span className="font-mono font-semibold">${(c.ltv / 1e9).toFixed(2)}B</span> },
            { label: 'Próx. reunión', render: (c) => <span className="text-xs font-mono text-neutral-700">{MX.formatDate(c.nextMeeting, lang)}</span> },
            { label: '', right: true, render: () => <UI.IconButton icon={Icon.MoreHorizontal}/> },
          ]}
          rows={MX.clients}
          onRowClick={(c) => go('/clientes/' + c.id)}/>
      </UI.Card>
    </>
  );
};

const PageClientDetail = ({ id }) => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const c = MX.clients.find((x) => x.id === id);
  if (!c) return <UI.EmptyState title="Cliente no encontrado" action={<UI.Button onClick={() => go('/clientes')}>Volver</UI.Button>}/>;
  const projects = MX.projects.filter((p) => p.clientId === c.id);
  const opps = MX.opportunities.filter((o) => o.clientId === c.id);
  const [tab, setTab] = React.useState('overview');

  // Interaction history
  const interactions = [
    { id: 'in1', kind: 'email',  from: 'Andrea Martínez',  text: 'Confirmamos avance mensual, agendar revisión próxima semana.', when: 'hoy · 10:42', icon: Icon.Mail, color: 'bg-sky-500' },
    { id: 'in2', kind: 'call',   from: 'Camilo Echeverri', text: 'Llamada de seguimiento — 24 min', when: 'ayer · 16:10', icon: Icon.Phone, color: 'bg-success-500' },
    { id: 'in3', kind: 'note',   from: 'Nicolás Pardo',    text: 'Nota: están evaluando ampliar el alcance del próximo trimestre.', when: 'hace 2 días', icon: Icon.ClipboardList, color: 'bg-warning-500' },
    { id: 'in4', kind: 'meet',   from: 'Camilo Echeverri', text: 'Reunión técnica — Plataforma B, lecciones aprendidas', when: 'hace 6 días', icon: Icon.Calendar, color: 'bg-primary-500' },
    { id: 'in5', kind: 'wapp',   from: 'Cliente',          text: '"¿Pueden confirmar la fecha de la auditoría?"', when: 'hace 8 días', icon: Icon.MessageCircle, color: 'bg-success-700' },
  ];

  const tabs = [
    { id: 'overview', label: 'Vista general', icon: Icon.LayoutDashboard },
    { id: 'projects', label: 'Proyectos', icon: Icon.FolderKanban, count: projects.length },
    { id: 'opps', label: 'Oportunidades', icon: Icon.TrendingUp, count: opps.length },
    { id: 'docs', label: 'Documentos', icon: Icon.FileText, count: 8 },
    { id: 'history', label: 'Historial', icon: Icon.History },
  ];

  return (
    <>
      <UI.SectionHeader
        title={c.name}
        subtitle={<span className="inline-flex items-center gap-3 text-sm font-mono"><span>NIT {c.nit}</span><span className="text-neutral-400">·</span><span>{c.region}</span><span className="text-neutral-400">·</span><UI.Badge kind={c.tier === 'A' ? 'success' : c.tier === 'B' ? 'info' : 'neutral'} dot>Tier {c.tier}</UI.Badge></span>}
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('nav_clients'), onClick: () => go('/clientes') },
          { label: c.name },
        ]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Mail}>Enviar correo</UI.Button>
            <UI.Button kind="secondary" size="sm" icon={Icon.Phone}>Registrar llamada</UI.Button>
            <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nueva oportunidad</UI.Button>
          </>
        }/>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <UI.Card className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <span className="h-16 w-16 rounded-xl text-white text-xl font-display font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>
            <div className="flex-1">
              <div className="font-display font-bold text-xl text-neutral-900">{c.name}</div>
              <div className="text-sm text-neutral-600 mt-0.5">Empresa minera · Operaciones en {c.region}</div>
              <div className="mt-2 flex items-center gap-4 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1.5"><Icon.Phone size={12}/>{c.phone}</span>
                <span className="inline-flex items-center gap-1.5"><Icon.Mail size={12}/>{c.email}</span>
              </div>
            </div>
          </div>
        </UI.Card>
        <UI.Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] text-neutral-500">LTV</div>
              <div className="font-display font-bold text-lg font-mono">${(c.ltv / 1e9).toFixed(2)}B</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">Proyectos activos</div>
              <div className="font-display font-bold text-lg">{c.activeProjects}</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">Oportunidades</div>
              <div className="font-display font-bold text-lg">{opps.length}</div>
            </div>
            <div>
              <div className="text-[11px] text-neutral-500">Próxima reunión</div>
              <div className="font-display font-bold text-sm font-mono">{MX.formatDate(c.nextMeeting, lang)}</div>
            </div>
          </div>
        </UI.Card>
      </div>

      <UI.Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5"/>

      {tab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <UI.Card className="lg:col-span-2">
            <UI.CardHeader title="Contactos del cliente" icon={Icon.Users} right={<UI.Button kind="ghost" size="sm" icon={Icon.Plus}>Agregar</UI.Button>}/>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: c.contact, role: 'Gerente de Operaciones', email: c.email, phone: c.phone, main: true },
                { name: 'Sandra Beltrán', role: 'Coordinadora de Compras', email: 'sandra.beltran@' + c.name.toLowerCase().split(' ')[0] + '.com', phone: '+57 5 350 5500' },
                { name: 'Felipe Cárdenas', role: 'Líder de Geología', email: 'fcardenas@' + c.name.toLowerCase().split(' ')[0] + '.com', phone: '+57 320 887 4400' },
                { name: 'Diana Restrepo', role: 'HSE Manager', email: 'drestrepo@' + c.name.toLowerCase().split(' ')[0] + '.com', phone: '+57 310 220 1100' },
              ].map((ct, i) => (
                <div key={i} className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-neutral-900 text-sm inline-flex items-center gap-2">{ct.name}{ct.main ? <UI.Badge kind="primary" size="sm">Principal</UI.Badge> : null}</div>
                      <div className="text-xs text-neutral-600">{ct.role}</div>
                    </div>
                    <UI.IconButton icon={Icon.MoreHorizontal} size="sm"/>
                  </div>
                  <div className="mt-2 text-xs text-neutral-700 flex flex-col gap-0.5">
                    <span className="inline-flex items-center gap-1.5"><Icon.Mail size={11}/>{ct.email}</span>
                    <span className="inline-flex items-center gap-1.5"><Icon.Phone size={11}/>{ct.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Actividad reciente" icon={Icon.Activity}/>
            <ol className="mt-4 space-y-3">
              {interactions.slice(0, 4).map((it) => {
                const IconCmp = it.icon;
                return (
                  <li key={it.id} className="flex items-start gap-3">
                    <span className={`h-7 w-7 rounded-full text-white flex items-center justify-center shrink-0 ${it.color}`}><IconCmp size={12}/></span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-neutral-800 leading-snug"><span className="font-semibold">{it.from}</span> · {it.text}</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">{it.when}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </UI.Card>
        </div>
      ) : tab === 'projects' ? (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Código', mono: true, render: (p) => <span className="font-mono text-primary-700 font-semibold">{p.code}</span> },
            { label: 'Nombre', render: (p) => p.name },
            { label: 'Servicio', render: (p) => p.service },
            { label: 'Avance', render: (p) => <div className="flex items-center gap-2 min-w-[100px]"><UI.Progress value={p.progress} size="sm"/><span className="text-xs font-mono">{p.progress}%</span></div> },
            { label: 'Valor', right: true, render: (p) => <span className="font-mono text-sm">${(p.contractValue / 1e9).toFixed(2)}B</span> },
            { label: 'Estado', render: (p) => UI.statusBadge(p.status, t) },
          ]} rows={projects} onRowClick={(p) => go('/proyectos/' + p.id)}/>
        </UI.Card>
      ) : tab === 'opps' ? (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Oportunidad', render: (o) => o.name },
            { label: 'Etapa', render: (o) => <UI.Badge kind="primary" dot>{t('stage_' + o.stage)}</UI.Badge> },
            { label: 'Monto', right: true, render: (o) => <span className="font-mono font-semibold">${(o.amount / 1e9).toFixed(2)}B</span> },
            { label: 'Probabilidad', render: (o) => <span className="font-mono">{o.prob}%</span> },
            { label: 'Cierre', render: (o) => <span className="font-mono text-xs">{MX.formatDate(o.closeDate, lang)}</span> },
            { label: 'Próxima acción', render: (o) => <span className="text-xs text-neutral-700">{o.next}</span> },
          ]} rows={opps} onRowClick={() => go('/pipeline')}/>
        </UI.Card>
      ) : tab === 'docs' ? (
        <ProjectDocs/>
      ) : (
        <UI.Card>
          <UI.CardHeader title="Historial completo de interacciones" icon={Icon.History}/>
          <ol className="mt-4 relative border-l-2 border-neutral-200 ml-3 pl-6 space-y-5">
            {interactions.map((it) => {
              const IconCmp = it.icon;
              return (
                <li key={it.id} className="relative">
                  <span className={`absolute -left-[37px] top-0 h-7 w-7 rounded-full ${it.color} text-white flex items-center justify-center ring-4 ring-white`}><IconCmp size={12}/></span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xs text-neutral-500">{it.when}</span>
                    <span className="font-semibold text-neutral-900">{it.from}</span>
                  </div>
                  <p className="text-sm text-neutral-700 mt-1">{it.text}</p>
                </li>
              );
            })}
          </ol>
        </UI.Card>
      )}
    </>
  );
};

window.PageClients = PageClients;
window.PageClientDetail = PageClientDetail;
