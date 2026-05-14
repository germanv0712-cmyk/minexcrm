// Topografía y Geofísica, Geología y Núcleos, Registro de Visitas

// ============ Topografía y Geofísica ============
const PageTopo = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const toast = UI.useToast();
  const [drawer, setDrawer] = React.useState(false);
  const [openSurvey, setOpenSurvey] = React.useState(null);

  return (
    <>
      <UI.SectionHeader
        title={t('nav_topo')}
        subtitle="Levantamientos topográficos y geofísicos"
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('nav_field') },
          { label: t('nav_topo') },
        ]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>Exportar datos</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus} onClick={() => setDrawer(true)}>Nuevo levantamiento</UI.Button>
          </>
        }/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">Levantamientos activos</div><div className="font-display font-bold text-2xl mt-1">{MX.surveys.filter((s) => s.status === 'inprogress').length}</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Área cubierta total</div><div className="font-display font-bold text-2xl mt-1 font-mono">428 <span className="text-sm font-normal">ha</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Líneas geofísicas</div><div className="font-display font-bold text-2xl mt-1 font-mono">528 <span className="text-sm font-normal">km</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Datos crudos pendientes</div><div className="font-display font-bold text-2xl mt-1">14 <span className="text-sm font-normal text-neutral-500">archivos</span></div></UI.Card>
      </div>

      <UI.Card padding={false}>
        <UI.Table columns={[
          { label: 'Código', render: (s) => <span className="font-mono text-primary-700 font-semibold">{s.code}</span> },
          { label: 'Tipo', render: (s) => <UI.Badge kind="info" dot>{s.type}</UI.Badge> },
          { label: 'Proyecto', render: (s) => MX.projects.find((p) => p.id === s.projectId)?.name },
          { label: 'Área / extensión', render: (s) => <span className="font-mono text-sm">{s.area}</span> },
          { label: 'Equipo', render: (s) => <span className="text-xs">{s.device}</span> },
          { label: 'Responsable', render: (s) => { const u = MX.people.find((p) => p.id === s.responsibleId); return <span className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={22}/><span className="text-sm">{u.name}</span></span>; } },
          { label: 'Fecha', render: (s) => <span className="font-mono text-xs">{MX.formatDate(s.date, lang)}</span> },
          { label: 'Estado', render: (s) => UI.statusBadge(s.status, t) },
        ]} rows={MX.surveys} onRowClick={setOpenSurvey}/>
      </UI.Card>

      {/* Survey detail drawer */}
      <UI.Drawer open={!!openSurvey} onClose={() => setOpenSurvey(null)}
        title={openSurvey ? openSurvey.code : ''}
        subtitle={openSurvey ? `${openSurvey.type} · ${MX.projects.find((p) => p.id === openSurvey.projectId)?.name}` : ''}
        width="max-w-3xl"
        footer={<div className="flex justify-end gap-2"><UI.Button kind="secondary" icon={Icon.FileText}>Generar informe</UI.Button><UI.Button kind="primary" icon={Icon.Download}>Descargar datos crudos</UI.Button></div>}>
        {openSurvey ? (
          <div className="space-y-4">
            <UI.Card>
              <UI.CardHeader title="Grilla del levantamiento" icon={Icon.Compass} subtitle={`Cobertura: ${openSurvey.area} · ${openSurvey.device}`}/>
              <SurveyGrid type={openSurvey.type}/>
            </UI.Card>

            <UI.Card>
              <UI.CardHeader title="Archivos asociados" icon={Icon.FileText}/>
              <ul className="mt-3 space-y-2">
                {[
                  { n: `raw_${openSurvey.code}_001.csv`, sz: '4.2 MB', kind: 'Datos crudos' },
                  { n: `raw_${openSurvey.code}_002.dat`, sz: '8.7 MB', kind: 'Datos crudos' },
                  { n: `informe_${openSurvey.code}.pdf`, sz: '2.1 MB', kind: 'Informe procesado' },
                  { n: `mapa_${openSurvey.code}.geotiff`, sz: '24 MB', kind: 'Mapa' },
                ].map((f) => (
                  <li key={f.n} className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 hover:bg-neutral-50">
                    <span className="inline-flex items-center gap-2 text-sm"><Icon.FileText size={14} className="text-primary-700"/>{f.n}<UI.Badge kind="neutral" size="sm">{f.kind}</UI.Badge></span>
                    <div className="inline-flex items-center gap-3 text-xs text-neutral-600"><span className="font-mono">{f.sz}</span><UI.IconButton icon={Icon.Download} size="sm"/></div>
                  </li>
                ))}
              </ul>
            </UI.Card>
          </div>
        ) : null}
      </UI.Drawer>

      <UI.Drawer open={drawer} onClose={() => setDrawer(false)} title="Nuevo levantamiento" width="max-w-2xl"
        footer={<div className="flex justify-end gap-2"><UI.Button kind="ghost" onClick={() => setDrawer(false)}>Cancelar</UI.Button><UI.Button kind="primary" icon={Icon.Check} onClick={() => { setDrawer(false); toast.push({ kind: 'success', title: 'Levantamiento creado' }); }}>Crear</UI.Button></div>}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Código" required><UI.Input defaultValue="TOP-2026-023"/></UI.Field>
            <UI.Field label="Tipo" required><UI.Select><option>Topográfico</option><option>Magnetometría</option><option>Gravimetría</option><option>Sísmica</option><option>Inducida (IP)</option></UI.Select></UI.Field>
            <UI.Field label="Proyecto" required className="sm:col-span-2"><UI.Select>{MX.projects.map((p) => <option key={p.id}>{p.code} — {p.name}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Área (ha) o líneas (km)" required><UI.Input defaultValue="42 ha"/></UI.Field>
            <UI.Field label="Equipo / dispositivo" required><UI.Input defaultValue="GNSS RTK Trimble R12"/></UI.Field>
            <UI.Field label="Responsable" required><UI.Select>{MX.people.map((p) => <option key={p.id}>{p.name}</option>)}</UI.Select></UI.Field>
            <UI.Field label="Fecha de inicio" required><UI.Input type="date" defaultValue="2026-05-20"/></UI.Field>
          </div>
          <Dropzone label="Sube archivos crudos (.csv, .dat, .raw) y planos asociados"/>
        </div>
      </UI.Drawer>
    </>
  );
};

