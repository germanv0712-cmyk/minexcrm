// Projects list + Project detail (tabs)
const projectStatusOptions = ['all', 'active', 'paused', 'alert', 'completed'];
const serviceTypes = ['all', 'Perforación diamantina', 'Perforación RC', 'Magnetometría aérea', 'Geofísica IP', 'Perforación + Geología', 'Topografía + Geología'];

const PageProjects = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const toast = UI.useToast();
  const [view, setView] = React.useState('list');
  const [filters, setFilters] = React.useState({ client: 'all', service: 'all', status: 'all', q: '' });
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [selected, setSelected] = React.useState([]);

  const allProjects = Store.useProjects();

  const rows = React.useMemo(() => allProjects.filter((p) => {
    if (filters.status !== 'all' && p.status !== filters.status) return false;
    if (filters.client !== 'all' && p.clientId !== filters.client) return false;
    if (filters.service !== 'all' && p.service !== filters.service) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [filters]);

  const columns = [
    { label: t('code'), mono: true, render: (p) => <span className="font-mono text-primary-700 font-semibold">{p.code}</span> },
    { label: t('name'), render: (p) => (
      <div className="min-w-0">
        <div className="font-medium text-neutral-900 truncate">{p.name}</div>
        <div className="text-[11px] text-neutral-500">{p.region}</div>
      </div>
    )},
    { label: t('client'), render: (p) => {
      const c = Store.clients.find((x) => x.id === p.clientId) || MX.clients.find((x) => x.id === p.clientId) || { name: p.clientId, color: '#94A3B8', logo: '?' };
      return <div className="inline-flex items-center gap-2">
        <span className="h-6 w-6 rounded text-white text-[10px] font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>
        <span className="text-sm text-neutral-700">{c.name}</span>
      </div>;
    }},
    { label: t('service_type'), render: (p) => <span className="text-sm text-neutral-700">{p.service}</span> },
    { label: t('progress'), render: (p) => (
      <div className="min-w-[120px]">
        <div className="flex items-center gap-2">
          <UI.Progress value={p.progress} size="sm" color={p.progress >= 90 ? 'bg-success-500' : p.progress >= 40 ? 'bg-primary-500' : 'bg-warning-500'}/>
          <span className="text-xs text-neutral-700 font-mono">{p.progress}%</span>
        </div>
      </div>
    )},
    { label: t('start'), render: (p) => <span className="text-xs text-neutral-700 font-mono">{MX.formatDate(p.start, lang)}</span> },
    { label: t('end_est'), render: (p) => <span className="text-xs text-neutral-700 font-mono">{MX.formatDate(p.end, lang)}</span> },
    { label: t('responsible'), render: (p) => {
      const u = MX.people.find((x) => x.id === p.ownerId);
      return <div className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={26}/><span className="text-sm text-neutral-700 truncate max-w-[120px]">{u.name}</span></div>;
    }},
    { label: t('status'), render: (p) => UI.statusBadge(p.status, t) },
    { label: '', right: true, render: (p) => <UI.IconButton icon={Icon.MoreHorizontal} label="Acciones" onClick={(e) => { e.stopPropagation(); }}/> },
  ];

  return (
    <>
      <UI.SectionHeader
        title={t('projects_title')}
        subtitle="Gestión integral de proyectos comerciales y operativos"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('projects_title') }]}
        actions={
          <>
            <ViewToggle value={view} onChange={setView}/>
            <UI.Button kind="primary" icon={Icon.Plus} onClick={() => setWizardOpen(true)}>{t('new_project')}</UI.Button>
          </>
        }/>

      {/* Filters */}
      <UI.Card className="mb-4" padding={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <UI.Input icon={Icon.Search} placeholder="Buscar por código o nombre…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="!w-64"/>
          <UI.Select value={filters.client} onChange={(e) => setFilters({ ...filters, client: e.target.value })} className="!w-44">
            <option value="all">Todos los clientes</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </UI.Select>
          <UI.Select value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })} className="!w-52">
            {serviceTypes.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todos los servicios' : s}</option>)}
          </UI.Select>
          <UI.Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="!w-40">
            {projectStatusOptions.map((s) => <option key={s} value={s}>{s === 'all' ? 'Todos los estados' : t(s)}</option>)}
          </UI.Select>
          <div className="ml-auto flex items-center gap-2 text-xs text-neutral-500">
            <Icon.Filter size={14}/> {rows.length} resultados
          </div>
        </div>
        {selected.length ? (
          <div className="border-t border-neutral-200 bg-primary-50 px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-primary-900 font-medium">{selected.length} seleccionados</span>
            <div className="flex items-center gap-2">
              <UI.Button kind="secondary" size="sm" icon={Icon.Download}>Exportar</UI.Button>
              <UI.Button kind="secondary" size="sm" icon={Icon.Edit}>Editar masivo</UI.Button>
              <UI.Button kind="ghost" size="sm" onClick={() => setSelected([])}>Limpiar</UI.Button>
            </div>
          </div>
        ) : null}
      </UI.Card>

      {view === 'list' ? (
        <UI.Card padding={false}>
          <UI.Table columns={columns} rows={rows} selectable selected={selected} onSelectChange={setSelected}
            onRowClick={(p) => go('/proyectos/' + p.id)}/>
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 text-xs text-neutral-600">
            <span>1–{rows.length} de {rows.length}</span>
            <div className="flex items-center gap-1">
              <UI.IconButton icon={Icon.ChevronLeft} label="Anterior"/>
              <span className="px-2 font-mono">1 / 1</span>
              <UI.IconButton icon={Icon.ChevronRight} label="Siguiente"/>
            </div>
          </div>
        </UI.Card>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rows.map((p) => {
            const c = Store.clients.find((x) => x.id === p.clientId) || MX.clients.find((x) => x.id === p.clientId) || { name: p.clientId, color: '#94A3B8', logo: '?' };
            const u = MX.people.find((x) => x.id === p.ownerId) || { name: 'Equipo', color: '#94A3B8' };
            return (
              <UI.Card key={p.id} className="cursor-pointer hover:shadow-pop transition-shadow" onClick={() => go('/proyectos/' + p.id)} padding={false}>
                <UI.PlaceholderImg label={p.service} color={p.photo} height={140} className="rounded-b-none"/>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-primary-700 font-semibold">{p.code}</div>
                      <div className="font-display font-semibold text-neutral-900 mt-0.5 truncate">{p.name}</div>
                    </div>
                    {UI.statusBadge(p.status, t)}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-neutral-600">
                    <span className="h-6 w-6 rounded text-white text-[10px] font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>
                    {c.name} · {p.region}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-600">{t('progress')}</span>
                      <span className="font-mono text-neutral-900 font-medium">{p.progress}%</span>
                    </div>
                    <UI.Progress value={p.progress} color={p.progress >= 90 ? 'bg-success-500' : p.progress >= 40 ? 'bg-primary-500' : 'bg-warning-500'}/>
                  </div>
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-xs text-neutral-700"><UI.Avatar name={u.name} color={u.color} size={22}/> {u.name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">→ {MX.formatDate(p.end, lang)}</div>
                  </div>
                </div>
              </UI.Card>
            );
          })}
        </div>
      ) : (
        <UI.Card>
          <UI.CardHeader title="Vista mapa" subtitle={`${rows.length} proyectos georreferenciados`} icon={Icon.MapPin}/>
          <div className="mt-3">
            <UI.ColombiaMap pins={rows} onPinClick={(p) => go('/proyectos/' + p.id)} height={520}/>
          </div>
        </UI.Card>
      )}

      <NewProjectWizard open={wizardOpen} onClose={() => setWizardOpen(false)} onCreated={(code) => { setWizardOpen(false); toast.push({ kind: 'success', title: 'Proyecto creado', desc: `Código ${code} listo.` }); }}/>
    </>
  );
};

