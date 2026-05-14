// HSE — Incidentes, Permisos, EPP
const PageHSE = ({ sub }) => {
  const { t, lang } = useT();
  const { go, path } = Layout.useRouter();
  const active = sub || 'incidents';

  const tabs = [
    { id: 'incidents', label: t('nav_incidents'), icon: Icon.ShieldAlert, route: '/hse/incidentes', count: MX.incidents.length },
    { id: 'permits',   label: t('nav_permits'),   icon: Icon.FileSignature, route: '/hse/permisos', count: MX.permits.length },
    { id: 'epp',       label: t('nav_epp'),       icon: Icon.Award, route: '/hse/epp', count: MX.people.length },
  ];

  return (
    <>
      <UI.SectionHeader
        title="HSE / Seguridad"
        subtitle="Cero accidentes, máxima trazabilidad"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_hse') }, { label: tabs.find((x) => x.id === active).label }]}
        actions={
          active === 'incidents' ? <UI.Button kind="primary" icon={Icon.Plus} onClick={() => window._openIncident && window._openIncident()}>Reportar incidente</UI.Button>
          : active === 'permits' ? <UI.Button kind="primary" icon={Icon.Plus}>Solicitar permiso</UI.Button>
          : <UI.Button kind="primary" icon={Icon.Plus}>Registrar certificación</UI.Button>
        }/>

      {/* Big HSE banner */}
      <div className="relative mb-6 rounded-card overflow-hidden bg-gradient-to-r from-primary-900 to-primary-700 text-white p-6 sm:p-8 flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur"><Icon.HardHat size={36} className="text-warning-500"/></div>
          <div>
            <div className="text-xs uppercase tracking-widest text-primary-300">Indicador clave HSE</div>
            <div className="font-display font-bold text-3xl sm:text-5xl leading-none mt-1">312 <span className="text-lg sm:text-2xl font-normal text-primary-300">días</span></div>
            <div className="text-sm text-primary-300 mt-1">sin accidentes incapacitantes en toda la operación</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-center"><div className="text-primary-300 text-xs">TRIR</div><div className="font-display font-bold text-2xl font-mono">0,42</div></div>
          <div className="text-center"><div className="text-primary-300 text-xs">Inspecciones</div><div className="font-display font-bold text-2xl font-mono">98%</div></div>
          <div className="text-center"><div className="text-primary-300 text-xs">Cuasi-accidentes</div><div className="font-display font-bold text-2xl font-mono">14</div></div>
        </div>
      </div>

      <UI.Tabs tabs={tabs.map((tb) => ({ ...tb }))} value={active} onChange={(id) => go(tabs.find((x) => x.id === id).route)} className="mb-5"/>

      {active === 'incidents' ? <IncidentsTab/> : active === 'permits' ? <PermitsTab/> : <EPPTab/>}
    </>
  );
};