const SurveyGrid = ({ type }) => (
  <div className="relative mt-3 h-72 rounded-lg overflow-hidden bg-neutral-50 border border-neutral-200">
    <svg viewBox="0 0 600 280" className="w-full h-full">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#CBD5E1" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="600" height="280" fill="url(#grid)"/>
      {/* Survey lines */}
      <g stroke="#2563EB" strokeWidth="1.5" fill="none">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={40 + i * 44} y1="40" x2={40 + i * 44} y2="240"/>
        ))}
      </g>
      {/* Survey points */}
      <g fill="#0EA5E9">
        {Array.from({ length: 60 }).map((_, i) => (
          <circle key={i} cx={40 + (i % 12) * 44} cy={50 + Math.floor(i / 12) * 36} r="2.5"/>
        ))}
      </g>
      {/* Area boundary */}
      <polygon points="30,30 580,30 575,250 35,255" fill="none" stroke="#1E3A8A" strokeWidth="2" strokeDasharray="6 4"/>
      <text x="40" y="22" fontSize="10" fill="#1E3A8A" fontFamily="JetBrains Mono">Grilla 50m × 50m — {type}</text>
    </svg>
  </div>
);

// ============ Geología y Núcleos ============
const PageGeology = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const [open, setOpen] = React.useState(null);
  const [filters, setFilters] = React.useState({ project: 'all', well: 'all', from: '', to: '' });
  const cores = MX.coreBoxes.filter((c) => {
    const w = MX.wells.find((x) => x.id === c.wellId);
    if (filters.project !== 'all' && w.projectId !== filters.project) return false;
    if (filters.well !== 'all' && c.wellId !== filters.well) return false;
    if (filters.from && c.to < parseFloat(filters.from)) return false;
    if (filters.to && c.from > parseFloat(filters.to)) return false;
    return true;
  });

  return (
    <>
      <UI.SectionHeader
        title={t('nav_geology')}
        subtitle="Galería de cajas de núcleos con metadatos y resultados de laboratorio"
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('nav_field') },
          { label: t('nav_geology') },
        ]}
        actions={<UI.Button kind="primary" icon={Icon.Plus}>Cargar caja</UI.Button>}/>

      <UI.Card className="mb-4" padding={false}>
        <div className="flex flex-wrap items-center gap-3 p-3">
          <UI.Select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value, well: 'all' })} className="!w-56">
            <option value="all">Todos los proyectos</option>
            {MX.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </UI.Select>
          <UI.Select value={filters.well} onChange={(e) => setFilters({ ...filters, well: e.target.value })} className="!w-44">
            <option value="all">Todos los pozos</option>
            {MX.wells.filter((w) => filters.project === 'all' || w.projectId === filters.project).map((w) => <option key={w.id} value={w.id}>{w.code}</option>)}
          </UI.Select>
          <div className="inline-flex items-center gap-2">
            <UI.Input type="number" placeholder="Desde m" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="!w-28 font-mono"/>
            <span className="text-neutral-500">→</span>
            <UI.Input type="number" placeholder="Hasta m" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="!w-28 font-mono"/>
          </div>
          <span className="ml-auto text-xs text-neutral-500">{cores.length} cajas</span>
        </div>
      </UI.Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {cores.map((c) => {
          const w = MX.wells.find((x) => x.id === c.wellId);
          return (
            <UI.Card key={c.id} padding={false} className="cursor-pointer hover:shadow-pop transition" onClick={() => setOpen(c)}>
              <CoreBoxPlaceholder color={c.photoColor} from={c.from} to={c.to}/>
              <div className="p-2.5">
                <div className="font-mono text-[11px] font-semibold text-primary-700">{w.code}</div>
                <div className="font-mono text-xs font-semibold mt-0.5">{c.from.toFixed(0)} – {c.to.toFixed(0)} m</div>
                <div className="mt-1.5 flex items-center justify-between">
                  <UI.Badge kind={c.lab === 'Pendiente' ? 'warn' : c.lab.startsWith('Cu') ? 'success' : 'info'} size="sm">{c.lab}</UI.Badge>
                  <span className="text-[10px] text-neutral-500 font-mono">{c.date.slice(5)}</span>
                </div>
              </div>
            </UI.Card>
          );
        })}
      </div>

      {/* Detail modal */}
      {open ? (
        <UI.Modal open onClose={() => setOpen(null)} title={`Caja de núcleo · ${MX.wells.find((w) => w.id === open.wellId)?.code}`} width="max-w-3xl"
          footer={<><UI.Button kind="ghost" onClick={() => setOpen(null)}>Cerrar</UI.Button><UI.Button kind="secondary" icon={Icon.Download}>Foto HD</UI.Button><UI.Button kind="primary" icon={Icon.Send}>Enviar a laboratorio</UI.Button></>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="rounded-lg overflow-hidden border border-neutral-200">
                <div className="h-72 relative" style={{ backgroundColor: '#1F2937' }}>
                  <div className="absolute inset-2 grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="rounded-sm" style={{ backgroundColor: open.photoColor, opacity: 0.55 + (i % 5) * 0.08 }}/>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-neutral-500 font-mono text-center">{open.from.toFixed(1)} m → {open.to.toFixed(1)} m  ·  {(open.to - open.from).toFixed(1)} m totales</div>
            </div>
            <div className="space-y-3 text-sm">
              <UI.Field label="Descripción litológica"><UI.Textarea defaultValue={`De ${open.from.toFixed(1)} a ${(open.from + 6).toFixed(1)} m: pórfido feldespático cuarzoso con vetillas tipo B abundantes. Ley estimada de Cu 0,8–1,2%. Continuidad mineral observada en la última caja.`} rows={5}/></UI.Field>
              <div className="grid grid-cols-2 gap-3">
                <UI.Field label="Pozo"><UI.Input readOnly value={MX.wells.find((w) => w.id === open.wellId)?.code}/></UI.Field>
                <UI.Field label="Fecha"><UI.Input readOnly value={open.date}/></UI.Field>
                <UI.Field label="Fotógrafo"><UI.Input readOnly value={MX.people.find((u) => u.id === open.photographer)?.name}/></UI.Field>
                <UI.Field label="Ensayos solicitados"><UI.Input defaultValue="Au, Cu, Ag, Mo (4-acid)"/></UI.Field>
              </div>
              <UI.Field label="Resultado de laboratorio">
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="flex items-center justify-between"><span className="text-xs text-neutral-500">SGS Medellín</span><UI.Badge kind={open.lab === 'Pendiente' ? 'warn' : open.lab.startsWith('Cu') ? 'success' : 'info'} dot size="sm">{open.lab}</UI.Badge></div>
                  <div className="mt-2 font-mono text-sm">Cu 1,08%   Au 0,32 g/t   Ag 12,4 g/t   Mo 0,015%</div>
                </div>
              </UI.Field>
            </div>
          </div>
        </UI.Modal>
      ) : null}
    </>
  );
};