const ViewToggle = ({ value, onChange }) => {
  const items = [
    { id: 'list', icon: Icon.Hash, label: 'Lista' },
    { id: 'cards', icon: Icon.LayoutDashboard, label: 'Tarjetas' },
    { id: 'map', icon: Icon.MapPin, label: 'Mapa' },
  ];
  return (
    <div className="inline-flex bg-neutral-100 rounded-lg p-0.5">
      {items.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)}
          className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors ${value === i.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>
          <i.icon size={14}/> <span className="hidden sm:inline">{i.label}</span>
        </button>
      ))}
    </div>
  );
};

// ============ Wizard ============
const NewProjectWizard = ({ open, onClose, onCreated }) => {
  const { auth } = Layout.useApp();
  const clients = Store.useClients();
  const personnel = Store.usePersonnel();
  const hsePersonnel = personnel.filter((p) => p.role === 'FIELD' || (p.position || '').toLowerCase().includes('hse'));

  const nextCode = () => 'PRJ-2026-0' + (30 + Store.projects.length + 1);
  const freshForm = () => ({
    code: nextCode(), name: '', service: 'Perforación diamantina', region: 'Cesar',
    start: '2026-06-01', end: '2026-12-30', desc: '',
    clientId: clients[0]?.id || '',
    contract: '', contractValue: '1850000000', billing: 'hitos', payTerms: '30 días', notes: '',
    ownerId: auth.user?.id || '',
    hseId: (hsePersonnel[0] || personnel[0])?.id || '',
  });

  const [step, setStep] = React.useState(1);
  const [fd, setFd] = React.useState(freshForm);
  const set = (k) => (e) => setFd((f) => ({ ...f, [k]: e.target.value }));
  React.useEffect(() => { if (open) { setStep(1); setFd(freshForm()); } }, [open, clients.length, personnel.length]);

  const steps = [
    { id: 1, label: 'Datos generales' },
    { id: 2, label: 'Cliente y contrato' },
    { id: 3, label: 'Equipo y recursos' },
    { id: 4, label: 'Confirmación' },
  ];

  const onCreate = () => {
    const client = clients.find((c) => c.id === fd.clientId) || MX.clients.find((c) => c.id === fd.clientId);
    const owner = personnel.find((u) => u.id === fd.ownerId) || MX.people.find((u) => u.id === fd.ownerId);
    Store.addProject({
      id: 'p' + Date.now(),
      code: fd.code,
      name: fd.name || fd.code,
      service: fd.service,
      region: fd.region,
      clientId: fd.clientId,
      contractValue: Number(fd.contractValue.replace(/\./g, '').replace(',', '.')) || 1850000000,
      billed: 0,
      ownerId: fd.ownerId,
      status: 'active',
      progress: 0,
      start: fd.start,
      end: fd.end,
      lat: 6.5 + Math.random() * 4,
      lng: -75 - Math.random() * 4,
      photo: client?.color || '#2563EB',
    });
    onCreated(fd.code);
  };

  return (
    <UI.Drawer open={open} onClose={onClose}
      title="Nuevo proyecto"
      subtitle="Asistente en 4 pasos · Estado: Borrador"
      width="max-w-2xl"
      footer={
        <div className="flex items-center justify-between">
          <UI.Button kind="ghost" onClick={onClose}>Cancelar</UI.Button>
          <div className="flex items-center gap-2">
            {step > 1 ? <UI.Button kind="secondary" icon={Icon.ChevronLeft} onClick={() => setStep(step - 1)}>Atrás</UI.Button> : null}
            {step < 4 ? (
              <UI.Button kind="primary" iconRight={Icon.ChevronRight} onClick={() => setStep(step + 1)}>Continuar</UI.Button>
            ) : (
              <UI.Button kind="success" icon={Icon.Check} onClick={onCreate}>Crear proyecto</UI.Button>
            )}
          </div>
        </div>
      }>
      {/* Stepper */}
      <ol className="flex items-center justify-between mb-6">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-center gap-2 flex-1">
            <span className={`h-8 w-8 rounded-full inline-flex items-center justify-center text-xs font-bold ${step >= s.id ? 'bg-primary-500 text-white' : 'bg-neutral-100 text-neutral-500'}`}>{step > s.id ? <Icon.Check size={14}/> : s.id}</span>
            <span className={`text-xs font-medium ${step === s.id ? 'text-neutral-900' : 'text-neutral-500'}`}>{s.label}</span>
            {i < steps.length - 1 ? <span className={`flex-1 h-px ${step > s.id ? 'bg-primary-500' : 'bg-neutral-200'}`}/> : null}
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UI.Field label="Código del proyecto" required><UI.Input value={fd.code} onChange={set('code')}/></UI.Field>
          <UI.Field label="Nombre" required><UI.Input value={fd.name} onChange={set('name')} placeholder="Exploración Cesar Norte 2026"/></UI.Field>
          <UI.Field label="Tipo de servicio" required>
            <UI.Select value={fd.service} onChange={set('service')}>
              {serviceTypes.filter((s) => s !== 'all').map((s) => <option key={s}>{s}</option>)}
            </UI.Select>
          </UI.Field>
          <UI.Field label="Región" required>
            <UI.Select value={fd.region} onChange={set('region')}>
              <option>Cesar</option><option>La Guajira</option><option>Antioquia</option><option>Boyacá</option><option>Caldas</option>
            </UI.Select>
          </UI.Field>
          <UI.Field label="Fecha de inicio" required><UI.Input type="date" value={fd.start} onChange={set('start')}/></UI.Field>
          <UI.Field label="Fecha de fin estimada" required><UI.Input type="date" value={fd.end} onChange={set('end')}/></UI.Field>
          <UI.Field label="Descripción" className="sm:col-span-2"><UI.Textarea value={fd.desc} onChange={set('desc')} placeholder="Objetivo del proyecto, alcance técnico y entregables principales…" rows={3}/></UI.Field>
        </div>
      ) : step === 2 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UI.Field label="Cliente (empresa minera)" required className="sm:col-span-2">
            <UI.Select value={fd.clientId} onChange={set('clientId')}>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name} — NIT {c.nit || '—'}</option>)}
            </UI.Select>
          </UI.Field>
          <UI.Field label="Número de contrato"><UI.Input value={fd.contract} onChange={set('contract')} placeholder="CT-DR-2026-118"/></UI.Field>
          <UI.Field label="Valor del contrato (COP)" required><UI.Input value={fd.contractValue} onChange={set('contractValue')} className="font-mono"/></UI.Field>
          <UI.Field label="Modalidad de facturación" required>
            <UI.Select value={fd.billing} onChange={set('billing')}><option value="hitos">Por hitos</option><option>Mensual</option><option>Anticipo + saldo</option></UI.Select>
          </UI.Field>
          <UI.Field label="Términos de pago"><UI.Input value={fd.payTerms} onChange={set('payTerms')}/></UI.Field>
          <UI.Field label="Notas comerciales" className="sm:col-span-2"><UI.Textarea value={fd.notes} onChange={set('notes')} rows={3} placeholder="Origen de la oportunidad, notas relevantes…"/></UI.Field>
        </div>
      ) : step === 3 ? (
        <div className="space-y-5">
          <div>
            <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">Responsable y equipo asignado</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UI.Field label="Responsable principal" required>
                <UI.Select value={fd.ownerId} onChange={set('ownerId')}>
                  {(personnel.length ? personnel : MX.people).map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role || p.position || ''}</option>)}
                </UI.Select>
              </UI.Field>
              <UI.Field label="Supervisor HSE">
                <UI.Select value={fd.hseId} onChange={set('hseId')}>
                  <option value="">Sin asignar</option>
                  {(hsePersonnel.length ? hsePersonnel : MX.people.filter((p) => p.role.includes('HSE'))).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </UI.Select>
              </UI.Field>
            </div>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(personnel.length ? personnel : MX.people).slice(0, 6).map((p) => (
                <label key={p.id} className="flex items-center gap-2 border border-neutral-200 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-neutral-50">
                  <UI.Checkbox checked={p.id === fd.ownerId || p.id === fd.hseId}/>
                  <UI.Avatar name={p.name} color={p.color} size={24}/>
                  <span className="text-xs text-neutral-700 truncate">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wide mb-2">Equipos y recursos</div>
            {MX.equipment.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MX.equipment.slice(0, 4).map((e) => (
                  <label key={e.id} className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-neutral-50">
                    <UI.Checkbox checked={['rig1','v1'].includes(e.id)}/>
                    <Icon.Truck size={16} className="text-neutral-500"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-900">{e.code} · {e.brand}</div>
                      <div className="text-[10px] text-neutral-500">{e.type} · {e.model}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 py-3">Los equipos se pueden asignar al proyecto desde la sección Flota.</div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="rounded-lg border border-success-500/20 bg-success-50 p-4 flex items-start gap-3">
            <span className="h-9 w-9 rounded-lg bg-success-500 text-white flex items-center justify-center"><Icon.Check size={16}/></span>
            <div>
              <div className="font-display font-semibold text-success-700">Todo listo para crear el proyecto</div>
              <div className="text-sm text-success-700/80 mt-0.5">Se generará automáticamente la estructura: operaciones, HSE, personal, equipos, documentos y facturación.</div>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Código', fd.code],
              ['Nombre', fd.name || '(sin nombre)'],
              ['Servicio', fd.service],
              ['Cliente', (clients.find((c) => c.id === fd.clientId) || MX.clients.find((c) => c.id === fd.clientId))?.name || fd.clientId || '—'],
              ['Valor contrato', '$' + fd.contractValue + ' COP'],
              ['Inicio / Fin', fd.start + ' → ' + fd.end],
              ['Responsable', (personnel.find((u) => u.id === fd.ownerId) || MX.people.find((u) => u.id === fd.ownerId))?.name || fd.ownerId || '—'],
              ['Región', fd.region],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-neutral-100 pb-2">
                <dt className="text-neutral-500">{k}</dt>
                <dd className="text-neutral-900 font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </UI.Drawer>
  );
};

// ============ Project detail ============
const PageProjectDetail = ({ id }) => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const allProjects = Store.useProjects();
  const allClients  = Store.useClients();
  const allWells    = Store.useWells();
  const allIncidents = Store.useIncidents();
  const allPersonnel = Store.usePersonnel();
  const p = allProjects.find((x) => x.id === id);
  if (!p) return <UI.EmptyState title="Proyecto no encontrado" desc="Vuelve al listado de proyectos para seleccionar otro." action={<UI.Button onClick={() => go('/proyectos')}>Volver</UI.Button>}/>;
  const client = allClients.find((c) => c.id === p.clientId) || { name: p.clientId, color: '#94A3B8', logo: '?', nit: '—' };
  const owner = allPersonnel.find((u) => u.id === p.ownerId) || { name: 'Sin asignar', color: '#94A3B8' };
  const [tab, setTab] = React.useState('summary');

  const wellsP = allWells.filter((w) => w.projectId === p.id);
  const visitsP = (MX.visits || []).filter((v) => v.projectId === p.id);
  const incP = allIncidents.filter((i) => i.projectId === p.id);
  const eqP = (MX.equipment || []).filter((e) => e.projectId === p.id);
  const peopleP = allPersonnel.filter((u) => u.projectId === p.id);
  const surveysP = (MX.surveys || []).filter((s) => s.projectId === p.id);

  const tabs = [
    { id: 'summary', label: 'Resumen', icon: Icon.LayoutDashboard },
    { id: 'ops', label: 'Operaciones', icon: Icon.HardHat, count: wellsP.length + surveysP.length },
    { id: 'visits', label: 'Visitas y evidencias', icon: Icon.Camera, count: visitsP.length },
    { id: 'hse', label: 'HSE', icon: Icon.ShieldAlert, count: incP.length },
    { id: 'team', label: 'Personal', icon: Icon.Users, count: peopleP.length },
    { id: 'equipment', label: 'Equipos', icon: Icon.Truck, count: eqP.length },
    { id: 'docs', label: 'Documentos', icon: Icon.FileText, count: 12 },
    { id: 'billing', label: 'Facturación', icon: Icon.FileSignature },
    { id: 'timeline', label: 'Timeline', icon: Icon.History },
  ];

  return (
    <>
      <UI.SectionHeader
        title={p.name}
        subtitle={<span className="inline-flex items-center gap-3 text-sm">
          <span className="font-mono text-primary-700 font-semibold">{p.code}</span>
          <span className="text-neutral-400">·</span>
          <span>{p.service}</span>
          <span className="text-neutral-400">·</span>
          {UI.statusBadge(p.status, t)}
        </span>}
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('projects_title'), onClick: () => go('/proyectos') },
          { label: p.code },
        ]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>Exportar reporte</UI.Button>
            <UI.Button kind="secondary" size="sm" icon={Icon.Edit}>Editar</UI.Button>
            <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nuevo registro</UI.Button>
          </>
        }/>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Avance del proyecto</div>
          <div className="font-display font-bold text-2xl text-neutral-900 mt-1">{p.progress}%</div>
          <UI.Progress value={p.progress} className="mt-2"/>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Pozos activos / total</div>
          <div className="font-display font-bold text-2xl text-neutral-900 mt-1 font-mono">{wellsP.filter((w) => w.status === 'active').length} / {wellsP.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">{wellsP.reduce((a, w) => a + w.depthCur, 0).toFixed(1)} m perforados</div>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Facturado / contrato</div>
          <div className="font-display font-bold text-2xl text-neutral-900 mt-1 font-mono">${(p.billed / 1e9).toFixed(2)}B</div>
          <UI.Progress value={(p.billed / p.contractValue) * 100} className="mt-2" color="bg-success-500"/>
        </UI.Card>
        <UI.Card padding>
          <div className="text-xs text-neutral-600">Incidentes HSE</div>
          <div className="font-display font-bold text-2xl text-neutral-900 mt-1 font-mono">{incP.length}</div>
          <div className="text-[11px] text-neutral-500 mt-1">en los últimos 90 días</div>
        </UI.Card>
      </div>

      <UI.Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5"/>

      {tab === 'summary' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <UI.Card className="lg:col-span-2">
            <UI.CardHeader title="Datos generales" icon={Icon.FileText}/>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Cliente', <span className="inline-flex items-center gap-2"><span className="h-5 w-5 rounded text-white text-[10px] font-bold inline-flex items-center justify-center" style={{ backgroundColor: client.color }}>{client.logo}</span>{client.name}</span>],
                ['NIT cliente', <span className="font-mono">{client.nit}</span>],
                ['Servicio', p.service],
                ['Región', p.region],
                ['Inicio', <span className="font-mono">{MX.formatDate(p.start, lang)}</span>],
                ['Fin estimado', <span className="font-mono">{MX.formatDate(p.end, lang)}</span>],
                ['Valor contrato', <span className="font-mono">${MX.formatNum(p.contractValue)} COP</span>],
                ['Modalidad', 'Por hitos · 30 días'],
                ['Responsable', <span className="inline-flex items-center gap-2"><UI.Avatar name={owner.name} color={owner.color} size={22}/>{owner.name}</span>],
                ['Estado', UI.statusBadge(p.status, t)],
              ].map(([k, v], i) => (
                <div key={i} className="flex justify-between gap-3 border-b border-neutral-100 pb-2 last:border-0">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-neutral-900 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </UI.Card>
          <UI.Card>
            <UI.CardHeader title="Ubicación" icon={Icon.MapPin} subtitle={`${p.lat.toFixed(2)}°N, ${Math.abs(p.lng).toFixed(2)}°W`}/>
            <div className="mt-3">
              <UI.ColombiaMap pins={[p]} height={260}/>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <UI.Button kind="secondary" size="sm" icon={Icon.MapPin} className="!w-full">Ver en mapa</UI.Button>
              <UI.Button kind="secondary" size="sm" icon={Icon.ExternalLink} className="!w-full">Google Maps</UI.Button>
            </div>
          </UI.Card>
        </div>
      ) : tab === 'ops' ? (
        <UI.Card padding={false}>
          <UI.Table
            columns={[
              { label: 'Tipo', render: (r) => r.kind === 'well' ? <UI.Badge kind="primary" dot>Pozo</UI.Badge> : <UI.Badge kind="info" dot>Levantamiento</UI.Badge> },
              { label: 'Código', mono: true, render: (r) => <span className="font-mono text-primary-700 font-semibold">{r.code}</span> },
              { label: 'Detalle', render: (r) => r.detail },
              { label: 'Avance', render: (r) => <span className="font-mono text-sm">{r.progress}</span> },
              { label: 'Estado', render: (r) => UI.statusBadge(r.status, t) },
            ]}
            rows={[
              ...wellsP.map((w) => ({ id: w.id, kind: 'well', code: w.code, detail: `${w.type} · ${w.bit}`, progress: `${w.depthCur.toFixed(1)} / ${w.depthTarget} m`, status: w.status })),
              ...surveysP.map((s) => ({ id: s.id, kind: 'survey', code: s.code, detail: `${s.type} · ${s.area}`, progress: '—', status: s.status })),
            ]}
            onRowClick={(r) => r.kind === 'well' ? go('/perforaciones/' + r.id) : null}/>
        </UI.Card>
      ) : tab === 'visits' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visitsP.length === 0 ? (
            <div className="lg:col-span-3"><UI.EmptyState icon={Icon.Camera} title="Aún no hay visitas registradas" desc="Las visitas de campo aparecerán aquí con sus fotos, GPS y observaciones."/></div>
          ) : visitsP.map((v) => {
            const u = MX.people.find((p) => p.id === v.userId);
            return (
              <UI.Card key={v.id} padding={false}>
                <UI.PlaceholderImg label="Foto de campo" color={v.color} height={160} className="rounded-b-none"/>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <UI.Badge kind="info" dot size="sm">{v.type}</UI.Badge>
                    <span className="text-[11px] text-neutral-500 font-mono">{MX.formatDate(v.date, lang)}</span>
                  </div>
                  <div className="mt-2 text-sm text-neutral-800 line-clamp-2">{v.desc}</div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5"><UI.Avatar name={u.name} color={u.color} size={20}/>{u.name}</span>
                    <span className="inline-flex items-center gap-1 text-neutral-500"><Icon.Image size={11}/>{v.photos}</span>
                  </div>
                </div>
              </UI.Card>
            );
          })}
        </div>
      ) : tab === 'hse' ? (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Fecha', mono: true, render: (r) => MX.formatDate(r.date, lang) },
            { label: 'Tipo', render: (r) => <UI.Badge kind={r.type === 'leve' ? 'warn' : r.type === 'grave' ? 'danger' : 'info'} dot>{r.type}</UI.Badge> },
            { label: 'Descripción', render: (r) => <div className="text-sm text-neutral-700 line-clamp-2">{r.desc}</div> },
            { label: 'Estado', render: (r) => UI.statusBadge(r.status, t) },
            { label: 'Acciones', render: (r) => <span className="text-xs text-neutral-700">{r.actions}</span> },
          ]} rows={incP} empty="Sin incidentes registrados en este proyecto"/>
        </UI.Card>
      ) : tab === 'team' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {peopleP.map((u) => (
            <UI.Card key={u.id} className="flex items-center gap-4">
              <UI.Avatar name={u.name} color={u.color} size={48}/>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-neutral-900 truncate">{u.name}</div>
                <div className="text-xs text-neutral-600">{u.role}</div>
                <div className="mt-2 flex gap-1">
                  {Object.entries(u.certs).filter(([k]) => k !== 'na').slice(0, 3).map(([k, v]) => (
                    <UI.Badge key={k} size="sm" kind={v === 'ok' ? 'success' : v === 'warn' ? 'warn' : 'danger'} dot>{k}</UI.Badge>
                  ))}
                </div>
              </div>
            </UI.Card>
          ))}
        </div>
      ) : tab === 'equipment' ? (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Código', mono: true, render: (r) => <span className="font-mono text-primary-700 font-semibold">{r.code}</span> },
            { label: 'Tipo', render: (r) => r.type },
            { label: 'Marca · Modelo', render: (r) => <span className="text-sm text-neutral-700">{r.brand} {r.model}</span> },
            { label: 'Horómetro', render: (r) => <span className="font-mono text-sm">{MX.formatNum(r.hours)} h</span> },
            { label: 'Próx. mantenimiento', render: (r) => <span className="font-mono text-xs">{MX.formatDate(r.nextMaint, lang)}</span> },
            { label: 'Estado', render: (r) => UI.statusBadge(r.status, t) },
          ]} rows={eqP}/>
        </UI.Card>
      ) : tab === 'docs' ? (
        <ProjectDocs/>
      ) : tab === 'billing' ? (
        <ProjectBilling p={p}/>
      ) : (
        <ProjectTimeline p={p}/>
      )}
    </>
  );
};

