// Perforaciones — list + detail (módulo estrella)
const PageDrilling = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({ status: 'all', project: 'all', q: '' });
  const rows = MX.wells.filter((w) => {
    if (filters.status !== 'all' && w.status !== filters.status) return false;
    if (filters.project !== 'all' && w.projectId !== filters.project) return false;
    if (filters.q && !w.code.toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <UI.SectionHeader
        title={t('drilling_title')}
        subtitle="Control técnico y operativo de pozos de perforación"
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('nav_field') },
          { label: t('drilling_title') },
        ]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>Exportar logs</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus} onClick={() => setDrawerOpen(true)}>{t('new_well')}</UI.Button>
          </>
        }/>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">Pozos activos</div><div className="font-display font-bold text-2xl mt-1">{MX.wells.filter((w) => w.status === 'active').length}</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Metros perforados (mes)</div><div className="font-display font-bold text-2xl mt-1 font-mono">2 487 <span className="text-sm font-normal">m</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Recuperación promedio</div><div className="font-display font-bold text-2xl mt-1 font-mono">92,4 <span className="text-sm font-normal">%</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Costo / metro</div><div className="font-display font-bold text-2xl mt-1 font-mono">$486K</div><div className="text-[11px] text-success-700 mt-1">↓ 4% vs Q1</div></UI.Card>
      </div>

      <UI.Card className="mb-4" padding={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <UI.Input icon={Icon.Search} placeholder="Buscar código de pozo…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className="!w-56"/>
          <UI.Select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })} className="!w-56">
            <option value="all">Todos los proyectos</option>
            {MX.projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </UI.Select>
          <UI.Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="!w-40">
            <option value="all">Todos los estados</option>
            <option value="active">{t('active')}</option>
            <option value="paused">{t('paused')}</option>
            <option value="alert">{t('alert')}</option>
            <option value="completed">{t('completed')}</option>
          </UI.Select>
          <span className="ml-auto text-xs text-neutral-500">{rows.length} pozos</span>
        </div>
      </UI.Card>

      <UI.Card padding={false}>
        <UI.Table
          columns={[
            { label: t('well_code'), render: (w) => <span className="font-mono text-primary-700 font-semibold">{w.code}</span> },
            { label: t('project'), render: (w) => { const p = MX.projects.find((x) => x.id === w.projectId); return <div><div className="text-sm">{p.name}</div><div className="text-[11px] text-neutral-500 font-mono">{p.code}</div></div>; } },
            { label: t('coords_utm'), render: (w) => <span className="font-mono text-[12px] text-neutral-700">E {MX.formatNum(w.utm.e)} · N {MX.formatNum(w.utm.n)}</span> },
            { label: t('depth'), render: (w) => <div className="min-w-[140px]"><div className="flex items-center justify-between text-xs"><span className="font-mono font-semibold">{w.depthCur.toFixed(1)} / {w.depthTarget} m</span><span className="text-neutral-500">{Math.round((w.depthCur / w.depthTarget) * 100)}%</span></div><UI.Progress value={(w.depthCur / w.depthTarget) * 100} size="sm" className="mt-1"/></div> },
            { label: t('bit'), render: (w) => <span className="text-xs text-neutral-700">{w.bit}</span> },
            { label: t('operator'), render: (w) => { const u = MX.people.find((x) => x.id === w.opId); return <span className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={22}/><span className="text-xs">{u.name}</span></span>; } },
            { label: t('equipment'), render: (w) => { const e = MX.equipment.find((x) => x.id === w.rigId); return <span className="text-xs">{e.code}</span>; } },
            { label: t('status'), render: (w) => UI.statusBadge(w.status, t) },
            { label: t('last_update'), render: (w) => <span className="font-mono text-[11px] text-neutral-600">{MX.formatDate(w.lastUpdate, lang)} · {new Date(w.lastUpdate).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</span> },
          ]}
          rows={rows}
          onRowClick={(w) => go('/perforaciones/' + w.id)}/>
      </UI.Card>

      <NewWellDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}/>
    </>
  );
};

