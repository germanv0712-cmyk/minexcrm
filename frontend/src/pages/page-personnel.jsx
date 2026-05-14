// Personal — directorio + detalle + programación de turnos
const PagePersonnel = () => {
  const { t } = useT();
  const { go } = Layout.useRouter();
  const [tab, setTab] = React.useState('directory');
  const [open, setOpen] = React.useState(null);

  return (
    <>
      <UI.SectionHeader
        title={t('nav_personnel')}
        subtitle="Directorio, certificaciones y programación de turnos"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_personnel') }]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>{t('export')}</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus}>Nueva persona</UI.Button>
          </>
        }/>

      <UI.Tabs value={tab} onChange={setTab} className="mb-5"
        tabs={[
          { id: 'directory', label: 'Directorio', icon: Icon.Users, count: MX.people.length },
          { id: 'schedule', label: 'Programación de turnos', icon: Icon.Calendar },
        ]}/>

      {tab === 'directory' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MX.people.map((p) => {
            const pr = p.project ? MX.projects.find((x) => x.id === p.project) : null;
            return (
              <UI.Card key={p.id} className="cursor-pointer hover:shadow-pop transition" onClick={() => setOpen(p)}>
                <div className="flex items-start gap-3">
                  <UI.Avatar name={p.name} color={p.color} size={48}/>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-neutral-900 truncate">{p.name}</div>
                    <div className="text-xs text-neutral-600 truncate">{p.role}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{pr ? pr.code : 'Sin proyecto'} · Turno {p.shift}</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200 flex flex-wrap gap-1.5">
                  {Object.entries(p.certs).filter(([k]) => p.certs[k] !== 'na').map(([k, v]) => (
                    <UI.Badge key={k} size="sm"
                      kind={v === 'ok' ? 'success' : v === 'warn' ? 'warn' : 'danger'} dot>{({ alturas: 'Alturas', confined: 'Confinados', firstAid: 'Primeros Aux.' })[k]}</UI.Badge>
                  ))}
                </div>
              </UI.Card>
            );
          })}
        </div>
      ) : (
        <ShiftSchedule/>
      )}

      <UI.Drawer open={!!open} onClose={() => setOpen(null)}
        title={open ? open.name : ''}
        subtitle={open ? open.role : ''}
        width="max-w-2xl">
        {open ? <PersonDetail p={open}/> : null}
      </UI.Drawer>
    </>
  );
};

const PersonDetail = ({ p }) => {
  const pr = p.project ? MX.projects.find((x) => x.id === p.project) : null;
  return (
    <div className="space-y-4">
      <UI.Card>
        <div className="flex items-center gap-4">
          <UI.Avatar name={p.name} color={p.color} size={72}/>
          <div className="flex-1">
            <div className="font-display font-bold text-xl">{p.name}</div>
            <div className="text-sm text-neutral-600">{p.role} · Turno {p.shift}</div>
            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-700">
              <span className="inline-flex items-center gap-1.5"><Icon.Phone size={12}/>{p.phone}</span>
              {pr ? <span className="inline-flex items-center gap-1.5"><Icon.Folder size={12}/>{pr.name}</span> : null}
            </div>
          </div>
        </div>
      </UI.Card>

      <UI.Card>
        <UI.CardHeader title="Certificaciones" icon={Icon.Award}/>
        <ul className="mt-3 space-y-2">
          {[
            { id: 'alturas',  label: 'Trabajo en alturas — SENA', expires: '2026-09-12', status: p.certs.alturas },
            { id: 'confined', label: 'Espacios confinados',       expires: '2026-11-04', status: p.certs.confined },
            { id: 'firstAid', label: 'Primeros auxilios',         expires: '2027-02-22', status: p.certs.firstAid },
          ].map((c) => (
            <li key={c.id} className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-[11px] text-neutral-500 font-mono">Vence {c.expires}</div>
              </div>
              <UI.Badge kind={c.status === 'ok' ? 'success' : c.status === 'warn' ? 'warn' : c.status === 'expired' ? 'danger' : 'neutral'} dot>
                {c.status === 'ok' ? 'Vigente' : c.status === 'warn' ? 'Por vencer' : c.status === 'expired' ? 'Vencida' : 'N/A'}
              </UI.Badge>
            </li>
          ))}
        </ul>
      </UI.Card>

      <UI.Card>
        <UI.CardHeader title="Datos personales y de seguridad social" icon={Icon.IdCard}/>
        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {[
            ['Documento', `CC 1.082.${(p.id.charCodeAt(1) % 9 + 1)}45.${(p.id.charCodeAt(0) % 9 + 1)}23`],
            ['EPS', p.eps], ['ARL', p.arl],
            ['Contacto emergencia', 'Familiar — +57 320 555 0' + (p.id.charCodeAt(1) % 9) + '00'],
            ['Tipo de sangre', ['O+', 'A+', 'B+', 'AB+', 'O-'][p.id.charCodeAt(1) % 5]],
            ['Antigüedad', `${2 + (p.id.charCodeAt(1) % 6)} años`],
          ].map(([k, v], i) => <div key={i} className="flex justify-between border-b border-neutral-100 pb-1.5"><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>
      </UI.Card>

      <UI.Card>
        <UI.CardHeader title="Asistencia — últimas 4 semanas" icon={Icon.Activity}/>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => {
            const ok = (i + p.id.charCodeAt(1)) % 11 !== 0;
            return <div key={i} className={`aspect-square rounded ${ok ? 'bg-success-500/80' : 'bg-neutral-200'}`}/>;
          })}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-neutral-600">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-success-500"/>Asistió</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-neutral-200"/>Descanso / falta</span>
        </div>
      </UI.Card>
    </div>
  );
};

