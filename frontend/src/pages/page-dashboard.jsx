// Dashboard — command center
const PageDashboard = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const R = window.Recharts;
  const [period, setPeriod] = React.useState('30d');
  const [clientF, setClientF] = React.useState('all');

  const allProjects = Store.useProjects();
  const allOpps = Store.useOpportunities();
  const allClients = Store.useClients();

  // Filtered data
  const projects = React.useMemo(() => {
    if (clientF === 'all') return allProjects;
    return allProjects.filter((p) => p.clientId === clientF);
  }, [allProjects, clientF]);

  const opps = React.useMemo(() => {
    if (clientF === 'all') return allOpps;
    const clientProjects = allProjects.filter((p) => p.clientId === clientF).map((p) => p.id);
    return allOpps.filter((o) => o.clientId === clientF || clientProjects.includes(o.projectId));
  }, [allOpps, allProjects, clientF]);

  // Period filter for activity feed
  const periodDays = { '7d': 7, '30d': 30, '90d': 90, 'ytd': 365 };
  const maxDays = periodDays[period] || 30;

  const activeProjects = projects.filter((p) => p.status === 'active' || p.status === 'paused');
  const riskProjects = projects.filter((p) => p.status === 'alert');

  const totalMeters = React.useMemo(() => {
    const activeWells = Store.wells.filter((w) =>
      projects.some((p) => p.id === w.projectId)
    );
    return activeWells.reduce((a, w) => a + (w.depthCur || 0), 0);
  }, [projects]);

  const grandTotal = opps.reduce((a, b) => a + b.amount, 0);
  const weighted = opps.reduce((a, b) => a + b.amount * (b.prob / 100), 0);

  const pipelineByStage = React.useMemo(() => {
    const stages = ['prospect', 'qualification', 'proposal', 'negotiation', 'close'];
    return stages.map((s) => ({
      key: s,
      label: t('stage_' + s),
      items: opps.filter((o) => o.stage === s),
      total: opps.filter((o) => o.stage === s).reduce((a, b) => a + b.amount, 0),
    }));
  }, [opps, t]);

  // Chart data derived from filtered projects/wells
  const metersByProjectData = React.useMemo(() => {
    return projects.slice(0, 6).map((p) => {
      const meters = Store.wells
        .filter((w) => w.projectId === p.id)
        .reduce((a, w) => a + (w.depthCur || 0), 0);
      return { name: p.code || p.name.slice(0, 8), meters: Math.round(meters) };
    });
  }, [projects]);

  const incidents = Store.useIncidents();
  const hseIncidents = React.useMemo(() => {
    return incidents.filter((i) => projects.some((p) => p.id === i.projectId));
  }, [incidents, projects]);

  return (
    <>
      <UI.SectionHeader
        title={t('dash_title')}
        subtitle={t('dash_subtitle')}
        actions={
          <>
            <UI.Select value={period} onChange={(e) => setPeriod(e.target.value)} className="!h-9 !w-40">
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="ytd">Año actual</option>
            </UI.Select>
            <UI.Select value={clientF} onChange={(e) => setClientF(e.target.value)} className="!h-9 !w-44">
              <option value="all">Todos los clientes</option>
              {allClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </UI.Select>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>{t('export_pdf')}</UI.Button>
            <UI.Button kind="secondary" size="sm" icon={Icon.FileText}>{t('export_excel')}</UI.Button>
          </>
        }
      />

      {/* Row 1 — KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <UI.KPI icon={Icon.Drill} label={t('kpi_meters')}
          value={<span className="font-mono">{MX.formatNum(Math.round(totalMeters) || 2487)}</span>} unit="m"
          tooltip="Suma de metros perforados en todos los pozos activos durante el período."
          delta={{ value: 12, label: t('vs_last_month') }}
          sparkline={<UI.Sparkline data={MX.sparkMeters} color="#2563EB"/>}
          accent="primary"/>
        <UI.KPI icon={Icon.FolderKanban} label={t('kpi_active_projects')}
          value={activeProjects.length.toString()} unit="proyectos"
          tooltip="Proyectos con estado activo o en pausa, excluyendo completados."
          extra={riskProjects.length > 0 ? <span className="inline-flex items-center gap-1 text-warning-700"><Icon.CircleAlert size={12}/>{riskProjects.length} {t('in_risk')}</span> : null}
          accent="info"/>
        <UI.KPI icon={Icon.TrendingUp} label={t('kpi_revenue')}
          value={<span className="font-mono">${(grandTotal / 1e9).toFixed(2)}B</span>} unit="COP"
          tooltip="Pipeline total ponderado por período seleccionado."
          extra={
            <div className="w-full mt-1">
              <UI.Progress value={Math.min(100, (grandTotal / 15e9) * 100)} size="sm"/>
              <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                <span>{Math.round((grandTotal / 15e9) * 100)}%</span>
                <span>{t('target')}: $15,0B</span>
              </div>
            </div>
          }
          accent="success"/>
        <UI.KPI icon={Icon.HardHat} label={t('kpi_hse_days')}
          value={hseIncidents.filter((i) => i.type === 'grave' || i.type === 'fatal').length === 0 ? '312' : '0'} unit="días"
          tooltip="Días consecutivos sin incidentes graves o fatales en toda la operación."
          delta={{ value: 0, label: 'racha histórica' }}
          accent="warn"/>
      </div>

      {/* Row 2 — Map + Pipeline */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-4 mb-6">
        <UI.Card className="xl:col-span-6">
          <UI.CardHeader title={t('map_title')} subtitle="Pines por estado: activo, en pausa, alerta" icon={Icon.MapPin}
            right={
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success-500"/>Activo</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning-500"/>Pausa</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger-500"/>Alerta</span>
              </div>
            }/>
          <div className="mt-3">
            <UI.ColombiaMap pins={projects.filter((p) => p.status !== 'completed')}
              onPinClick={(p) => go('/proyectos/' + p.id)}/>
          </div>
        </UI.Card>

        <UI.Card className="xl:col-span-4">
          <UI.CardHeader title={t('pipeline_title')} subtitle="Resumen condensado por etapa" icon={Icon.TrendingUp}
            right={<button onClick={() => go('/pipeline')} className="text-xs font-medium text-primary-700 hover:text-primary-500 inline-flex items-center gap-1">Ver completo <Icon.ArrowRight size={12}/></button>}/>
          <div className="mt-4 space-y-2.5">
            {pipelineByStage.map((s, i) => {
              const max = Math.max(...pipelineByStage.map((x) => x.total), 1);
              const pct = (s.total / max) * 100;
              const color = ['#94A3B8','#0EA5E9','#2563EB','#1E3A8A','#10B981'][i];
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-700">{s.label}</span>
                    <span className="font-mono text-neutral-900">{(s.total / 1_000_000_000).toFixed(2)}B</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }}/>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-0.5">{s.items.length} oportunidades</div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 pt-4 border-t border-neutral-200 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-neutral-500">{t('pipeline_total')}</div>
              <div className="font-display font-bold text-lg text-neutral-900 font-mono">${(grandTotal / 1e9).toFixed(1)}B</div>
            </div>
            <div>
              <div className="text-neutral-500">{t('pipeline_weighted')}</div>
              <div className="font-display font-bold text-lg text-neutral-900 font-mono">${(weighted / 1e9).toFixed(1)}B</div>
            </div>
          </div>
        </UI.Card>
      </div>

      {/* Row 3 — Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <UI.Card>
          <UI.CardHeader title={t('activity_title')} icon={Icon.Activity}
            right={<UI.Badge kind="success" dot size="sm">Live</UI.Badge>}/>
          <ul className="mt-4 space-y-3">
            {MX.activity.map((a) => {
              const u = MX.people.find((p) => p.id === a.userId);
              const kindIcon = { core: Icon.Layers, log: Icon.Drill, hse: Icon.ShieldAlert, topo: Icon.Compass, visit: Icon.MapPin }[a.kind] || Icon.Activity;
              const KIcon = kindIcon;
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <UI.Avatar name={u.name} color={u.color} size={32}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-neutral-700 leading-snug">
                      <span className="font-semibold text-neutral-900">{u.name}</span> {a.action}
                      <button className="text-primary-700 font-medium hover:text-primary-500 ml-1">{a.target}</button>
                      {a.meters ? <span className="font-mono text-neutral-600"> · {a.meters}</span> : null}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500"><KIcon size={11}/> {{ core: 'Núcleo', log: 'Log', hse: 'HSE', topo: 'Topografía', visit: 'Visita' }[a.kind]}</span>
                      <span className="text-[10px] text-neutral-400">·</span>
                      <span className="text-[10px] text-neutral-500">{MX.relTime(a.when, lang)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </UI.Card>

        <UI.Card>
          <UI.CardHeader title={t('milestones_title')} icon={Icon.Flag}/>
          <ul className="mt-4 space-y-2.5">
            {MX.milestones.map((m) => {
              const p = m.projectId ? projects.find((x) => x.id === m.projectId) || MX.projects.find((x) => x.id === m.projectId) : null;
              const sevDot = { high: 'bg-danger-500', med: 'bg-warning-500', low: 'bg-success-500' }[m.priority];
              return (
                <li key={m.id} className="flex items-start gap-3 py-1.5 px-2 rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${sevDot}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{m.label}</div>
                    {p ? <div className="text-[11px] text-neutral-500 truncate">{p.name}</div> : null}
                  </div>
                  <div className="text-xs text-neutral-700 font-mono shrink-0">{MX.formatDate(m.date, lang)}</div>
                </li>
              );
            })}
          </ul>
        </UI.Card>

        <UI.Card>
          <UI.CardHeader title={t('alerts_title')} icon={Icon.ShieldAlert} right={<UI.Badge kind="danger" size="sm">{MX.alerts.length}</UI.Badge>}/>
          <ul className="mt-4 space-y-2.5">
            {MX.alerts.map((a) => {
              const icon = { maintenance: Icon.Wrench, cert: Icon.Award, permit: Icon.FileSignature }[a.kind] || Icon.CircleAlert;
              const IconCmp = icon;
              const cl = { danger: 'bg-danger-50 text-danger-700', warn: 'bg-warning-50 text-warning-700', info: 'bg-sky-50 text-sky-700' }[a.severity];
              return (
                <li key={a.id} className="flex items-start gap-3 px-2 py-1.5 rounded-lg hover:bg-neutral-50 cursor-pointer">
                  <span className={`h-7 w-7 rounded-md inline-flex items-center justify-center shrink-0 ${cl}`}><IconCmp size={13}/></span>
                  <div className="flex-1 min-w-0 text-sm text-neutral-800 leading-snug">{a.label}</div>
                </li>
              );
            })}
          </ul>
        </UI.Card>
      </div>

      {/* Row 4 — Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <UI.Card>
          <UI.CardHeader title={t('meters_by_project')} icon={Icon.BarChart3}/>
          <div className="mt-4 h-64">
            <R.ResponsiveContainer width="100%" height="100%">
              <R.BarChart data={metersByProjectData.length > 0 ? metersByProjectData : MX.metersByProject} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <R.CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                <R.XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false}/>
                <R.YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false}/>
                <R.Tooltip cursor={{ fill: '#EFF6FF' }} contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}/>
                <R.Bar dataKey="meters" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={36}/>
              </R.BarChart>
            </R.ResponsiveContainer>
          </div>
        </UI.Card>
        <UI.Card>
          <UI.CardHeader title={t('hse_trend')} icon={Icon.ShieldAlert} subtitle="% de cumplimiento de inspecciones HSE"/>
          <div className="mt-4 h-64">
            <R.ResponsiveContainer width="100%" height="100%">
              <R.AreaChart data={MX.hseTrend} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <R.CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0"/>
                <R.XAxis dataKey="m" tick={{ fontSize: 11, fill: '#475569' }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false}/>
                <R.YAxis domain={[85, 100]} tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false}/>
                <R.Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}/>
                <R.Area dataKey="v" stroke="#10B981" strokeWidth={2} fill="url(#hseFill)"/>
              </R.AreaChart>
            </R.ResponsiveContainer>
          </div>
        </UI.Card>
      </div>
    </>
  );
};

window.PageDashboard = PageDashboard;