const ProjectDocs = () => {
  const docs = [
    { name: 'Contrato MSA Drummond.pdf', kind: 'Contrato', size: '2.1 MB', date: '2026-02-01', signed: true },
    { name: 'Propuesta técnica v3.pdf', kind: 'Propuesta', size: '4.8 MB', date: '2026-01-12', signed: true },
    { name: 'Plano topográfico — Plataforma A.dwg', kind: 'Plano', size: '12.3 MB', date: '2026-02-18', signed: false },
    { name: 'Informe mensual marzo.pdf', kind: 'Informe', size: '3.2 MB', date: '2026-04-02', signed: true },
    { name: 'Permiso ambiental ANLA.pdf', kind: 'Permiso', size: '1.4 MB', date: '2026-01-30', signed: true },
    { name: 'Cronograma maestro.xlsx', kind: 'Cronograma', size: '420 KB', date: '2026-02-05', signed: false },
  ];
  return (
    <UI.Card padding={false}>
      <UI.Table columns={[
        { label: 'Nombre', render: (d) => <div className="inline-flex items-center gap-2"><span className="h-8 w-8 rounded-md bg-primary-50 text-primary-700 inline-flex items-center justify-center"><Icon.FileText size={14}/></span><span className="text-sm font-medium text-neutral-900">{d.name}</span></div> },
        { label: 'Tipo', render: (d) => <UI.Badge kind="neutral" size="sm">{d.kind}</UI.Badge> },
        { label: 'Tamaño', render: (d) => <span className="text-xs text-neutral-600 font-mono">{d.size}</span> },
        { label: 'Fecha', render: (d) => <span className="text-xs text-neutral-600 font-mono">{d.date}</span> },
        { label: 'Firma', render: (d) => d.signed ? <UI.Badge kind="success" dot size="sm">Firmado</UI.Badge> : <UI.Badge kind="warn" dot size="sm">Pendiente</UI.Badge> },
        { label: '', right: true, render: () => <UI.IconButton icon={Icon.Download} label="Descargar"/> },
      ]} rows={docs.map((d, i) => ({ ...d, id: i }))}/>
    </UI.Card>
  );
};

