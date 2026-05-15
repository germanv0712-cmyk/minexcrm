// Mock data — datos vacíos para ambiente productivo.
// Solo se mantienen utilidades, tenant y los 6 usuarios de prueba.
const COP = (n) => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n)) + ' COP';
const formatNum = (n) => new Intl.NumberFormat('es-CO').format(n);
const formatDate = (iso, lang = 'es') => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
};
const relTime = (iso, lang = 'es') => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return Math.floor(diff) + 's';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + ' h';
  if (diff < 604800) return Math.floor(diff/86400) + ' d';
  return formatDate(iso, lang);
};

const tenants = [
  { id: 't1', name: 'GeoAndes Drilling S.A.S.', short: 'GA', nit: '900.123.456-7' },
];

// 6 usuarios de prueba (roles: SUPER_ADMIN, ADMIN, MANAGER, FIELD, VIEWER, PORTAL)
const people = [
  { id: 'u1', name: 'Germán Velásquez',  role: 'SUPER_ADMIN', avatar: 'GV', color: '#2563EB', email: 'germanvelasquezz@gmail.com',  certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok' } },
  { id: 'u2', name: 'Admin GeoAndes',    role: 'ADMIN',        avatar: 'AG', color: '#1E3A8A', email: 'admin@geoandes.co',           certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok' } },
  { id: 'u3', name: 'Manager GeoAndes',  role: 'MANAGER',      avatar: 'MG', color: '#047857', email: 'manager@geoandes.co',         certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok' } },
  { id: 'u4', name: 'Campo GeoAndes',    role: 'FIELD',        avatar: 'CG', color: '#B45309', email: 'campo@geoandes.co',           certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok' } },
  { id: 'u5', name: 'Visor GeoAndes',    role: 'VIEWER',       avatar: 'VG', color: '#6D28D9', email: 'visor@geoandes.co',           certs: { alturas: 'na', confined: 'na', firstAid: 'na' } },
  { id: 'u6', name: 'Portal GeoAndes',   role: 'PORTAL',       avatar: 'PG', color: '#0EA5E9', email: 'portal@geoandes.co',          certs: { alturas: 'na', confined: 'na', firstAid: 'na' } },
];

// Datos vacíos — se alimentarán desde la API
const clients       = [];
const projects      = [];
const wells         = [];
const equipment     = [];
const opportunities = [];
const incidents     = [];
const permits       = [];
const activity      = [];
const milestones    = [];
const alerts        = [];
const notifications = [];
const litho         = [];
const drillLog      = [];
const surveys       = [];
const coreBoxes     = [];
const visits        = [];

// Gráficas del dashboard — vacías hasta que haya datos reales
const sparkMeters    = [];
const hseTrend       = [];
const metersByProject = [];

// Plantillas de reportes (no son datos, son configuraciones)
const reports = [
  { id: 'r1', title: 'Avance por proyecto',                     desc: 'Comparativo planeado vs ejecutado de todos los proyectos activos.', icon: 'BarChart3' },
  { id: 'r2', title: 'Productividad por equipo de perforación', desc: 'Metros/turno, eficiencia mecánica y tiempos muertos por rig.', icon: 'Drill' },
  { id: 'r3', title: 'Costo por metro perforado',               desc: 'Análisis de costos directos e indirectos por metro.', icon: 'TrendingUp' },
  { id: 'r4', title: 'Indicadores HSE',                         desc: 'Tasa de incidentes (TRIR), severidad, cumplimiento de inspecciones.', icon: 'ShieldAlert' },
  { id: 'r5', title: 'Facturación por cliente',                 desc: 'Estado de cuenta, hitos facturados y proyección.', icon: 'FileText' },
  { id: 'r6', title: 'Cumplimiento de certificaciones',         desc: 'Matriz de personal vs certificaciones vigentes / vencidas.', icon: 'Award' },
  { id: 'r7', title: 'Mantenimiento de flota',                  desc: 'Horómetros, mantenimientos vencidos, disponibilidad de equipos.', icon: 'Wrench' },
  { id: 'r8', title: 'Resultados de laboratorio',               desc: 'Leyes por pozo, intervalos significativos y mapas de calor.', icon: 'Layers' },
];

const roles = ['Admin', 'Comercial', 'Operaciones', 'Geólogo', 'HSE', 'Cliente'];
const permModules = ['Dashboard','Proyectos','Clientes','Pipeline','Perforaciones','Topografía','Geología','Visitas','HSE','Flota','Personal','Reportes','Portal Cliente','Configuración'];
const permMatrix = permModules.reduce((acc, m) => {
  acc[m] = { Admin: 'rw', Comercial: 'r', Operaciones: 'r', Geólogo: 'r', HSE: 'r', Cliente: '-' };
  return acc;
}, {});
permMatrix['Pipeline'].Comercial = 'rw';
permMatrix['Clientes'].Comercial = 'rw';
permMatrix['Proyectos'].Operaciones = 'rw';
permMatrix['Perforaciones'].Operaciones = 'rw';
permMatrix['Perforaciones'].Geólogo = 'rw';
permMatrix['Topografía'].Operaciones = 'rw';
permMatrix['Geología'].Geólogo = 'rw';
permMatrix['Visitas'].Operaciones = 'rw';
permMatrix['HSE']['HSE'] = 'rw';
permMatrix['Flota'].Operaciones = 'rw';
permMatrix['Personal']['HSE'] = 'rw';
permMatrix['Portal Cliente'].Cliente = 'r';
permMatrix['Reportes'].Comercial = 'r';
permMatrix['Reportes'].Operaciones = 'r';
permMatrix['Reportes'].HSE = 'r';
permMatrix['Reportes'].Geólogo = 'r';

window.MX = {
  COP, formatNum, formatDate, relTime,
  tenants, clients, projects, people, wells, equipment, opportunities,
  incidents, permits, activity, milestones, alerts, notifications,
  litho, drillLog, surveys, coreBoxes, visits,
  sparkMeters, hseTrend, metersByProject, reports,
  roles, permModules, permMatrix,
};
