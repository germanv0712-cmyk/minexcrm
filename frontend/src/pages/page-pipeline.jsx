// Pipeline Comercial — Kanban + list
const STAGES = [
  { id: 'prospect',      labelKey: 'stage_prospect',      color: '#94A3B8', bg: 'bg-neutral-100' },
  { id: 'qualification', labelKey: 'stage_qualification', color: '#0EA5E9', bg: 'bg-sky-50' },
  { id: 'proposal',      labelKey: 'stage_proposal',      color: '#2563EB', bg: 'bg-primary-50' },
  { id: 'negotiation',   labelKey: 'stage_negotiation',   color: '#1E3A8A', bg: 'bg-indigo-50' },
  { id: 'close',         labelKey: 'stage_close',         color: '#10B981', bg: 'bg-success-50' },
];

const PagePipeline = () => {
  const { t, lang } = useT();
  const { go } = Layout.useRouter();
  const toast = UI.useToast();
  const [view, setView] = React.useState('kanban');
  const [opps, setOpps] = React.useState(MX.opportunities);
  const [drag, setDrag] = React.useState(null);
  const [openOpp, setOpenOpp] = React.useState(null);
  const [convertOpen, setConvertOpen] = React.useState(false);
  const [convertOpp, setConvertOpp] = React.useState(null);

  const onDrop = (stage) => {
    if (!drag) return;
    const o = opps.find((x) => x.id === drag);
    if (stage === 'close' && o && o.stage !== 'close') {
      setConvertOpp({ ...o, stage });
      setConvertOpen(true);
    } else {
      setOpps(opps.map((x) => x.id === drag ? { ...x, stage } : x));
      toast.push({ kind: 'success', title: 'Oportunidad movida', desc: `${o.name} → ${t('stage_' + stage)}` });
    }
    setDrag(null);
  };

  const totals = STAGES.map((s) => ({ ...s, items: opps.filter((o) => o.stage === s.id), total: opps.filter((o) => o.stage === s.id).reduce((a, b) => a + b.amount, 0) }));
  const grandTotal = opps.reduce((a, b) => a + b.amount, 0);
  const weighted = opps.reduce((a, b) => a + b.amount * (b.prob / 100), 0);
  const stuck = opps.filter((o) => o.lastMove > 15 && o.stage !== 'close').length;

  return (
    <>
      <UI.SectionHeader
        title={t('nav_pipeline')}
        subtitle="Embudo de oportunidades comerciales con clientes mineros"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_pipeline') }]}
        actions={
          <>
            <div className="inline-flex bg-neutral-100 rounded-lg p-0.5">
              {[{ id: 'kanban', icon: Icon.LayoutDashboard, l: 'Kanban' }, { id: 'list', icon: Icon.Hash, l: 'Lista' }].map((i) => (
                <button key={i.id} onClick={() => setView(i.id)} className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium ${view === i.id ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600'}`}>
                  <i.icon size={14}/> <span className="hidden sm:inline">{i.l}</span>
                </button>
              ))}
            </div>
            <UI.Button kind="primary" icon={Icon.Plus}>Nueva oportunidad</UI.Button>
          </>
        }/>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UI.Card><div className="text-xs text-neutral-600">{t('pipeline_total')}</div><div className="font-display font-bold text-2xl mt-1 font-mono">${(grandTotal / 1e9).toFixed(2)}B</div><div className="text-[11px] text-neutral-500 mt-1">{opps.length} oportunidades activas</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">{t('pipeline_weighted')}</div><div className="font-display font-bold text-2xl mt-1 font-mono">${(weighted / 1e9).toFixed(2)}B</div><div className="text-[11px] text-neutral-500 mt-1">Ajustado por probabilidad</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">{t('pipeline_conv')}</div><div className="font-display font-bold text-2xl mt-1">42 %</div><div className="text-[11px] text-success-700 mt-1">↑ 6 puntos vs Q1</div></UI.Card>
        <UI.Card><div className="text-xs text-neutral-600">{t('pipeline_stuck')}</div><div className="font-display font-bold text-2xl mt-1 text-warning-700">{stuck}</div><div className="text-[11px] text-neutral-500 mt-1">requieren acción comercial</div></UI.Card>
      </div>

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2">
          {totals.map((s) => (
            <div key={s.id} className="shrink-0 w-[260px] sm:w-[280px] flex flex-col">
              <div className={`rounded-t-card border border-neutral-200 ${s.bg} px-3 py-2.5 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }}/>
                  <span className="font-semibold text-neutral-900 text-sm">{t(s.labelKey)}</span>
                  <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded-full text-neutral-700">{s.items.length}</span>
                </div>
                <UI.IconButton icon={Icon.MoreHorizontal} size="sm"/>
              </div>
              <div className="px-3 py-1.5 bg-white border-x border-neutral-200 text-[11px] text-neutral-600 flex items-center justify-between">
                <span>Total etapa</span>
                <span className="font-mono font-semibold text-neutral-900">${(s.total / 1e9).toFixed(2)}B</span>
              </div>
              <div onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(s.id)}
                className="flex-1 bg-neutral-50 border border-t-0 border-neutral-200 rounded-b-card p-2 min-h-[360px] flex flex-col gap-2">
                {s.items.map((o) => {
                  const c = MX.clients.find((x) => x.id === o.clientId);
                  const u = MX.people.find((x) => x.id === o.ownerId);
                  return (
                    <div key={o.id}
                      draggable onDragStart={() => setDrag(o.id)}
                      onClick={() => setOpenOpp(o)}
                      className="kan-card bg-white border border-neutral-200 rounded-lg p-3 hover:border-primary-300 hover:shadow-card transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-medium text-neutral-900 leading-snug flex-1">{o.name}</div>
                        <Icon.GripVertical size={14} className="text-neutral-300 shrink-0"/>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-600">
                        <span className="h-5 w-5 rounded text-white text-[9px] font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>
                        {c.name}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <div className="font-display font-bold text-neutral-900 font-mono text-sm">${(o.amount / 1e6).toFixed(0)}M</div>
                          <div className="text-[10px] text-neutral-500">{o.prob}% · {MX.formatDate(o.closeDate, lang)}</div>
                        </div>
                        <UI.Avatar name={u.name} color={u.color} size={24}/>
                      </div>
                      {o.lastMove > 15 && o.stage !== 'close' ? (
                        <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-warning-700 bg-warning-50 px-1.5 py-0.5 rounded">
                          <Icon.Clock size={10}/> Sin movimiento hace {o.lastMove} días
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {s.items.length === 0 ? <div className="text-center text-xs text-neutral-400 py-6">Suelta tarjetas aquí</div> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <UI.Card padding={false}>
          <UI.Table columns={[
            { label: 'Oportunidad', render: (o) => o.name },
            { label: 'Cliente', render: (o) => MX.clients.find((c) => c.id === o.clientId)?.name },
            { label: 'Etapa', render: (o) => <UI.Badge kind="primary" dot>{t('stage_' + o.stage)}</UI.Badge> },
            { label: 'Monto', right: true, render: (o) => <span className="font-mono">${MX.formatNum(o.amount)}</span> },
            { label: 'Prob.', render: (o) => <span className="font-mono">{o.prob}%</span> },
            { label: 'Dueño', render: (o) => { const u = MX.people.find((x) => x.id === o.ownerId); return <span className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={22}/>{u.name}</span>; } },
            { label: 'Cierre', render: (o) => <span className="font-mono text-xs">{MX.formatDate(o.closeDate, lang)}</span> },
            { label: 'Próx. acción', render: (o) => <span className="text-xs">{o.next}</span> },
          ]} rows={opps} onRowClick={setOpenOpp}/>
        </UI.Card>
      )}

      <OpportunityDrawer opp={openOpp} onClose={() => setOpenOpp(null)}/>
      <ConvertToProjectModal open={convertOpen} opp={convertOpp} onClose={() => { setConvertOpen(false); setOpps(opps.map((x) => x.id === convertOpp.id ? { ...x, stage: 'close' } : x)); toast.push({ kind: 'success', title: '¡Oportunidad ganada!', desc: 'Se creó el proyecto PRJ-2026-036 y se asignó el equipo.' }); }}/>
    </>
  );
};

const OpportunityDrawer = ({ opp, onClose }) => {
  const { t, lang } = useT();
  if (!opp) return null;
  const c = MX.clients.find((x) => x.id === opp.clientId);
  return (
    <UI.Drawer open={!!opp} onClose={onClose}
      title={opp.name}
      subtitle={<span className="inline-flex items-center gap-2 text-xs"><span className="h-5 w-5 rounded text-white text-[10px] font-bold inline-flex items-center justify-center" style={{ backgroundColor: c.color }}>{c.logo}</span>{c.name} · NIT {c.nit}</span>}
      width="max-w-3xl"
      footer={<div className="flex justify-end gap-2"><UI.Button kind="secondary" icon={Icon.Mail}>Registrar email</UI.Button><UI.Button kind="primary" icon={Icon.ArrowRight}>Avanzar etapa</UI.Button></div>}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <UI.Card>
            <UI.CardHeader title="Resumen" icon={Icon.Briefcase}/>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ['Monto', <span className="font-mono">${MX.formatNum(opp.amount)} COP</span>],
                ['Probabilidad', <span className="font-mono">{opp.prob}%</span>],
                ['Etapa', <UI.Badge kind="primary" dot>{t('stage_' + opp.stage)}</UI.Badge>],
                ['Cierre estimado', <span className="font-mono">{MX.formatDate(opp.closeDate, lang)}</span>],
                ['Última actividad', <span>{opp.lastMove} días</span>],
                ['Próxima acción', <span>{opp.next}</span>],
              ].map(([k, v], i) => <div key={i} className="flex justify-between border-b border-neutral-100 pb-2"><dt className="text-neutral-500">{k}</dt><dd className="text-neutral-900 font-medium">{v}</dd></div>)}
            </dl>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Servicios cotizados" icon={Icon.FileText}/>
            <UI.Table columns={[
              { label: 'Concepto', render: (r) => r.label },
              { label: 'Cantidad', right: true, render: (r) => r.qty },
              { label: 'Subtotal', right: true, render: (r) => <span className="font-mono">${MX.formatNum(r.sub)}</span> },
            ]} rows={[
              { id: 'l1', label: 'Perforación diamantina HQ', qty: '1.800 m', sub: opp.amount * 0.55 },
              { id: 'l2', label: 'Logging geológico',          qty: '180 días', sub: opp.amount * 0.18 },
              { id: 'l3', label: 'Análisis de laboratorio',    qty: '320 muestras', sub: opp.amount * 0.12 },
              { id: 'l4', label: 'Logística y campamento',     qty: '180 días', sub: opp.amount * 0.15 },
            ]}/>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Historial de interacciones" icon={Icon.History}/>
            <ol className="mt-3 relative border-l-2 border-neutral-200 ml-3 pl-6 space-y-4">
              {[
                { d: 'hoy', t: 'Reunión técnica con equipo del cliente', who: 'Nicolás Pardo', i: Icon.Calendar, c: 'bg-primary-500' },
                { d: 'hace 3 días', t: 'Propuesta v2 enviada', who: 'Camilo Echeverri', i: Icon.Send, c: 'bg-sky-500' },
                { d: 'hace 8 días', t: 'Llamada de descubrimiento — 38 min', who: 'Nicolás Pardo', i: Icon.Phone, c: 'bg-success-500' },
                { d: 'hace 14 días', t: 'RFP recibido por correo', who: 'Cliente', i: Icon.Mail, c: 'bg-neutral-500' },
              ].map((e, i) => {
                const IconCmp = e.i;
                return (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[37px] top-0 h-7 w-7 rounded-full ${e.c} text-white flex items-center justify-center ring-4 ring-white`}><IconCmp size={12}/></span>
                    <div className="flex items-baseline gap-3"><span className="text-xs text-neutral-500">{e.d}</span><span className="font-semibold text-neutral-900 text-sm">{e.t}</span></div>
                    <div className="text-xs text-neutral-600 mt-0.5">{e.who}</div>
                  </li>
                );
              })}
            </ol>
          </UI.Card>
        </div>

        <div className="space-y-4">
          <UI.Card>
            <UI.CardHeader title="Archivos adjuntos" icon={Icon.FileText}/>
            <ul className="mt-3 space-y-2 text-sm">
              {['Propuesta_técnica_v2.pdf', 'RFP_cliente.pdf', 'Hoja_de_vida_empresa.pdf', 'Cronograma_borrador.xlsx'].map((f) => (
                <li key={f} className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                  <span className="inline-flex items-center gap-2 truncate"><Icon.FileText size={14} className="text-primary-700"/>{f}</span>
                  <UI.IconButton icon={Icon.Download} size="sm"/>
                </li>
              ))}
            </ul>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Competidores conocidos" icon={Icon.Flag}/>
            <ul className="mt-3 space-y-2 text-sm">
              {['SGS Colombia', 'Major Drilling LATAM', 'Foraco International'].map((cmp) => (
                <li key={cmp} className="flex items-center justify-between text-neutral-700"><span>{cmp}</span><UI.Badge kind="neutral" size="sm">Sondeando</UI.Badge></li>
              ))}
            </ul>
          </UI.Card>

          <UI.Card>
            <UI.CardHeader title="Próxima acción" icon={Icon.Zap}/>
            <div className="mt-3 rounded-lg bg-primary-50 border border-primary-300/40 p-3">
              <div className="text-sm font-medium text-primary-900">{opp.next}</div>
              <div className="text-xs text-primary-700 mt-1">Asignado a Nicolás Pardo · Vence en 3 días</div>
              <UI.Button kind="primary" size="sm" className="mt-3 w-full" icon={Icon.Check}>Marcar como hecho</UI.Button>
            </div>
          </UI.Card>
        </div>
      </div>
    </UI.Drawer>
  );
};