const PageWellDetail = ({ id }) => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const w = MX.wells.find((x) => x.id === id);
  if (!w) return <UI.EmptyState title="Pozo no encontrado" action={<UI.Button onClick={() => go('/perforaciones')}>Volver</UI.Button>}/>;
  const p = MX.projects.find((x) => x.id === w.projectId);
  const op = MX.people.find((u) => u.id === w.opId);
  const rig = MX.equipment.find((e) => e.id === w.rigId);
  const cores = MX.coreBoxes.filter((c) => c.wellId === w.id);
  const [tab, setTab] = React.useState('log');

  const tabs = [
    { id: 'log', label: t('tab_log'), icon: Icon.ClipboardList, count: MX.drillLog.length },
    { id: 'litho', label: t('tab_lithology'), icon: Icon.Layers },
    { id: 'cores', label: t('tab_cores'), icon: Icon.Box, count: cores.length },
    { id: 'params', label: t('tab_params'), icon: Icon.Settings },
    { id: 'evidence', label: t('tab_evidence'), icon: Icon.Camera, count: 12 },
  ];

  return (
    <>
      <UI.SectionHeader
        title={<span className="font-mono">{w.code}</span>}
        subtitle={<span className="inline-flex items-center gap-3 text-sm">
          <span>{p.name}</span><span className="text-neutral-400">·</span>
          <span>{w.type}</span><span className="text-neutral-400">·</span>
          {UI.statusBadge(w.status, t)}
        </span>}
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('drilling_title'), onClick: () => go('/perforaciones') },
          { label: w.code },
        ]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.MapPin}>Ver en mapa</UI.Button>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>Exportar log</UI.Button>
            <UI.Button kind="secondary" size="sm" icon={Icon.Edit}>Editar</UI.Button>
            <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nuevo registro</UI.Button>
          </>
        }/>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <UI.Card padding><div className="text-[11px] text-neutral-500">Profundidad</div><div className="font-mono font-bold text-lg mt-0.5">{w.depthCur.toFixed(1)} m</div><div className="text-[10px] text-neutral-500">objetivo {w.depthTarget} m</div></UI.Card>
        <UI.Card padding><div className="text-[11px] text-neutral-500">Avance</div><div className="font-mono font-bold text-lg mt-0.5">{Math.round((w.depthCur / w.depthTarget) * 100)}%</div><UI.Progress value={(w.depthCur / w.depthTarget) * 100} size="sm" className="mt-1"/></UI.Card>
        <UI.Card padding><div className="text-[11px] text-neutral-500">Azimut / inclinación</div><div className="font-mono font-bold text-lg mt-0.5">{w.azimuth}° / {w.dip}°</div></UI.Card>
        <UI.Card padding><div className="text-[11px] text-neutral-500">UTM Este</div><div className="font-mono font-bold text-sm mt-0.5">{MX.formatNum(w.utm.e)}</div></UI.Card>
        <UI.Card padding><div className="text-[11px] text-neutral-500">UTM Norte</div><div className="font-mono font-bold text-sm mt-0.5">{MX.formatNum(w.utm.n)}</div></UI.Card>
        <UI.Card padding><div className="text-[11px] text-neutral-500">Cota Z</div><div className="font-mono font-bold text-lg mt-0.5">{w.utm.z} <span className="text-[11px] font-normal">m.s.n.m</span></div></UI.Card>
      </div>

      <UI.Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-5"/>

      {tab === 'log' ? (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Fecha', mono: true, render: (l) => <span className="font-mono text-xs">{l.date}</span> },
            { label: 'Turno', render: (l) => <UI.Badge kind={l.shift === 'Día' ? 'info' : 'primary'} dot size="sm">{l.shift}</UI.Badge> },
            { label: 'De / a (m)', render: (l) => <span className="font-mono text-xs">{l.from.toFixed(1)} → {l.to.toFixed(1)}</span> },
            { label: 'Metros', right: true, render: (l) => <span className="font-mono font-semibold">{l.meters.toFixed(1)}</span> },
            { label: 'Recuperación', render: (l) => <div className="flex items-center gap-2 min-w-[100px]"><UI.Progress value={l.recovery} size="sm" color={l.recovery >= 90 ? 'bg-success-500' : 'bg-warning-500'}/><span className="font-mono text-xs">{l.recovery}%</span></div> },
            { label: 'Geólogo', render: (l) => <span className="text-xs">{l.geologist}</span> },
            { label: 'Observaciones', render: (l) => <span className="text-xs text-neutral-700 line-clamp-2">{l.notes}</span> },
          ]} rows={MX.drillLog.map((l, i) => ({ ...l, id: i }))}/>
        </UI.Card>
      ) : tab === 'litho' ? (
        <LithologyColumn well={w}/>
      ) : tab === 'cores' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {cores.map((c) => {
            const photo = MX.people.find((u) => u.id === c.photographer);
            return (
              <UI.Card key={c.id} padding={false} className="hover:shadow-pop cursor-pointer transition">
                <CoreBoxPlaceholder color={c.photoColor} from={c.from} to={c.to}/>
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-mono font-semibold text-sm">{c.from.toFixed(1)} – {c.to.toFixed(1)} m</div>
                    <UI.Badge kind={c.lab === 'Pendiente' ? 'warn' : c.lab.startsWith('Cu') ? 'success' : 'info'} size="sm">{c.lab}</UI.Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-600">
                    <span className="inline-flex items-center gap-1.5"><UI.Avatar name={photo.name} color={photo.color} size={18}/>{photo.name}</span>
                    <span className="font-mono">{c.date}</span>
                  </div>
                </div>
              </UI.Card>
            );
          })}
        </div>
      ) : tab === 'params' ? (
        <DrillParams w={w} rig={rig} op={op}/>
      ) : (
        <EvidenceGallery/>
      )}
    </>
  );
};