// ============ Shift schedule (week view) ============
const ShiftSchedule = () => {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  // Each person has a row, each day has assignment
  const seed = (i, j) => (i * 7 + j * 3) % 5;
  const assignment = (i, j) => {
    const s = seed(i, j);
    if (s === 0) return { label: 'Descanso', kind: 'neutral' };
    if (s === 1) return { label: 'Día · PERF-001', kind: 'info' };
    if (s === 2) return { label: 'Noche · PERF-002', kind: 'primary' };
    if (s === 3) return { label: 'Día · CAM-014', kind: 'success' };
    return { label: 'Día · campo', kind: 'warn' };
  };
  return (
    <UI.Card padding={false}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="inline-flex items-center gap-3">
          <UI.IconButton icon={Icon.ChevronLeft} label="Semana anterior"/>
          <div className="text-sm font-display font-semibold">Semana del 11 al 17 de mayo de 2026</div>
          <UI.IconButton icon={Icon.ChevronRight} label="Siguiente"/>
        </div>
        <div className="inline-flex items-center gap-2">
          <UI.Button kind="secondary" size="sm" icon={Icon.Calendar}>Vista mensual</UI.Button>
          <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Asignar turno</UI.Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-neutral-500 border-b border-neutral-200">
              <th className="px-4 py-3 sticky left-0 bg-white">Persona</th>
              {days.map((d, i) => (<th key={d} className="px-3 py-3 text-center">{d}<br/><span className="font-mono text-neutral-700">{11 + i}</span></th>))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {MX.people.slice(0, 8).map((p, i) => (
              <tr key={p.id} className="hover:bg-neutral-50">
                <td className="px-4 py-2 sticky left-0 bg-white">
                  <span className="inline-flex items-center gap-2"><UI.Avatar name={p.name} color={p.color} size={24}/><span className="truncate">{p.name}</span></span>
                </td>
                {days.map((d, j) => {
                  const a = assignment(i, j);
                  return (
                    <td key={j} className="px-2 py-2">
                      <div className={`rounded-md px-2 py-1.5 text-[11px] text-center cursor-grab font-medium ${
                        a.kind === 'neutral' ? 'bg-neutral-100 text-neutral-500' :
                        a.kind === 'info' ? 'bg-sky-50 text-sky-700' :
                        a.kind === 'primary' ? 'bg-primary-50 text-primary-900' :
                        a.kind === 'success' ? 'bg-success-50 text-success-700' :
                        'bg-warning-50 text-warning-700'
                      }`}>{a.label}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-neutral-200 text-[11px] text-neutral-500 inline-flex items-center gap-3">
        <Icon.GripVertical size={12}/> Arrastra las asignaciones para reorganizar turnos
      </div>
    </UI.Card>
  );
};

window.PagePersonnel = PagePersonnel;
