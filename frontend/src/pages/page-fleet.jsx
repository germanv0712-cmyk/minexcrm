// Flota y Equipos
const PageFleet = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const [open, setOpen] = React.useState(null);

  return (
    <>
      <UI.SectionHeader
        title={t('nav_fleet')}
        subtitle="Control de equipos, horómetros y mantenimientos"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_fleet') }]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.Download}>{t('export')}</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus}>Nuevo equipo</UI.Button>
          </>
        }/>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">Equipos operativos</div><div className="font-display font-bold text-2xl mt-1">{MX.equipment.filter((e) => e.status === 'operational').length} <span className="text-sm font-normal text-neutral-500">/ {MX.equipment.length}</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Disponibilidad</div><div className="font-display font-bold text-2xl mt-1 font-mono">87 <span className="text-sm font-normal">%</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Mantenimientos vencidos</div><div className="font-display font-bold text-2xl mt-1 text-danger-700">2</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Consumo combustible (mes)</div><div className="font-display font-bold text-2xl mt-1 font-mono">38.420 <span className="text-sm font-normal">L</span></div></UI.Card>
      </div>

      <UI.Card padding={false}>
        <UI.Table columns={[
          { label: 'Código', render: (e) => <span className="font-mono text-primary-700 font-semibold">{e.code}</span> },
          { label: 'Tipo', render: (e) => <UI.Badge kind="info" dot size="sm">{e.type}</UI.Badge> },
          { label: 'Marca · Modelo', render: (e) => <div><div className="text-sm font-medium">{e.brand}</div><div className="text-[11px] text-neutral-500">{e.model}</div></div> },
          { label: 'Horómetro / Km', right: true, render: (e) => <span className="font-mono text-sm">{MX.formatNum(e.hours)}</span> },
          { label: 'Último mant.', render: (e) => <span className="font-mono text-xs">{MX.formatDate(e.lastMaint, lang)}</span> },
          { label: 'Próximo mant.', render: (e) => {
            const d = new Date(e.nextMaint).getTime();
            const now = Date.now();
            const days = Math.round((d - now) / 86400000);
            const cls = days < 0 ? 'text-danger-700 font-semibold' : days < 7 ? 'text-warning-700 font-semibold' : 'text-neutral-700';
            return <span className={`font-mono text-xs ${cls}`}>{MX.formatDate(e.nextMaint, lang)} {days < 0 ? `(vencido ${-days}d)` : `(${days}d)`}</span>;
          }},
          { label: 'Combustible', right: true, render: (e) => <span className="font-mono text-xs">{e.fuel} L/h</span> },
          { label: 'Proyecto', render: (e) => e.projectId ? MX.projects.find((p) => p.id === e.projectId)?.code : '—' },
          { label: 'Estado', render: (e) => UI.statusBadge(e.status, t) },
        ]} rows={MX.equipment} onRowClick={setOpen}/>
      </UI.Card>

      <UI.Drawer open={!!open} onClose={() => setOpen(null)}
        title={open ? `${open.code} · ${open.brand} ${open.model}` : ''}
        subtitle={open ? `${open.type} · Asignado a ${open.projectId ? MX.projects.find((p) => p.id === open.projectId)?.name : '—'}` : ''}
        width="max-w-2xl">
        {open ? (
          <div className="space-y-4">
            <UI.Card>
              <UI.PlaceholderImg label={`${open.type} · foto`} color="#0A2540" height={180}/>
              <UI.CardHeader title="Ficha técnica" icon={Icon.Truck} className="mt-4"/>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {[
                  ['Código', open.code], ['Tipo', open.type],
                  ['Marca', open.brand], ['Modelo', open.model],
                  ['Horómetro / Km', MX.formatNum(open.hours)],
                  ['Consumo medio', `${open.fuel} L/h`],
                  ['Último mantenimiento', open.lastMaint], ['Próximo mantenimiento', open.nextMaint],
                  ['Estado', UI.statusBadge(open.status, t)],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between border-b border-neutral-100 pb-1.5"><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            </UI.Card>
            <UI.Card>
              <UI.CardHeader title="Historial de mantenimientos" icon={Icon.Wrench}/>
              <UI.Table columns={[
                { label: 'Fecha', render: (r) => <span className="font-mono text-xs">{r.date}</span> },
                { label: 'Tipo', render: (r) => r.kind },
                { label: 'Costo', right: true, render: (r) => <span className="font-mono">${MX.formatNum(r.cost)}</span> },
                { label: 'Técnico', render: (r) => r.tech },
              ]} rows={[
                { id: 1, date: '2026-04-12', kind: 'Mant. preventivo 500h', cost: 4_800_000, tech: 'Atlas Copco Service' },
                { id: 2, date: '2026-02-08', kind: 'Cambio de bomba hidráulica', cost: 12_400_000, tech: 'Taller interno' },
                { id: 3, date: '2025-12-15', kind: 'Mant. preventivo 250h', cost: 2_300_000, tech: 'Atlas Copco Service' },
              ]}/>
            </UI.Card>
            <UI.Card>
              <UI.CardHeader title="Documentos" icon={Icon.FileText}/>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['SOAT 2026.pdf', 'Tarjeta de propiedad.pdf', 'Técnico-mecánica.pdf', 'Póliza todo riesgo.pdf'].map((d) => (
                  <div key={d} className="flex items-center gap-2 border border-neutral-200 rounded-lg px-2.5 py-2 text-xs hover:bg-neutral-50 cursor-pointer">
                    <Icon.FileText size={14} className="text-primary-700"/><span className="truncate flex-1">{d}</span><Icon.Download size={12}/>
                  </div>
                ))}
              </div>
            </UI.Card>
          </div>
        ) : null}
      </UI.Drawer>
    </>
  );
};

window.PageFleet = PageFleet;