const ProjectBilling = ({ p }) => {
  const hitos = [
    { id: 'h1', label: 'Anticipo 30%',     value: p.contractValue * 0.3, status: 'paid',    date: '2026-02-10' },
    { id: 'h2', label: 'Hito 1 — Movilización', value: p.contractValue * 0.15, status: 'paid',    date: '2026-02-28' },
    { id: 'h3', label: 'Hito 2 — Avance 30%',   value: p.contractValue * 0.20, status: 'paid',    date: '2026-04-15' },
    { id: 'h4', label: 'Hito 3 — Avance 60%',   value: p.contractValue * 0.20, status: 'invoiced',date: '2026-05-10' },
    { id: 'h5', label: 'Hito 4 — Cierre',       value: p.contractValue * 0.15, status: 'pending', date: '2026-08-15' },
  ];
  const statusMap = { paid: { k: 'success', l: 'Pagado' }, invoiced: { k: 'info', l: 'Facturado' }, pending: { k: 'warn', l: 'Pendiente' } };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <UI.Card className="lg:col-span-2" padding={false}>
        <UI.Table columns={[
          { label: 'Hito', render: (h) => h.label },
          { label: 'Valor', right: true, render: (h) => <span className="font-mono">${MX.formatNum(h.value)}</span> },
          { label: 'Fecha', render: (h) => <span className="font-mono text-xs">{h.date}</span> },
          { label: 'Estado', render: (h) => <UI.Badge kind={statusMap[h.status].k} dot>{statusMap[h.status].l}</UI.Badge> },
        ]} rows={hitos}/>
      </UI.Card>
      <UI.Card>
        <UI.CardHeader title="Resumen financiero" icon={Icon.TrendingUp}/>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-neutral-500">Valor contrato</dt><dd className="font-mono font-semibold">${MX.formatNum(p.contractValue)}</dd></div>
          <div className="flex justify-between"><dt className="text-neutral-500">Facturado</dt><dd className="font-mono font-semibold text-success-700">${MX.formatNum(p.billed)}</dd></div>
          <div className="flex justify-between"><dt className="text-neutral-500">Por facturar</dt><dd className="font-mono font-semibold text-warning-700">${MX.formatNum(p.contractValue - p.billed)}</dd></div>
        </dl>
        <UI.Progress value={(p.billed / p.contractValue) * 100} className="mt-4" color="bg-success-500"/>
      </UI.Card>
    </div>
  );
};