const IncidentsTab = () => {
  const { t, lang } = useT();
  const [open, setOpen] = React.useState(false);
  const [eventType, setEventType] = React.useState('cuasi');
  const allProjects = Store.useProjects();
  const incidents = Store.useIncidents();
  const toast = UI.useToast();
  const emptyForm = { projectId: 'p1', datetime: '', location: '11.4523° N · -72.9510° W', desc: '', actions: '', investigatorId: 'u2' };
  const [form, setForm] = React.useState(emptyForm);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  React.useEffect(() => { window._openIncident = () => setOpen(true); return () => { delete window._openIncident; }; }, []);
  React.useEffect(() => { if (open) { setEventType('cuasi'); setForm({ ...emptyForm, projectId: allProjects[0]?.id || 'p1' }); } }, [open]);

  const onSubmit = () => {
    Store.addIncident({ id: 'inc' + Date.now(), type: eventType, projectId: form.projectId, date: form.datetime ? new Date(form.datetime).toISOString() : new Date().toISOString(), location: form.location, desc: form.desc || 'Incidente en campo', actions: form.actions || 'Pendiente investigación', investigatorId: form.investigatorId, status: 'open' });
    toast.push({ kind: 'warn', title: 'Incidente reportado', desc: 'Notificación enviada a Ana Vélez (HSE) y al supervisor del proyecto.' });
    setOpen(false);
  };

  const typeStyles = { cuasi: 'border-sky-500 bg-sky-50 text-sky-700', leve: 'border-warning-500 bg-warning-50 text-warning-700', grave: 'border-danger-500 bg-danger-50 text-danger-700', fatal: 'border-danger-700 bg-danger-100 text-danger-900' };
  const inactiveStyle = 'border-neutral-200 hover:bg-neutral-50 text-neutral-700';

  return (
    <>
      <UI.Card padding={false}>
        <UI.Table columns={[
          { label: 'Fecha', mono: true, render: (i) => <span className="font-mono text-xs">{MX.formatDate(i.date, lang)}</span> },
          { label: 'Tipo', render: (i) => <UI.Badge kind={{ leve: 'warn', grave: 'danger', cuasi: 'info', fatal: 'danger' }[i.type] || 'neutral'} dot>{({ leve: 'Leve', grave: 'Grave', cuasi: 'Cuasi-accidente', fatal: 'Fatal' })[i.type]}</UI.Badge> },
          { label: 'Proyecto', render: (i) => (allProjects.find((p) => p.id === i.projectId) || MX.projects.find((p) => p.id === i.projectId))?.name || i.projectId },
          { label: 'Descripción', render: (i) => <span className="text-sm text-neutral-700 line-clamp-2">{i.desc}</span> },
          { label: 'Estado', render: (i) => UI.statusBadge(i.status, t) },
          { label: 'Acciones correctivas', render: (i) => <span className="text-xs text-neutral-700 line-clamp-2">{i.actions}</span> },
        ]} rows={incidents}/>
      </UI.Card>

      <UI.Drawer open={open} onClose={() => setOpen(false)} title="Reportar incidente HSE" subtitle="Se notificará automáticamente a supervisor y HSE" width="max-w-2xl"
        footer={<div className="flex justify-end gap-2"><UI.Button kind="ghost" onClick={() => setOpen(false)}>Cancelar</UI.Button><UI.Button kind="danger" icon={Icon.ShieldAlert} onClick={onSubmit}>Reportar y notificar</UI.Button></div>}>
        <div className="space-y-5">
          <UI.Field label="Tipo de evento" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { v: 'cuasi', l: 'Cuasi-accidente' },
                { v: 'leve',  l: 'Leve' },
                { v: 'grave', l: 'Grave' },
                { v: 'fatal', l: 'Fatal' },
              ].map((x) => (
                <button key={x.v} type="button" onClick={() => setEventType(x.v)}
                  className={`h-12 rounded-lg border text-sm font-medium transition-colors ${eventType === x.v ? typeStyles[x.v] : inactiveStyle}`}>{x.l}</button>
              ))}
            </div>
          </UI.Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Proyecto" required>
              <UI.Select value={form.projectId} onChange={set('projectId')}>
                {allProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </UI.Select>
            </UI.Field>
            <UI.Field label="Fecha y hora" required><UI.Input type="datetime-local" value={form.datetime} onChange={set('datetime')}/></UI.Field>
            <UI.Field label="Lugar (GPS)" className="sm:col-span-2">
              <div className="flex gap-2">
                <UI.Input value={form.location} onChange={set('location')} className="font-mono"/>
                <UI.Button kind="secondary" icon={Icon.MapPin}>GPS</UI.Button>
              </div>
            </UI.Field>
          </div>
          <UI.Field label="Descripción del evento" required><UI.Textarea value={form.desc} onChange={set('desc')} rows={4} placeholder="¿Qué pasó? Lugar exacto, cómo ocurrió, condiciones del entorno…"/></UI.Field>
          <UI.Field label="Acciones inmediatas tomadas" required><UI.Textarea value={form.actions} onChange={set('actions')} rows={2} placeholder="Aislamiento del área, atención médica, comunicación…"/></UI.Field>
          <UI.Field label="Responsable de investigación" required>
            <UI.Select value={form.investigatorId} onChange={set('investigatorId')}>
              {MX.people.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}
            </UI.Select>
          </UI.Field>
          <UI.Field label="Evidencias fotográficas"><Dropzone label="Sube fotos del lugar del incidente"/></UI.Field>
        </div>
      </UI.Drawer>
    </>
  );
};