// ============ Registro de Visitas ============
const PageVisits = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const toast = UI.useToast();
  const [drawer, setDrawer] = React.useState(false);

  return (
    <>
      <UI.SectionHeader
        title={t('nav_visits')}
        subtitle="Registro de actividad de campo: fotos, GPS y observaciones"
        breadcrumbs={[
          { label: t('appName'), onClick: () => go('/dashboard') },
          { label: t('nav_field') },
          { label: t('nav_visits') },
        ]}
        actions={<UI.Button kind="primary" size="lg" icon={Icon.Plus} className="!h-12 !px-6 !text-base" onClick={() => setDrawer(true)}>Nueva visita</UI.Button>}/>

      {/* Mobile-friendly big CTA */}
      <UI.Card className="mb-6 md:hidden text-center" padding>
        <Icon.Smartphone size={32} className="mx-auto text-primary-700"/>
        <div className="font-display font-semibold text-neutral-900 mt-2">Optimizado para campo</div>
        <div className="text-xs text-neutral-600 mt-1">Pulsa el botón flotante para registrar una visita en menos de 60 segundos.</div>
      </UI.Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">Visitas esta semana</div><div className="font-display font-bold text-2xl mt-1">28</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Fotos cargadas</div><div className="font-display font-bold text-2xl mt-1">142</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Tiempo promedio</div><div className="font-display font-bold text-2xl mt-1 font-mono">47 <span className="text-sm font-normal">s</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Borradores pendientes</div><div className="font-display font-bold text-2xl mt-1 text-warning-700">3</div></UI.Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MX.visits.map((v) => {
          const u = MX.people.find((p) => p.id === v.userId);
          const pr = MX.projects.find((p) => p.id === v.projectId);
          return (
            <UI.Card key={v.id} padding={false}>
              <UI.PlaceholderImg label="Foto · GPS" color={v.color} height={180} className="rounded-b-none"/>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <UI.Badge kind="info" dot size="sm">{v.type}</UI.Badge>
                  <span className="text-[11px] text-neutral-500 font-mono">{MX.formatDate(v.date, lang)}</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-neutral-900">{pr.name}</div>
                <div className="mt-1 text-xs text-neutral-700 line-clamp-2">{v.desc}</div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5"><UI.Avatar name={u.name} color={u.color} size={20}/>{u.name}</span>
                  <span className="inline-flex items-center gap-3 text-neutral-500">
                    <span className="inline-flex items-center gap-1"><Icon.MapPin size={11}/><span className="font-mono">{v.lat.toFixed(2)}°</span></span>
                    <span className="inline-flex items-center gap-1"><Icon.Image size={11}/>{v.photos}</span>
                  </span>
                </div>
              </div>
            </UI.Card>
          );
        })}
      </div>

      <UI.FAB icon={Icon.Plus} onClick={() => setDrawer(true)} label="Nueva visita"/>

      <NewVisitDrawer open={drawer} onClose={() => setDrawer(false)} onSubmit={(status) => { setDrawer(false); toast.push({ kind: 'success', title: status === 'draft' ? 'Borrador guardado' : 'Visita enviada', desc: status === 'draft' ? 'Podrás continuar luego desde tu lista.' : 'Notificado a tu supervisor.' }); }}/>
    </>
  );
};