const ProjectTimeline = ({ p }) => {
  const events = [
    { date: '2026-05-14', icon: Icon.Drill, color: 'bg-primary-500', title: 'Avance pozo DDH-2026-074', desc: '22,2 m perforados turno día — recuperación 96%' },
    { date: '2026-05-13', icon: Icon.Camera, color: 'bg-sky-500', title: 'Visita de supervisión', desc: 'Ana Vélez — 3 fotos + GPS' },
    { date: '2026-05-12', icon: Icon.ShieldAlert, color: 'bg-warning-500', title: 'Incidente leve reportado', desc: 'Resbalón menor en plataforma' },
    { date: '2026-05-10', icon: Icon.FileSignature, color: 'bg-success-500', title: 'Hito 3 facturado', desc: '$' + MX.formatNum(p.contractValue * 0.20) + ' COP' },
    { date: '2026-04-15', icon: Icon.Check, color: 'bg-success-500', title: 'Hito 2 aprobado por cliente', desc: 'Avance 30% — informe técnico firmado' },
    { date: '2026-02-01', icon: Icon.Flag, color: 'bg-neutral-700', title: 'Inicio del proyecto', desc: 'Movilización inicial y campamento listo' },
  ];
  return (
    <UI.Card>
      <ol className="relative border-l-2 border-neutral-200 ml-3 pl-6 space-y-6">
        {events.map((e, i) => {
          const IconCmp = e.icon;
          return (
            <li key={i} className="relative">
              <span className={`absolute -left-[37px] top-0 h-7 w-7 rounded-full ${e.color} text-white flex items-center justify-center ring-4 ring-white`}><IconCmp size={13}/></span>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-neutral-500">{e.date}</span>
                <span className="font-semibold text-neutral-900">{e.title}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-0.5">{e.desc}</p>
            </li>
          );
        })}
      </ol>
    </UI.Card>
  );
};

window.PageProjects = PageProjects;
window.PageProjectDetail = PageProjectDetail;