const PermitsTab = () => {
  const { t, lang } = useT();
  return (
    <UI.Card padding={false}>
      <UI.Table columns={[
        { label: 'Permiso', render: (p) => <span className="inline-flex items-center gap-2"><Icon.FileSignature size={14} className="text-primary-700"/><span className="font-medium">{p.type}</span></span> },
        { label: 'Proyecto', render: (p) => MX.projects.find((x) => x.id === p.projectId)?.name },
        { label: 'Solicitante', render: (p) => { const u = MX.people.find((x) => x.id === p.requestedBy); return <span className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={22}/><span className="text-sm">{u.name}</span></span>; } },
        { label: 'Vigencia', render: (p) => <span className="font-mono text-xs"><div>{p.validFrom.slice(0, 16).replace('T', ' ')}</div><div className="text-neutral-500">→ {p.validTo.slice(0, 16).replace('T', ' ')}</div></span> },
        { label: 'Firmantes', render: (p) => p.signers.length ? <div className="flex -space-x-1.5">{p.signers.map((s) => { const u = MX.people.find((x) => x.name === s); return u ? <UI.Avatar key={u.id} name={u.name} color={u.color} size={22} className="ring-2 ring-white"/> : null; })}</div> : <span className="text-xs text-neutral-500">Sin firmas</span> },
        { label: 'Estado', render: (p) => UI.statusBadge(p.status, t) },
        { label: '', right: true, render: (p) => p.status === 'pending' ? <UI.Button size="sm" kind="primary" icon={Icon.PenTool}>Firmar</UI.Button> : <UI.Button size="sm" kind="ghost" icon={Icon.Eye}>Ver</UI.Button> },
      ]} rows={MX.permits}/>
    </UI.Card>
  );
};

const EPPTab = () => {
  const certKeys = [
    { id: 'alturas',  label: 'Trabajo en alturas' },
    { id: 'confined', label: 'Espacios confinados' },
    { id: 'firstAid', label: 'Primeros auxilios' },
  ];
  const dot = (v) => v === 'ok' ? <span className="inline-flex items-center gap-1 text-xs text-success-700"><span className="h-2 w-2 rounded-full bg-success-500"/> Vigente</span>
    : v === 'warn' ? <span className="inline-flex items-center gap-1 text-xs text-warning-700"><span className="h-2 w-2 rounded-full bg-warning-500"/> Por vencer</span>
    : v === 'expired' ? <span className="inline-flex items-center gap-1 text-xs text-danger-700"><span className="h-2 w-2 rounded-full bg-danger-500"/> Vencida</span>
    : <span className="text-xs text-neutral-400">N/A</span>;
  return (
    <UI.Card padding={false}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3">Persona</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Proyecto</th>
              {certKeys.map((c) => <th key={c.id} className="px-4 py-3">{c.label}</th>)}
              <th className="px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {MX.people.filter((p) => !p.role.includes('comercial')).map((p) => {
              const pr = p.project ? MX.projects.find((x) => x.id === p.project) : null;
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-2"><UI.Avatar name={p.name} color={p.color} size={28}/><span className="font-medium">{p.name}</span></span></td>
                  <td className="px-4 py-3 text-neutral-600">{p.role}</td>
                  <td className="px-4 py-3 text-neutral-600 text-xs">{pr ? pr.code : '—'}</td>
                  {certKeys.map((c) => <td key={c.id} className="px-4 py-3">{dot(p.certs[c.id])}</td>)}
                  <td className="px-4 py-3"><UI.Button kind="ghost" size="sm" icon={Icon.RefreshCw}>Renovar</UI.Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </UI.Card>
  );
};

window.PageHSE = PageHSE;