const CoreBoxPlaceholder = ({ color, from, to }) => (
  <div className="relative h-32 rounded-t-card overflow-hidden" style={{ backgroundColor: '#1F2937' }}>
    <div className="absolute inset-0 grid grid-cols-5 gap-0.5 p-1">
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="rounded-sm" style={{ backgroundColor: color, opacity: 0.6 + (i % 5) * 0.08 }}/>
      ))}
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
    <div className="absolute bottom-2 left-2 font-mono text-[10px] text-white bg-black/40 px-1.5 py-0.5 rounded">CAJA · {from.toFixed(0)}–{to.toFixed(0)} m</div>
  </div>
);

const LithologyColumn = ({ well }) => {
  const total = well.depthCur;
  return (
    <UI.Card>
      <UI.CardHeader title="Columna estratigráfica" subtitle={`Profundidad actual ${total.toFixed(1)} m`} icon={Icon.Layers}/>
      <div className="mt-4 flex gap-6">
        {/* Depth ruler */}
        <div className="relative pr-4 border-r-2 border-neutral-200" style={{ width: 72 }}>
          {[0, 50, 100, 150, 200, 250, 300, 350].map((d) => (
            <div key={d} className="relative" style={{ height: 60 }}>
              <span className="absolute -top-2 right-1 text-[11px] text-neutral-500 font-mono">{d} m</span>
              <span className="absolute top-0 right-0 w-2 h-px bg-neutral-300"/>
            </div>
          ))}
        </div>
        {/* Column */}
        <div className="flex-1 relative" style={{ height: 480 }}>
          {MX.litho.map((l, i) => {
            const top = (l.from / 350) * 480;
            const h = ((l.to - l.from) / 350) * 480;
            return (
              <div key={i} className="absolute left-0 right-0 flex items-stretch group hover:z-10" style={{ top, height: h }}>
                <div className="w-16 rounded-l-md" style={{ backgroundColor: l.color }}/>
                <div className="flex-1 bg-white border border-l-0 border-neutral-200 rounded-r-md px-3 py-2 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-sm">{l.name}</span>
                    <span className="font-mono text-xs text-neutral-500">{l.from.toFixed(1)} – {l.to.toFixed(1)} m</span>
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5 line-clamp-2">{l.desc}</div>
                </div>
              </div>
            );
          })}
          {/* Current depth marker */}
          <div className="absolute left-0 right-0 border-t-2 border-dashed border-danger-500" style={{ top: (total / 350) * 480 }}>
            <span className="absolute -top-3 right-0 bg-danger-500 text-white text-[10px] font-mono px-2 py-0.5 rounded">▼ {total.toFixed(1)} m</span>
          </div>
        </div>
      </div>
    </UI.Card>
  );
};

