// Reportes y Analytics
const PageReports = () => {
  const { t } = useT();
  const { go } = Layout.useRouter();
  const [builder, setBuilder] = React.useState(false);
  return (
    <>
      <UI.SectionHeader
        title={t('nav_reports')}
        subtitle="Reportes ejecutivos pre-construidos y constructor personalizado"
        breadcrumbs={[{ label: t('appName'), onClick: () => go('/dashboard') }, { label: t('nav_reports') }]}
        actions={
          <>
            <UI.Button kind="secondary" size="sm" icon={Icon.ExternalLink}>Abrir en Power BI</UI.Button>
            <UI.Button kind="primary" icon={Icon.Plus} onClick={() => setBuilder(true)}>Reporte personalizado</UI.Button>
          </>
        }/>

      <UI.Card className="mb-6 bg-gradient-to-r from-primary-900 to-primary-700 text-white border-0">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur"><Icon.PieChart size={28}/></div>
          <div className="flex-1">
            <div className="font-display font-bold text-xl">Power BI Workspace</div>
            <div className="text-sm text-primary-300 mt-1">Tu workspace "MinexCRM · Operaciones" tiene 12 reportes embebidos sincronizados en tiempo real.</div>
          </div>
          <UI.Button kind="secondary" icon={Icon.ExternalLink}>Abrir workspace</UI.Button>
        </div>
      </UI.Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MX.reports.map((r) => {
          const IconCmp = Icon[r.icon] || Icon.FileText;
          return (
            <UI.Card key={r.id} className="cursor-pointer hover:shadow-pop transition">
              <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-lg bg-primary-50 text-primary-700 inline-flex items-center justify-center shrink-0"><IconCmp size={18}/></span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-neutral-900">{r.title}</div>
                  <div className="text-xs text-neutral-600 mt-1 line-clamp-2">{r.desc}</div>
                </div>
              </div>
              <div className="mt-4 h-24 stripe-bg rounded-lg flex items-end justify-around p-2">
                {[40, 75, 55, 90, 65, 80, 45].map((v, i) => (<div key={i} className="w-3 rounded-t" style={{ height: `${v}%`, backgroundColor: '#2563EB', opacity: 0.4 + (i % 3) * 0.2 }}/>))}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Actualizado hoy</span>
                <div className="flex gap-1">
                  <UI.IconButton icon={Icon.Eye} size="sm" label="Ver"/>
                  <UI.IconButton icon={Icon.Download} size="sm" label="PDF"/>
                  <UI.IconButton icon={Icon.Mail} size="sm" label="Enviar"/>
                </div>
              </div>
            </UI.Card>
          );
        })}
      </div>

      <UI.Drawer open={builder} onClose={() => setBuilder(false)} title="Constructor de reportes" subtitle="Crea tu propio reporte con filtros y agrupaciones" width="max-w-3xl"
        footer={<div className="flex justify-end gap-2"><UI.Button kind="ghost" onClick={() => setBuilder(false)}>Cancelar</UI.Button><UI.Button kind="secondary" icon={Icon.Save}>Guardar plantilla</UI.Button><UI.Button kind="primary" icon={Icon.Eye}>Vista previa</UI.Button></div>}>
        <div className="space-y-5">
          <UI.Field label="Nombre del reporte" required><UI.Input defaultValue="Avance mensual — Cerrejón"/></UI.Field>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Fuente de datos</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { v: 'projects', l: 'Proyectos', i: Icon.FolderKanban, on: true },
                { v: 'wells', l: 'Pozos', i: Icon.Drill, on: true },
                { v: 'visits', l: 'Visitas', i: Icon.MapPin },
                { v: 'hse', l: 'HSE', i: Icon.ShieldAlert },
                { v: 'fleet', l: 'Flota', i: Icon.Truck },
                { v: 'pipeline', l: 'Pipeline', i: Icon.TrendingUp },
                { v: 'people', l: 'Personal', i: Icon.Users },
                { v: 'billing', l: 'Facturación', i: Icon.FileSignature },
              ].map((x) => {
                const Iv = x.i;
                return (
                  <label key={x.v} className={`border rounded-lg p-2.5 text-xs font-medium cursor-pointer flex items-center gap-2 ${x.on ? 'border-primary-500 bg-primary-50 text-primary-900' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                    <UI.Checkbox checked={!!x.on}/><Iv size={14}/><span>{x.l}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UI.Field label="Agrupar por">
              <UI.Select defaultValue="cliente"><option value="cliente">Cliente</option><option>Proyecto</option><option>Tipo de servicio</option><option>Mes</option></UI.Select>
            </UI.Field>
            <UI.Field label="Métrica principal">
              <UI.Select defaultValue="meters"><option value="meters">Metros perforados</option><option>Ingresos</option><option>Avance %</option><option>Recuperación</option></UI.Select>
            </UI.Field>
            <UI.Field label="Rango de fechas">
              <UI.Select defaultValue="m"><option value="m">Mes en curso</option><option>Trimestre actual</option><option>Año actual</option><option>Personalizado</option></UI.Select>
            </UI.Field>
            <UI.Field label="Visualización">
              <UI.Select defaultValue="bar"><option value="bar">Barras</option><option>Líneas</option><option>Tabla</option><option>Heatmap</option></UI.Select>
            </UI.Field>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">Filtros</div>
            <div className="flex flex-wrap gap-2">
              {['Cliente: Cerrejón', 'Tipo: Diamantina', 'Región: La Guajira', 'Estado: Activo'].map((f) => (
                <UI.Badge key={f} kind="primary" size="md" className="!px-2 !py-1">{f} <button className="ml-1"><Icon.X size={11}/></button></UI.Badge>
              ))}
              <button className="text-xs text-primary-700 font-medium inline-flex items-center gap-1"><Icon.Plus size={12}/>Añadir filtro</button>
            </div>
          </div>

          <UI.Field label="Compartir / programar envío">
            <div className="flex gap-2 flex-wrap">
              <UI.Checkbox checked label="Enviar por correo"/>
              <UI.Checkbox label="Notificar en WhatsApp"/>
              <UI.Checkbox checked label="Programar mensualmente (día 1)"/>
            </div>
          </UI.Field>
        </div>
      </UI.Drawer>
    </>
  );
};

window.PageReports = PageReports;
