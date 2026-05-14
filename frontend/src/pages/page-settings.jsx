// Configuración (Admin)
const PageSettings = () => {
  const { t } = useT();
  const { go } = Layout.useRouter();
  const [tab, setTab] = React.useState('company');
  const tabs = [
    { id: 'company', label: 'Empresa', icon: Icon.Building2 },
    { id: 'users',   label: 'Usuarios y roles', icon: Icon.Users },
    { id: 'integrations', label: 'Integraciones', icon: Icon.Webhook },
    { id: 'branding', label: 'Personalización', icon: Icon.Sparkles },
    { id: 'docs', label: 'Plantillas de documentos', icon: Icon.FileText },
    { id: 'forms', label: 'Plantillas de formularios', icon: Icon.ClipboardList },
    { id: 'webhooks', label: 'Webhooks', icon: Icon.GitBranch },
    { id: 'audit', label: 'Auditoría', icon: Icon.History },
  ];
  return (
    <>
      <UI.SectionHeader
        title={t('nav_settings')}
        subtitle="Administra tu instancia de MinexCRM"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_settings') }]}/>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <aside className="lg:sticky lg:top-4 self-start">
          <ul className="flex lg:flex-col overflow-x-auto gap-1 bg-white border border-neutral-200 rounded-card p-1 shadow-card">
            {tabs.map((tb) => {
              const IconCmp = tb.icon;
              return (
                <li key={tb.id}>
                  <button onClick={() => setTab(tb.id)}
                    className={`w-full inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap lg:whitespace-normal ${tab === tb.id ? 'bg-primary-50 text-primary-900 font-medium' : 'text-neutral-700 hover:bg-neutral-50'}`}>
                    <IconCmp size={14}/>{tb.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <div>
          {tab === 'company' ? <CompanyTab/>
            : tab === 'users' ? <UsersRolesTab/>
            : tab === 'integrations' ? <IntegrationsTab/>
            : tab === 'branding' ? <BrandingTab/>
            : tab === 'docs' ? <DocTemplatesTab/>
            : tab === 'forms' ? <FormTemplatesTab/>
            : tab === 'webhooks' ? <WebhooksTab/>
            : <AuditTab/>}
        </div>
      </div>
    </>
  );
};

const CompanyTab = () => (
  <UI.Card>
    <UI.CardHeader title="Datos de la empresa" subtitle="Información que aparece en facturas y reportes" icon={Icon.Building2}/>
    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <UI.Field label="Razón social" required><UI.Input defaultValue="GeoAndes Drilling S.A.S."/></UI.Field>
      <UI.Field label="NIT" required><UI.Input className="font-mono" defaultValue="900.123.456-7"/></UI.Field>
      <UI.Field label="Dirección"><UI.Input defaultValue="Cra 11 # 93-46, Bogotá D.C."/></UI.Field>
      <UI.Field label="Teléfono"><UI.Input defaultValue="+57 1 745 0102"/></UI.Field>
      <UI.Field label="Correo corporativo"><UI.Input defaultValue="contacto@geoandes.co"/></UI.Field>
      <UI.Field label="Sitio web"><UI.Input defaultValue="https://geoandes.co"/></UI.Field>
      <UI.Field label="Régimen tributario"><UI.Select defaultValue="ord"><option value="ord">Régimen ordinario</option><option>Régimen especial</option><option>Simple de tributación</option></UI.Select></UI.Field>
      <UI.Field label="Moneda predeterminada"><UI.Select defaultValue="COP"><option>COP</option><option>USD</option><option>EUR</option></UI.Select></UI.Field>
    </div>
    <div className="mt-6 flex justify-end gap-2"><UI.Button kind="ghost">Descartar</UI.Button><UI.Button kind="primary" icon={Icon.Save}>Guardar cambios</UI.Button></div>
  </UI.Card>
);

const UsersRolesTab = () => {
  return (
    <div className="space-y-5">
      <UI.Card>
        <UI.CardHeader title="Usuarios" icon={Icon.Users} right={<UI.Button kind="primary" size="sm" icon={Icon.Plus}>Invitar usuario</UI.Button>}/>
        <UI.Table className="mt-3" columns={[
          { label: 'Usuario', render: (u) => <span className="inline-flex items-center gap-2"><UI.Avatar name={u.name} color={u.color} size={28}/><div><div className="font-medium text-sm">{u.name}</div><div className="text-[11px] text-neutral-500">{u.role}</div></div></span> },
          { label: 'Email', render: (u) => <span className="text-xs font-mono">{u.name.toLowerCase().replace(' ', '.').replace('é','e').replace('í','i').replace('ó','o').replace('á','a').replace('ñ','n') + '@geoandes.co'}</span> },
          { label: 'Rol', render: (u) => <UI.Badge kind="primary" size="sm">{u.role.includes('Geól') ? 'Geólogo' : u.role.includes('HSE') ? 'HSE' : u.role.includes('Operador') ? 'Operaciones' : u.role.includes('comercial') ? 'Comercial' : 'Operaciones'}</UI.Badge> },
          { label: 'MFA', render: () => <UI.Badge kind="success" dot size="sm">Activado</UI.Badge> },
          { label: 'Última conexión', render: () => <span className="text-xs font-mono">hace 2 h</span> },
          { label: '', right: true, render: () => <UI.IconButton icon={Icon.MoreHorizontal}/> },
        ]} rows={MX.people.slice(0, 6)}/>
      </UI.Card>

      <UI.Card>
        <UI.CardHeader title="Matriz de permisos por rol" subtitle="Marca lectura / escritura por módulo" icon={Icon.Lock}/>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-neutral-500">
                <th className="px-3 py-2 text-left sticky left-0 bg-white">Módulo</th>
                {MX.roles.map((r) => <th key={r} className="px-3 py-2 text-center">{r}</th>)}
              </tr>
            </thead>
            <tbody>
              {MX.permModules.map((m) => (
                <tr key={m} className="border-t border-neutral-100">
                  <td className="px-3 py-2 sticky left-0 bg-white font-medium text-neutral-800">{m}</td>
                  {MX.roles.map((r) => {
                    const v = MX.permMatrix[m][r];
                    return (
                      <td key={r} className="px-3 py-2 text-center">
                        <button className={`h-7 px-2 rounded text-[10px] font-bold uppercase ${v === 'rw' ? 'bg-success-50 text-success-700' : v === 'r' ? 'bg-sky-50 text-sky-700' : 'bg-neutral-100 text-neutral-500'}`}>
                          {v === 'rw' ? 'L+E' : v === 'r' ? 'Lectura' : '—'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UI.Card>
    </div>
  );
};

const integrationsList = [
  { id: 'wapp', name: 'WhatsApp Business', desc: 'Envía notificaciones y aprobaciones por WhatsApp.', icon: Icon.MessageCircle, status: 'connected', color: 'bg-success-50 text-success-700', todo: 'WhatsApp Business API · Token + Phone ID' },
  { id: 'gmap', name: 'Google Maps Platform', desc: 'Mapas y geocodificación de visitas y pozos.', icon: Icon.MapPin, status: 'connected', color: 'bg-success-50 text-success-700', todo: 'Maps JavaScript API · Places API · API Key' },
  { id: 's3',   name: 'Amazon S3',           desc: 'Almacenamiento de fotos, videos y datos crudos.', icon: Icon.Cloud, status: 'connected', color: 'bg-success-50 text-success-700', todo: 'Bucket · IAM Role · Presigned URLs' },
  { id: 'pbi',  name: 'Power BI Embed',      desc: 'Dashboards corporativos embebidos.', icon: Icon.PieChart, status: 'connected', color: 'bg-success-50 text-success-700', todo: 'Workspace ID · App Registration' },
  { id: 'smtp', name: 'SMTP / SendGrid',     desc: 'Envío de correos transaccionales.', icon: Icon.Mail, status: 'pending', color: 'bg-warning-50 text-warning-700', todo: 'API Key · Dominio verificado · DKIM' },
  { id: 'sig',  name: 'Firma digital (DocuSign)', desc: 'Firma de contratos y permisos de trabajo.', icon: Icon.PenTool, status: 'disconnected', color: 'bg-neutral-100 text-neutral-700', todo: 'Account ID · Integration Key' },
  { id: 'sap',  name: 'SAP / ERP',           desc: 'Sincronización contable y compras.', icon: Icon.Briefcase, status: 'disconnected', color: 'bg-neutral-100 text-neutral-700', todo: 'OData endpoint · Mapeo de cuentas' },
  { id: 'ms',   name: 'Microsoft 365',       desc: 'SSO + calendario + Teams.', icon: Icon.Box, status: 'connected', color: 'bg-success-50 text-success-700', todo: 'Tenant ID · App registration' },
];

const IntegrationsTab = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {integrationsList.map((it) => {
      const IconCmp = it.icon;
      return (
        <UI.Card key={it.id}>
          <div className="flex items-start gap-3">
            <span className={`h-10 w-10 rounded-lg inline-flex items-center justify-center ${it.color}`}><IconCmp size={18}/></span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display font-semibold text-neutral-900">{it.name}</div>
                <UI.Badge kind={it.status === 'connected' ? 'success' : it.status === 'pending' ? 'warn' : 'neutral'} dot size="sm">
                  {it.status === 'connected' ? 'Conectado' : it.status === 'pending' ? 'Pendiente' : 'Desconectado'}
                </UI.Badge>
              </div>
              <div className="text-xs text-neutral-600 mt-1">{it.desc}</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-2">// TODO: {it.todo}</div>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <UI.Button kind="ghost" size="sm" icon={Icon.Settings}>Configurar</UI.Button>
            {it.status === 'connected' ? <UI.Button kind="secondary" size="sm" icon={Icon.Power}>Desconectar</UI.Button> : <UI.Button kind="primary" size="sm" icon={Icon.Power}>Conectar</UI.Button>}
          </div>
        </UI.Card>
      );
    })}
  </div>
);

const BrandingTab = () => (
  <UI.Card>
    <UI.CardHeader title="Personalización visual" icon={Icon.Sparkles}/>
    <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <UI.Field label="Logo principal"><Dropzone label="Sube tu logo (PNG/SVG, recomendado 400×120 px)"/></UI.Field>
        <UI.Field label="Logo monocromo (para fondos oscuros)" className="mt-4"><Dropzone label="Sube tu logo en blanco"/></UI.Field>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Paleta de marca</div>
        <div className="space-y-3">
          {[
            { l: 'Color primario', v: '#2563EB' },
            { l: 'Color profundo (sidebar)', v: '#0A2540' },
            { l: 'Color de acento', v: '#0EA5E9' },
            { l: 'Color de éxito', v: '#10B981' },
          ].map((c, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border border-neutral-200 rounded-lg px-3 py-2">
              <div className="text-sm">{c.l}</div>
              <div className="inline-flex items-center gap-2">
                <span className="h-6 w-6 rounded-md border border-neutral-200" style={{ backgroundColor: c.v }}/>
                <span className="font-mono text-xs">{c.v}</span>
              </div>
            </div>
          ))}
        </div>
        <UI.Field label="Fuente principal" className="mt-4"><UI.Select defaultValue="Inter"><option>Inter</option><option>Plus Jakarta Sans</option><option>System UI</option></UI.Select></UI.Field>
      </div>
    </div>
  </UI.Card>
);

const DocTemplatesTab = () => (
  <UI.Card padding={false}>
    <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-200">
      <UI.CardHeader title="Plantillas de documentos" subtitle="Contratos, propuestas e informes" icon={Icon.FileText}/>
      <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nueva plantilla</UI.Button>
    </div>
    <UI.Table columns={[
      { label: 'Nombre', render: (r) => r.name },
      { label: 'Tipo', render: (r) => <UI.Badge kind="neutral" size="sm">{r.kind}</UI.Badge> },
      { label: 'Variables', render: (r) => <span className="font-mono text-xs">{r.vars}</span> },
      { label: 'Última edición', render: (r) => r.date },
      { label: '', right: true, render: () => <span className="inline-flex gap-1"><UI.IconButton icon={Icon.Edit} size="sm"/><UI.IconButton icon={Icon.Download} size="sm"/></span> },
    ]} rows={[
      { id: 1, name: 'Propuesta técnica estándar', kind: 'Propuesta', vars: '{{cliente}}, {{servicio}}, {{valor}}', date: '2026-04-22' },
      { id: 2, name: 'Contrato MSA', kind: 'Contrato', vars: '{{cliente}}, {{NIT}}, {{vigencia}}', date: '2026-03-18' },
      { id: 3, name: 'Informe mensual operativo', kind: 'Informe', vars: '{{proyecto}}, {{mes}}, {{metros}}', date: '2026-05-02' },
      { id: 4, name: 'Permiso de trabajo en altura', kind: 'Permiso', vars: '{{ejecutor}}, {{supervisor}}, {{fecha}}', date: '2026-02-12' },
    ]}/>
  </UI.Card>
);

const FormTemplatesTab = () => (
  <UI.Card padding={false}>
    <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-200">
      <UI.CardHeader title="Plantillas de formularios de campo" icon={Icon.ClipboardList}/>
      <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nuevo formulario</UI.Button>
    </div>
    <UI.Table columns={[
      { label: 'Nombre', render: (r) => r.name },
      { label: 'Campos', render: (r) => <span className="font-mono text-xs">{r.fields}</span> },
      { label: 'Uso (último mes)', right: true, render: (r) => <span className="font-mono">{r.uses}</span> },
      { label: 'Estado', render: (r) => UI.statusBadge(r.status, (k) => k) },
    ]} rows={[
      { id: 1, name: 'Inspección diaria de perforadora', fields: 24, uses: 142, status: 'active' },
      { id: 2, name: 'Auditoría EPP', fields: 18, uses: 38, status: 'active' },
      { id: 3, name: 'Pre-tarea (Take 5)', fields: 5, uses: 482, status: 'active' },
      { id: 4, name: 'Reporte de núcleo recuperado', fields: 14, uses: 87, status: 'active' },
      { id: 5, name: 'Cierre de pozo', fields: 32, uses: 4, status: 'draft' },
    ]}/>
  </UI.Card>
);

const WebhooksTab = () => (
  <UI.Card padding={false}>
    <div className="px-5 py-3 flex items-center justify-between border-b border-neutral-200">
      <UI.CardHeader title="Webhooks salientes" subtitle="Notifica sistemas externos cuando ocurren eventos" icon={Icon.Webhook}/>
      <UI.Button kind="primary" size="sm" icon={Icon.Plus}>Nuevo webhook</UI.Button>
    </div>
    <UI.Table columns={[
      { label: 'Evento', render: (r) => <span className="font-mono text-xs text-primary-700">{r.event}</span> },
      { label: 'URL destino', render: (r) => <span className="font-mono text-xs truncate inline-block max-w-xs">{r.url}</span> },
      { label: 'Método', render: (r) => <UI.Badge kind="neutral" size="sm">POST</UI.Badge> },
      { label: 'Últ. entrega', render: (r) => <span className="font-mono text-xs">{r.last}</span> },
      { label: 'Estado', render: (r) => <UI.Badge kind={r.ok ? 'success' : 'danger'} dot size="sm">{r.ok ? '200 OK' : 'Error'}</UI.Badge> },
    ]} rows={[
      { id: 1, event: 'project.created', url: 'https://erp.geoandes.co/hooks/projects', last: '12:42', ok: true },
      { id: 2, event: 'incident.reported', url: 'https://hse.geoandes.co/hooks/incident', last: '10:18', ok: true },
      { id: 3, event: 'permit.signed', url: 'https://docs.geoandes.co/hooks/sign', last: '09:55', ok: false },
      { id: 4, event: 'opportunity.won', url: 'https://crm-erp.bridge.io/win', last: 'ayer', ok: true },
    ]}/>
  </UI.Card>
);

const AuditTab = () => (
  <UI.Card padding={false}>
    <UI.Table columns={[
      { label: 'Cuándo', mono: true, render: (r) => <span className="font-mono text-xs">{r.when}</span> },
      { label: 'Usuario', render: (r) => <span className="inline-flex items-center gap-2"><UI.Avatar name={r.user} color="#1E3A8A" size={22}/>{r.user}</span> },
      { label: 'Acción', render: (r) => <span className="font-mono text-[11px] text-primary-700">{r.action}</span> },
      { label: 'Recurso', render: (r) => <span className="text-xs">{r.resource}</span> },
      { label: 'IP', render: (r) => <span className="font-mono text-[11px] text-neutral-500">{r.ip}</span> },
    ]} rows={[
      { id: 1, when: 'hoy 14:42', user: 'Camilo Echeverri', action: 'project.update', resource: 'PRJ-2026-018', ip: '190.85.42.18' },
      { id: 2, when: 'hoy 13:10', user: 'Ana Vélez', action: 'permit.sign', resource: 'PM-2026-091', ip: '186.30.118.4' },
      { id: 3, when: 'hoy 11:55', user: 'Carlos Restrepo', action: 'core.upload', resource: 'DDH-2026-076 / 110-134m', ip: '152.200.4.18' },
      { id: 4, when: 'ayer 22:08', user: 'Jhon Quintero', action: 'drilling.log.create', resource: 'DDH-2026-074', ip: '152.200.4.22' },
      { id: 5, when: 'ayer 18:01', user: 'Nicolás Pardo', action: 'opportunity.move', resource: 'OP-008 → negotiation', ip: '190.85.42.18' },
    ]}/>
  </UI.Card>
);

window.PageSettings = PageSettings;