const DrillParams = ({ w, rig, op }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <UI.Card>
      <UI.CardHeader title="Equipo de perforación" icon={Icon.Drill}/>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-500">Equipo</dt><dd className="font-medium">{rig.code} · {rig.brand}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Modelo</dt><dd>{rig.model}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Horómetro</dt><dd className="font-mono">{MX.formatNum(rig.hours)} h</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Operador</dt><dd className="inline-flex items-center gap-1.5"><UI.Avatar name={op.name} color={op.color} size={18}/>{op.name}</dd></div>
      </dl>
    </UI.Card>
    <UI.Card>
      <UI.CardHeader title="Parámetros operativos" icon={Icon.Settings}/>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-500">Broca</dt><dd>{w.bit}</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Presión</dt><dd className="font-mono">28 bar</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">RPM</dt><dd className="font-mono">680 rpm</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Peso sobre la broca</dt><dd className="font-mono">12 kN</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Caudal</dt><dd className="font-mono">85 L/min</dd></div>
      </dl>
    </UI.Card>
    <UI.Card>
      <UI.CardHeader title="Fluidos y consumibles" icon={Icon.Cloud}/>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between"><dt className="text-neutral-500">Fluido</dt><dd>Polímero + bentonita</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Densidad</dt><dd className="font-mono">1,05 g/cm³</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Viscosidad</dt><dd className="font-mono">42 s</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Brocas utilizadas</dt><dd>3</dd></div>
        <div className="flex justify-between"><dt className="text-neutral-500">Tubería instalada</dt><dd className="font-mono">{w.depthCur.toFixed(0)} m</dd></div>
      </dl>
    </UI.Card>
  </div>
);

const EvidenceGallery = () => {
  const items = Array.from({ length: 8 }).map((_, i) => ({
    id: 'ev' + i,
    color: ['#0A2540','#1E3A8A','#0EA5E9','#B45309','#6D28D9','#047857','#334155','#2563EB'][i],
    type: i % 3 === 2 ? 'video' : 'photo',
    label: i % 3 === 2 ? `Video — turno noche ${i+1}` : `Plataforma ${String.fromCharCode(65 + i)}`,
    when: `2026-05-${10 + i} · ${10 + i}:42`,
    coords: '11.45°N · -72.95°W',
    author: ['Carlos Restrepo','Yulieth Cabrera','Mateo Cárdenas','Ana Vélez','Jhon Quintero','Carlos Restrepo','Mateo Cárdenas','Ana Vélez'][i],
  }));
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.id} className="relative rounded-lg overflow-hidden border border-neutral-200 group cursor-pointer">
          <UI.PlaceholderImg label={it.type === 'video' ? '▶ video' : 'foto sitio'} color={it.color} ratio={4/3}/>
          <div className="absolute top-2 left-2"><UI.Badge kind={it.type === 'video' ? 'danger' : 'info'} dot size="sm">{it.type === 'video' ? 'Video' : 'Foto'}</UI.Badge></div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-white text-[11px]">
            <div className="font-medium">{it.label}</div>
            <div className="font-mono text-[10px] opacity-80">{it.coords} · {it.when}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============ New well drawer ============
