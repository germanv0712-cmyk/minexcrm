// Portal Cliente — vista limitada (simula al cliente externo)
const PagePortal = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  // Pretend the logged-in client is Cerrejón (c1)
  const client = MX.clients[0];
  const clientProjects = MX.projects.filter((p) => p.clientId === client.id);
  const owner = MX.people.find((p) => p.id === 'u1');

  return (
    <>
      <UI.SectionHeader
        title="Portal Cliente"
        subtitle="Vista simplificada · El cliente externo solo ve sus proyectos"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: 'Portal Cliente' }]}/>

      {/* Banner: simulating client login */}
      <UI.Card className="mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="h-14 w-14 rounded-xl text-white font-bold text-xl inline-flex items-center justify-center" style={{ backgroundColor: client.color }}>{client.logo}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs uppercase tracking-widest text-neutral-500">Vista pública del portal · Modo previsualización</div>
            <div className="font-display font-bold text-xl text-neutral-900 mt-0.5">Bienvenido, {client.name}</div>
            <div className="text-sm text-neutral-600 mt-0.5">Aquí ves solo tus proyectos, hitos, documentos y al supervisor que te atiende.</div>
          </div>
          <UI.Badge kind="info" dot>Modo cliente</UI.Badge>
        </div>
      </UI.Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">Tus proyectos activos</div><div className="font-display font-bold text-2xl mt-1">{clientProjects.filter((p) => p.status === 'active').length}</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Avance promedio</div><div className="font-display font-bold text-2xl mt-1 font-mono">{Math.round(clientProjects.reduce((a, p) => a + p.progress, 0) / clientProjects.length)} <span className="text-sm font-normal">%</span></div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Documentos compartidos</div><div className="font-display font-bold text-2xl mt-1">14</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">Días sin accidentes</div><div className="font-display font-bold text-2xl mt-1">312</div></UI.Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <UI.Card>
            <UI.CardHeader title="Avance de tus proyectos" icon={Icon.FolderKanban}/>
            <ul className="mt-4 space-y-3">
              {clientProjects.map((p) => (
                <li key={p.id} className="border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[11px] text-primary-700 font-semibold">{p.code}</div>
                      <div className="font-display font-semibold text-neutral-900">{p.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{p.service} · {p.region}</div>
                    </div>
                    {UI.statusBadge(p.status, t)}
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1"><span className="text-neutral-600">Avance</span><span className="font-mono font-medium">{p.progress}%</span></div>
                    <UI.Progress value={p.progress}/>
                  </div>
                </li>
              ))}
            </ul>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Próximos hitos" icon={Icon.Flag}/>
            <ul className="mt-3 space-y-2">
              {MX.milestones.filter((m) => m.projectId && clientProjects.some((p) => p.id === m.projectId)).map((m) => (
                <li key={m.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <div className="font-medium text-sm">{m.label}</div>
                    <div className="text-[11px] text-neutral-500">{MX.projects.find((p) => p.id === m.projectId)?.name}</div>
                  </div>
                  <div className="text-xs font-mono">{MX.formatDate(m.date, lang)}</div>
                </li>
              ))}
            </ul>
          </UI.Card>
        </div>

        <div className="space-y-4">
          <UI.Card>
            <UI.CardHeader title="Tu supervisor asignado" icon={Icon.Users}/>
            <div className="mt-3 flex items-center gap-3">
              <UI.Avatar name={owner.name} color={owner.color} size={48}/>
              <div>
                <div className="font-semibold">{owner.name}</div>
                <div className="text-xs text-neutral-600">{owner.role}</div>
                <div className="mt-1 text-xs text-neutral-700"><span className="inline-flex items-center gap-1.5"><Icon.Phone size={11}/>{owner.phone}</span></div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <UI.Button kind="secondary" size="sm" icon={Icon.MessageCircle} className="!w-full">WhatsApp</UI.Button>
              <UI.Button kind="secondary" size="sm" icon={Icon.Mail} className="!w-full">Correo</UI.Button>
            </div>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Documentos compartidos" icon={Icon.FileText}/>
            <ul className="mt-3 space-y-2">
              {[
                { n: 'Informe mensual abril 2026.pdf', sz: '3.2 MB' },
                { n: 'Plano topográfico Plataforma A.dwg', sz: '12.3 MB' },
                { n: 'Reporte HSE Q1 2026.pdf', sz: '1.8 MB' },
                { n: 'Resultados laboratorio Cu Au.pdf', sz: '2.4 MB' },
              ].map((d) => (
                <li key={d.n} className="flex items-center justify-between text-sm border border-neutral-200 rounded-lg px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                  <span className="inline-flex items-center gap-2 truncate"><Icon.FileText size={14} className="text-primary-700"/><span className="truncate">{d.n}</span></span>
                  <span className="text-[11px] text-neutral-500 font-mono">{d.sz}</span>
                </li>
              ))}
            </ul>
          </UI.Card>

          <UI.Card className="bg-warning-50 border-warning-500/20">
            <div className="flex items-start gap-3">
              <Icon.CircleAlert size={18} className="text-warning-700 mt-0.5"/>
              <div>
                <div className="font-semibold text-warning-700 text-sm">Lo que el cliente NO ve</div>
                <ul className="mt-1 text-xs text-warning-700/80 space-y-0.5 list-disc list-inside">
                  <li>Datos comerciales (pipeline, márgenes)</li>
                  <li>Proyectos de otros clientes</li>
                  <li>Costos internos y compras</li>
                  <li>Personal y flota no asignados a su contrato</li>
                </ul>
              </div>
            </div>
          </UI.Card>
        </div>
      </div>
    </>
  );
};

window.PagePortal = PagePortal;