const NewVisitDrawer = ({ open, onClose, onSubmit }) => {
  const [proj, setProj] = React.useState('p1');
  const [type, setType] = React.useState('Inspección');
  const [desc, setDesc] = React.useState('');
  const [photos, setPhotos] = React.useState([0, 1, 2]); // placeholders
  const [signed, setSigned] = React.useState(false);
  return (
    <UI.Drawer open={open} onClose={onClose} title="Nueva visita" subtitle="Optimizado para uso móvil · ~60 s"
      width="max-w-xl"
      footer={
        <div className="flex justify-between">
          <UI.Button kind="ghost" onClick={onClose}>Cancelar</UI.Button>
          <div className="flex gap-2">
            <UI.Button kind="secondary" icon={Icon.Save} onClick={() => onSubmit('draft')}>Guardar borrador</UI.Button>
            <UI.Button kind="primary" icon={Icon.Send} onClick={() => onSubmit('sent')}>Enviar visita</UI.Button>
          </div>
        </div>
      }>
      <div className="space-y-5">
        <UI.Field label="Proyecto" required>
          <UI.Select value={proj} onChange={(e) => setProj(e.target.value)}>
            {MX.projects.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </UI.Select>
        </UI.Field>

        <UI.Field label="Tipo de visita" required>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Inspección','Supervisión','Mantenimiento','Auditoría HSE','Entrega'].map((tp) => (
              <button key={tp} onClick={() => setType(tp)}
                className={`h-12 px-3 rounded-lg border text-sm font-medium transition ${type === tp ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'}`}>
                {tp}
              </button>
            ))}
          </div>
        </UI.Field>

        <div className="grid grid-cols-2 gap-3">
          <UI.Field label="Fecha"><UI.Input type="date" defaultValue="2026-05-14" icon={Icon.Calendar}/></UI.Field>
          <UI.Field label="Hora"><UI.Input type="time" defaultValue="08:30" icon={Icon.Clock}/></UI.Field>
        </div>

        <UI.Field label="Ubicación (GPS automático)">
          <div className="rounded-lg overflow-hidden border border-neutral-200">
            <div className="relative h-40 bg-gradient-to-br from-sky-100 to-primary-50">
              <svg viewBox="0 0 400 200" className="w-full h-full">
                <pattern id="gridV" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#CBD5E1" strokeWidth="0.5"/></pattern>
                <rect width="400" height="200" fill="url(#gridV)"/>
                <path d="M50 130 Q150 50 250 110 T380 90" stroke="#10B981" strokeWidth="2" fill="none"/>
                <circle cx="200" cy="100" r="10" fill="#2563EB" opacity="0.25"/>
                <circle cx="200" cy="100" r="5" fill="#2563EB" stroke="#fff" strokeWidth="2" className="pin-pulse"/>
              </svg>
              <div className="absolute bottom-2 left-2 bg-white/95 rounded-md px-2 py-1 font-mono text-[11px] text-neutral-700">
                11.4523° N · -72.9510° W · ±3 m
              </div>
              <button className="absolute top-2 right-2 inline-flex items-center gap-1 bg-white/95 hover:bg-white px-2.5 py-1.5 rounded-md text-xs font-medium shadow-sm">
                <Icon.RefreshCw size={12}/> Recapturar
              </button>
            </div>
          </div>
        </UI.Field>

        <UI.Field label="Descripción / observaciones">
          <UI.Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="¿Qué observaste en el sitio? Estado de la operación, riesgos, hallazgos…"/>
        </UI.Field>

        <UI.Field label="Fotos">
          <div className="flex gap-2 flex-wrap">
            {photos.map((p, i) => (
              <div key={i} className="relative">
                <UI.PlaceholderImg label="foto" color="#1E3A8A" height={80} className="!h-20 !w-20"/>
                <button onClick={() => setPhotos(photos.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-white rounded-full shadow border border-neutral-200 flex items-center justify-center"><Icon.X size={11}/></button>
              </div>
            ))}
            <button className="h-20 w-20 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-primary-500 hover:text-primary-700"><Icon.Camera size={20}/></button>
            <button className="h-20 w-20 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-500 hover:border-primary-500 hover:text-primary-700"><Icon.Upload size={20}/></button>
          </div>
        </UI.Field>

        <UI.Field label="Video (máx 60s)">
          <button className="w-full h-16 rounded-lg border-2 border-dashed border-neutral-300 hover:border-primary-500 inline-flex items-center justify-center gap-3 text-sm text-neutral-700">
            <Icon.Video size={18}/> <span>Grabar video</span><span className="text-neutral-400">o</span><span className="text-primary-700 font-medium">subir archivo</span>
          </button>
        </UI.Field>

        <UI.Field label="Firma digital del responsable">
          <div className="relative rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-50 h-28 flex items-center justify-center cursor-pointer hover:border-primary-500 group"
               onClick={() => setSigned(!signed)}>
            {signed ? (
              <svg viewBox="0 0 300 80" className="w-3/4 h-16">
                <path d="M20 60 Q40 20 80 40 T140 50 Q170 30 200 60 T280 40" stroke="#0F172A" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
              </svg>
            ) : (
              <div className="text-sm text-neutral-500 inline-flex items-center gap-2"><Icon.PenTool size={16}/> Pulsa para firmar</div>
            )}
            {signed ? <button onClick={(e) => { e.stopPropagation(); setSigned(false); }} className="absolute top-2 right-2 text-xs text-danger-700 hover:underline">Borrar</button> : null}
          </div>
        </UI.Field>
      </div>
    </UI.Drawer>
  );
};

window.PageTopo = PageTopo;
window.PageGeology = PageGeology;
window.PageVisits = PageVisits;