const NewWellDrawer = ({ open, onClose }) => {
  const toast = UI.useToast();
  return (
    <UI.Drawer open={open} onClose={onClose} title="Nuevo registro de perforación" subtitle="Estado: borrador" width="max-w-2xl"
      footer={<div className="flex justify-between">
        <UI.Button kind="ghost" onClick={onClose}>{'Cancelar'}</UI.Button>
        <div className="flex gap-2">
          <UI.Button kind="secondary" icon={Icon.Save} onClick={() => { onClose(); toast.push({ kind: 'info', title: 'Borrador guardado' }); }}>Guardar borrador</UI.Button>
          <UI.Button kind="primary" icon={Icon.Check} onClick={() => { onClose(); toast.push({ kind: 'success', title: 'Pozo creado', desc: 'DDH-2026-088 listo para registrar avances.' }); }}>Crear pozo</UI.Button>
        </div>
      </div>}>
      <div className="space-y-6">
        <Section title="1. Identificación" icon={Icon.Hash}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Proyecto" required><UI.Select defaultValue="p1">{MX.projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Código del pozo" required><UI.Input defaultValue="DDH-2026-088"/></UI.Field>
            <div className="sm:col-span-2">
              <div className="flex items-end gap-2">
                <UI.Field label="UTM Este" required className="flex-1"><UI.Input className="font-mono" defaultValue="1093720"/></UI.Field>
                <UI.Field label="UTM Norte" required className="flex-1"><UI.Input className="font-mono" defaultValue="1727980"/></UI.Field>
                <UI.Field label="Cota Z (m.s.n.m)" required className="flex-1"><UI.Input className="font-mono" defaultValue="246"/></UI.Field>
                <UI.Button kind="secondary" icon={Icon.MapPin} className="!shrink-0">Capturar GPS</UI.Button>
              </div>
            </div>
            <UI.Field label="Azimut (°)" required><UI.Input className="font-mono" defaultValue="270"/></UI.Field>
            <UI.Field label="Inclinación (°)" required><UI.Input className="font-mono" defaultValue="-65"/></UI.Field>
          </div>
        </Section>

        <Section title="2. Planificación" icon={Icon.Compass}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Profundidad objetivo (m)" required><UI.Input className="font-mono" defaultValue="320"/></UI.Field>
            <UI.Field label="Tipo de perforación" required><UI.Select><option>Diamantina</option><option>Aire reverso (RC)</option><option>Sónica</option></UI.Select></UI.Field>
            <UI.Field label="Fecha de inicio prevista" required><UI.Input type="date" defaultValue="2026-05-20"/></UI.Field>
            <UI.Field label="Duración estimada (días)"><UI.Input className="font-mono" defaultValue="42"/></UI.Field>
          </div>
        </Section>

        <Section title="3. Asignación" icon={Icon.Users}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Equipo de perforación" required><UI.Select>{MX.equipment.filter((e) => e.type === 'Perforadora').map((e) => <option key={e.id}>{e.code} — {e.brand} {e.model}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Operador responsable" required><UI.Select>{MX.people.filter((p) => p.role.includes('perforación')).map((p) => <option key={p.id}>{p.name}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Geólogo a cargo" required><UI.Select>{MX.people.filter((p) => p.role.includes('Geól')).map((p) => <option key={p.id}>{p.name}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Turnos">
              <div className="flex gap-2">
                <UI.Checkbox label="Día" checked/>
                <UI.Checkbox label="Noche" checked/>
              </div>
            </UI.Field>
          </div>
        </Section>

        <Section title="4. Evidencia inicial" icon={Icon.Camera}>
          <Dropzone label="Suelta aquí fotos del sitio antes de iniciar la perforación"/>
        </Section>
      </div>
    </UI.Drawer>
  );
};

const Section = ({ title, icon: IconCmp, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className="h-7 w-7 rounded-lg bg-primary-50 text-primary-700 inline-flex items-center justify-center"><IconCmp size={14}/></span>
      <span className="font-display font-semibold text-neutral-900">{title}</span>
    </div>
    {children}
  </div>
);

const Dropzone = ({ label }) => (
  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50 hover:bg-primary-50 hover:border-primary-300 transition cursor-pointer">
    <Icon.Upload size={24} className="mx-auto text-primary-700"/>
    <div className="mt-2 text-sm font-medium text-neutral-700">{label}</div>
    <div className="text-xs text-neutral-500 mt-1">o haz clic para seleccionar archivos · JPG, PNG, HEIC hasta 25 MB</div>
  </div>
);

window.PageDrilling = PageDrilling;
window.PageWellDetail = PageWellDetail;
window._Dropzone = Dropzone;