const ConvertToProjectModal = ({ open, opp, onClose }) => {
  if (!opp) return null;
  const c = MX.clients.find((x) => x.id === opp.clientId);
  return (
    <UI.Modal open={open} onClose={onClose} title="Convertir oportunidad en proyecto" width="max-w-lg"
      footer={<><UI.Button kind="ghost" onClick={onClose}>Cancelar</UI.Button><UI.Button kind="success" icon={Icon.Check} onClick={onClose}>Convertir a proyecto</UI.Button></>}>
      <div className="rounded-lg bg-success-50 border border-success-500/20 p-3 flex items-start gap-3">
        <Icon.CircleCheck size={20} className="text-success-700 mt-0.5"/>
        <div className="text-sm">
          <div className="font-semibold text-success-700">¡Oportunidad ganada!</div>
          <div className="text-success-700/80 mt-0.5">Convierte <b>{opp.name}</b> con <b>{c.name}</b> en un proyecto operativo y asígnale equipo.</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UI.Field label="Código del proyecto" required><UI.Input defaultValue="PRJ-2026-036"/></UI.Field>
        <UI.Field label="Valor contrato (COP)" required><UI.Input defaultValue={MX.formatNum(opp.amount)}/></UI.Field>
        <UI.Field label="Responsable de proyecto" required className="sm:col-span-2">
          <UI.Select defaultValue="u1">{MX.people.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.role}</option>)}</UI.Select>
        </UI.Field>
        <UI.Field label="Inicio" required><UI.Input type="date" defaultValue="2026-06-15"/></UI.Field>
        <UI.Field label="Fin estimado" required><UI.Input type="date" defaultValue="2026-12-15"/></UI.Field>
      </div>
    </UI.Modal>
  );
};

window.PagePipeline = PagePipeline;
