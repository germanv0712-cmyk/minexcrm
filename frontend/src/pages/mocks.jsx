// Mock data — Colombian mining sector, consistent across all screens.
const COP = (n) => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n)) + ' COP';
const formatNum = (n) => new Intl.NumberFormat('es-CO').format(n);
const formatDate = (iso, lang = 'es') => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'short', day: '2-digit' });
};
const relTime = (iso, lang = 'es') => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const m = lang === 'en'
    ? [[60,'s'],[3600,'min',60],[86400,'h',3600],[604800,'d',86400]]
    : [[60,'s'],[3600,'min',60],[86400,'h',3600],[604800,'d',86400]];
  if (diff < 60) return Math.floor(diff) + 's';
  if (diff < 3600) return Math.floor(diff/60) + ' min';
  if (diff < 86400) return Math.floor(diff/3600) + ' h';
  if (diff < 604800) return Math.floor(diff/86400) + ' d';
  return formatDate(iso, lang);
};

// Companies (tenant): the contractor's own company list
const tenants = [
  { id: 't1', name: 'GeoAndes Drilling S.A.S.', short: 'GA', nit: '900.123.456-7' },
  { id: 't2', name: 'PerfoCol Servicios Mineros', short: 'PC', nit: '901.876.554-2' },
  { id: 't3', name: 'MinTech Field Operations', short: 'MT', nit: '900.554.221-9' },
];

// Mining-company clients
const clients = [
  { id: 'c1', name: 'Cerrejón',            nit: '860.069.804-5', contact: 'Andrea Martínez', email: 'amartinez@cerrejon.com',    phone: '+57 5 350 5555',  region: 'La Guajira', activeProjects: 3, ltv: 5_840_000_000, nextMeeting: '2026-05-20T15:00', tier: 'A', logo: 'CJ', color: '#0A2540' },
  { id: 'c2', name: 'Drummond Ltd.',       nit: '800.021.308-5', contact: 'Ricardo Lugo',    email: 'rlugo@drummondltd.com',     phone: '+57 5 423 9000',  region: 'Cesar',      activeProjects: 2, ltv: 4_120_000_000, nextMeeting: '2026-05-16T10:30', tier: 'A', logo: 'DR', color: '#1E3A8A' },
  { id: 'c3', name: 'Mineros S.A.',        nit: '890.904.713-0', contact: 'Catalina Ríos',   email: 'crios@mineros.com.co',      phone: '+57 4 266 3500',  region: 'Antioquia',  activeProjects: 2, ltv: 3_220_000_000, nextMeeting: '2026-05-18T09:00', tier: 'B', logo: 'MS', color: '#047857' },
  { id: 'c4', name: 'Continental Gold',    nit: '900.331.881-1', contact: 'Sebastián Pulido', email: 's.pulido@continentalgold.co', phone: '+57 4 444 1212', region: 'Antioquia',  activeProjects: 2, ltv: 6_300_000_000, nextMeeting: '2026-05-22T11:00', tier: 'A', logo: 'CG', color: '#B45309' },
  { id: 'c5', name: 'Gran Colombia Gold',  nit: '900.245.601-3', contact: 'María Fernanda Ortiz', email: 'mortiz@gcgold.com',     phone: '+57 4 320 1010',  region: 'Antioquia',  activeProjects: 1, ltv: 1_980_000_000, nextMeeting: '2026-05-28T14:00', tier: 'B', logo: 'GC', color: '#6D28D9' },
  { id: 'c6', name: 'Carbones del Cesar',  nit: '892.300.150-8', contact: 'Hernán Olivares',  email: 'h.olivares@cardelcesar.co', phone: '+57 5 580 4040',  region: 'Cesar',      activeProjects: 1, ltv: 1_120_000_000, nextMeeting: '2026-06-02T16:00', tier: 'C', logo: 'CC', color: '#334155' },
];

// Projects — with real Colombian coordinates
const projects = [
  { id: 'p1', code: 'PRJ-2026-018', name: 'Exploración Cerro Matoso Sur 2026', clientId: 'c1', service: 'Perforación diamantina', progress: 68, start: '2026-02-01', end: '2026-09-30', ownerId: 'u1', status: 'active', region: 'La Guajira',  lat: 11.45, lng: -72.95, contractValue: 2_400_000_000, billed: 1_632_000_000, photo: '#0A2540' },
  { id: 'p2', code: 'PRJ-2026-021', name: 'Levantamiento geofísico La Jagua',  clientId: 'c2', service: 'Magnetometría aérea',   progress: 42, start: '2026-03-10', end: '2026-07-15', ownerId: 'u4', status: 'active', region: 'Cesar',       lat:  9.55, lng: -73.32, contractValue: 1_180_000_000, billed:  495_000_000, photo: '#1E3A8A' },
  { id: 'p3', code: 'PRJ-2026-024', name: 'Sondeos Buriticá Fase III',         clientId: 'c4', service: 'Perforación + Geología', progress: 81, start: '2026-01-15', end: '2026-08-30', ownerId: 'u1', status: 'active', region: 'Antioquia',   lat:  6.72, lng: -75.91, contractValue: 3_120_000_000, billed: 2_527_000_000, photo: '#B45309' },
  { id: 'p4', code: 'PRJ-2026-026', name: 'Mediciones IP Segovia Norte',       clientId: 'c3', service: 'Geofísica IP',          progress: 23, start: '2026-04-05', end: '2026-10-20', ownerId: 'u4', status: 'paused', region: 'Antioquia',   lat:  7.07, lng: -74.70, contractValue:   860_000_000, billed:  198_000_000, photo: '#047857' },
  { id: 'p5', code: 'PRJ-2026-029', name: 'Pozos exploratorios El Bagre',      clientId: 'c3', service: 'Perforación RC',         progress: 55, start: '2026-02-20', end: '2026-08-10', ownerId: 'u3', status: 'active', region: 'Antioquia',   lat:  7.61, lng: -74.81, contractValue: 1_540_000_000, billed:  847_000_000, photo: '#0EA5E9' },
  { id: 'p6', code: 'PRJ-2026-031', name: 'Programa Marmato Profundo',         clientId: 'c5', service: 'Perforación diamantina', progress: 12, start: '2026-04-22', end: '2026-12-15', ownerId: 'u1', status: 'alert',  region: 'Caldas',      lat:  5.47, lng: -75.60, contractValue: 2_980_000_000, billed:  357_000_000, photo: '#6D28D9' },
  { id: 'p7', code: 'PRJ-2026-033', name: 'Cuenca carbonífera Boyacá',         clientId: 'c6', service: 'Topografía + Geología',  progress: 38, start: '2026-03-28', end: '2026-09-05', ownerId: 'u4', status: 'active', region: 'Boyacá',      lat:  5.55, lng: -73.36, contractValue: 1_120_000_000, billed:  425_000_000, photo: '#334155' },
  { id: 'p8', code: 'PRJ-2025-099', name: 'Cierre Cerrejón Tabaco Sur',        clientId: 'c1', service: 'Perforación diamantina', progress: 100, start: '2025-08-01', end: '2026-01-28', ownerId: 'u1', status: 'completed', region: 'La Guajira', lat: 11.18, lng: -72.82, contractValue: 1_840_000_000, billed: 1_840_000_000, photo: '#0A2540' },
];

// People
const people = [
  { id: 'u1', name: 'Carlos Restrepo',  role: 'Geólogo Senior',           shift: 'Día',   project: 'p1', avatar: 'CR', color: '#1E3A8A', certs: { alturas: 'ok', confined: 'ok', firstAid: 'warn' }, eps: 'Sura', arl: 'Positiva', phone: '+57 310 555 0012' },
  { id: 'u2', name: 'Ana Vélez',        role: 'Supervisora HSE',          shift: 'Día',   project: 'p3', avatar: 'AV', color: '#B45309', certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok'   }, eps: 'Sanitas', arl: 'Sura',     phone: '+57 311 887 4421' },
  { id: 'u3', name: 'Jhon Quintero',    role: 'Operador de perforación',  shift: 'Noche', project: 'p5', avatar: 'JQ', color: '#047857', certs: { alturas: 'ok', confined: 'warn', firstAid: 'ok' }, eps: 'Nueva EPS', arl: 'Positiva', phone: '+57 312 220 7755' },
  { id: 'u4', name: 'Luisa Gómez',      role: 'Topógrafa',                shift: 'Día',   project: 'p2', avatar: 'LG', color: '#0EA5E9', certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok'   }, eps: 'Sura', arl: 'Colmena',  phone: '+57 313 990 1188' },
  { id: 'u5', name: 'Mateo Cárdenas',   role: 'Asistente de perforación', shift: 'Noche', project: 'p1', avatar: 'MC', color: '#6D28D9', certs: { alturas: 'warn', confined: 'ok', firstAid: 'expired' }, eps: 'Compensar', arl: 'Sura', phone: '+57 315 442 0099' },
  { id: 'u6', name: 'Yulieth Cabrera',  role: 'Geóloga Junior',           shift: 'Día',   project: 'p3', avatar: 'YC', color: '#0A2540', certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok'   }, eps: 'Sura', arl: 'Positiva', phone: '+57 318 220 1100' },
  { id: 'u7', name: 'Diego Beltrán',    role: 'Conductor 4x4',            shift: 'Día',   project: 'p2', avatar: 'DB', color: '#334155', certs: { alturas: 'expired', confined: 'warn', firstAid: 'ok' }, eps: 'Nueva EPS', arl: 'Positiva', phone: '+57 319 778 5544' },
  { id: 'u8', name: 'Paola Sanín',      role: 'Geofísica',                shift: 'Día',   project: 'p4', avatar: 'PS', color: '#B91C1C', certs: { alturas: 'ok', confined: 'ok', firstAid: 'warn' }, eps: 'Sanitas', arl: 'Sura',     phone: '+57 320 110 8822' },
  { id: 'u9', name: 'Esteban Marín',    role: 'Operador de perforación',  shift: 'Día',   project: 'p3', avatar: 'EM', color: '#047857', certs: { alturas: 'ok', confined: 'ok', firstAid: 'ok'   }, eps: 'Sura', arl: 'Positiva', phone: '+57 321 220 7700' },
  { id: 'u10', name: 'Nicolás Pardo',   role: 'Coordinador comercial',    shift: 'Día',   project: null, avatar: 'NP', color: '#2563EB', certs: { alturas: 'na', confined: 'na', firstAid: 'ok' },   eps: 'Sanitas', arl: 'Sura',     phone: '+57 322 555 1100' },
];

// Wells / drilling
const wells = [
  { id: 'w1', code: 'DDH-2026-074', projectId: 'p1', utm: { e: 1093540, n: 1727854, z: 245 }, depthCur: 217.4, depthTarget: 320, bit: 'Diamantina HQ', opId: 'u3', rigId: 'rig1', status: 'active',  lastUpdate: '2026-05-13T18:42', azimuth: 270, dip: -65, type: 'Diamantina' },
  { id: 'w2', code: 'DDH-2026-075', projectId: 'p1', utm: { e: 1093610, n: 1727930, z: 248 }, depthCur: 142.8, depthTarget: 280, bit: 'Diamantina NQ', opId: 'u3', rigId: 'rig1', status: 'active',  lastUpdate: '2026-05-14T05:10', azimuth: 280, dip: -60, type: 'Diamantina' },
  { id: 'w3', code: 'DDH-2026-076', projectId: 'p3', utm: { e:  843770, n:  742190, z: 1840 }, depthCur: 318.7, depthTarget: 350, bit: 'Diamantina HQ', opId: 'u9', rigId: 'rig2', status: 'active',  lastUpdate: '2026-05-13T22:11', azimuth: 95,  dip: -70, type: 'Diamantina' },
  { id: 'w4', code: 'DDH-2026-077', projectId: 'p3', utm: { e:  843810, n:  742205, z: 1842 }, depthCur: 274.2, depthTarget: 340, bit: 'Diamantina HQ', opId: 'u9', rigId: 'rig2', status: 'active',  lastUpdate: '2026-05-14T02:30', azimuth: 95,  dip: -70, type: 'Diamantina' },
  { id: 'w5', code: 'RC-2026-018',  projectId: 'p5', utm: { e:  834520, n:  840110, z:  120 }, depthCur:  88.0, depthTarget: 200, bit: 'Tricono 5 7/8"', opId: 'u3', rigId: 'rig3', status: 'paused',  lastUpdate: '2026-05-12T14:00', azimuth: 0,   dip: -90, type: 'Aire reverso (RC)' },
  { id: 'w6', code: 'DDH-2026-078', projectId: 'p6', utm: { e:  836210, n:  605110, z: 1620 }, depthCur:  42.5, depthTarget: 400, bit: 'Diamantina HQ', opId: 'u3', rigId: 'rig4', status: 'alert',   lastUpdate: '2026-05-13T08:00', azimuth: 180, dip: -75, type: 'Diamantina' },
  { id: 'w7', code: 'DDH-2026-073', projectId: 'p1', utm: { e: 1093488, n: 1727770, z: 244 }, depthCur: 320.0, depthTarget: 320, bit: 'Diamantina HQ', opId: 'u3', rigId: 'rig1', status: 'completed', lastUpdate: '2026-05-09T17:40', azimuth: 270, dip: -65, type: 'Diamantina' },
  { id: 'w8', code: 'RC-2026-019',  projectId: 'p5', utm: { e:  834570, n:  840150, z:  118 }, depthCur: 132.0, depthTarget: 220, bit: 'Tricono 5 7/8"', opId: 'u3', rigId: 'rig3', status: 'active',  lastUpdate: '2026-05-14T06:00', azimuth: 0,   dip: -90, type: 'Aire reverso (RC)' },
];

// Equipment / fleet
const equipment = [
  { id: 'rig1', code: 'PERF-001', type: 'Perforadora',  brand: 'Atlas Copco Christensen', model: 'CT20', hours: 4280, lastMaint: '2026-04-12', nextMaint: '2026-05-18', status: 'operational', projectId: 'p1', fuel: 4.6 },
  { id: 'rig2', code: 'PERF-002', type: 'Perforadora',  brand: 'Boart Longyear', model: 'LF90', hours: 5612, lastMaint: '2026-03-30', nextMaint: '2026-05-15', status: 'maintenance', projectId: 'p3', fuel: 5.1 },
  { id: 'rig3', code: 'PERF-003', type: 'Perforadora',  brand: 'Schramm', model: 'T685WS', hours: 3120, lastMaint: '2026-04-25', nextMaint: '2026-06-05', status: 'operational', projectId: 'p5', fuel: 6.8 },
  { id: 'rig4', code: 'PERF-004', type: 'Perforadora',  brand: 'Sandvik', model: 'DE712', hours: 1880, lastMaint: '2026-04-30', nextMaint: '2026-06-12', status: 'operational', projectId: 'p6', fuel: 4.9 },
  { id: 'v1', code: 'CAM-014', type: 'Camioneta', brand: 'Toyota', model: 'Hilux 2024', hours: 38420, lastMaint: '2026-04-02', nextMaint: '2026-05-22', status: 'operational', projectId: 'p1', fuel: 11.3 },
  { id: 'v2', code: 'CAM-015', type: 'Camioneta', brand: 'Toyota', model: 'Hilux 2024', hours: 22115, lastMaint: '2026-03-15', nextMaint: '2026-05-10', status: 'maintenance', projectId: 'p3', fuel: 10.8 },
  { id: 'v3', code: 'CAM-016', type: 'Camioneta', brand: 'Nissan', model: 'Frontier', hours: 41280, lastMaint: '2026-04-18', nextMaint: '2026-06-01', status: 'operational', projectId: 'p2', fuel: 12.4 },
  { id: 'v4', code: 'GEN-003', type: 'Generador', brand: 'Cummins', model: 'C150D5', hours: 2480, lastMaint: '2026-02-12', nextMaint: '2026-04-30', status: 'out', projectId: 'p4', fuel: 14.0 },
  { id: 'v5', code: 'RET-002', type: 'Retroexcavadora', brand: 'Caterpillar', model: '320D', hours: 6890, lastMaint: '2026-04-10', nextMaint: '2026-06-08', status: 'operational', projectId: 'p3', fuel: 18.2 },
];

// Pipeline opportunities
const opportunities = [
  { id: 'op1', name: 'Programa exploración Cesar Norte', clientId: 'c2', amount: 1_850_000_000, prob: 30, stage: 'prospect',     ownerId: 'u10', closeDate: '2026-08-15', lastMove: 5,  next: 'Llamada de descubrimiento' },
  { id: 'op2', name: 'Sondeos geotécnicos Drummond',     clientId: 'c2', amount:   720_000_000, prob: 25, stage: 'prospect',     ownerId: 'u10', closeDate: '2026-09-01', lastMove: 18, next: 'Enviar one-pager' },
  { id: 'op3', name: 'Magnetometría Cerrejón Norte',     clientId: 'c1', amount: 1_120_000_000, prob: 50, stage: 'qualification', ownerId: 'u10', closeDate: '2026-07-25', lastMove: 7,  next: 'Visita técnica' },
  { id: 'op4', name: 'Topografía minera Mineros S.A.',   clientId: 'c3', amount:   430_000_000, prob: 55, stage: 'qualification', ownerId: 'u10', closeDate: '2026-07-12', lastMove: 11, next: 'Confirmar alcance' },
  { id: 'op5', name: 'Renovación contrato Buriticá',     clientId: 'c4', amount: 3_650_000_000, prob: 70, stage: 'proposal',     ownerId: 'u10', closeDate: '2026-06-30', lastMove: 3,  next: 'Reunión seguimiento' },
  { id: 'op6', name: 'Pozos exploratorios Marmato Sur',  clientId: 'c5', amount: 2_120_000_000, prob: 60, stage: 'proposal',     ownerId: 'u10', closeDate: '2026-07-05', lastMove: 22, next: 'Aclarar precios' },
  { id: 'op7', name: 'Geofísica Carbones del Cesar',     clientId: 'c6', amount:   880_000_000, prob: 80, stage: 'negotiation',  ownerId: 'u10', closeDate: '2026-06-10', lastMove: 2,  next: 'Negociar plazos' },
  { id: 'op8', name: 'Servicios integrales Continental', clientId: 'c4', amount: 4_980_000_000, prob: 85, stage: 'negotiation',  ownerId: 'u10', closeDate: '2026-06-20', lastMove: 4,  next: 'Firma directiva' },
  { id: 'op9', name: 'Diamantina Cerrejón Ext.',         clientId: 'c1', amount: 2_640_000_000, prob: 95, stage: 'close',        ownerId: 'u10', closeDate: '2026-05-28', lastMove: 1,  next: 'Firma de contrato' },
  { id: 'op10', name: 'Programa anual Mineros S.A.',     clientId: 'c3', amount: 1_780_000_000, prob: 100, stage: 'close',       ownerId: 'u10', closeDate: '2026-05-22', lastMove: 0,  next: 'Cerrado/Ganado' },
];

// HSE incidents
const incidents = [
  { id: 'i1', date: '2026-05-12', type: 'leve',          projectId: 'p3', desc: 'Resbalón menor en plataforma de perforación, sin lesión incapacitante.', status: 'investigation', actions: 'Aplicar antideslizante adicional, capacitación express.' },
  { id: 'i2', date: '2026-05-08', type: 'cuasi',         projectId: 'p1', desc: 'Caída de herramienta desde 1.5m, sin personal en zona de impacto.', status: 'closed', actions: 'Reforzar uso de eslingas para herramientas.' },
  { id: 'i3', date: '2026-04-29', type: 'leve',          projectId: 'p5', desc: 'Esquirla en ojo durante mantenimiento, evaluado por médico de campo.', status: 'closed', actions: 'Reemplazo de gafas, revisión de EPP.' },
  { id: 'i4', date: '2026-04-15', type: 'cuasi',         projectId: 'p2', desc: 'Vehículo bloqueó vía de emergencia por 6 min.', status: 'closed', actions: 'Señalización mejorada, briefing diario.' },
  { id: 'i5', date: '2026-05-14', type: 'cuasi',         projectId: 'p6', desc: 'Posible inestabilidad de talud detectada por geólogo, área aislada.', status: 'open', actions: 'Inspección geotécnica programada.' },
];

// Work permits
const permits = [
  { id: 'pm1', type: 'Trabajo en altura', projectId: 'p1', requestedBy: 'u5', validFrom: '2026-05-14T06:00', validTo: '2026-05-14T18:00', status: 'approved', signers: ['Ana Vélez', 'Carlos Restrepo'] },
  { id: 'pm2', type: 'Espacios confinados', projectId: 'p3', requestedBy: 'u9', validFrom: '2026-05-14T08:00', validTo: '2026-05-14T16:00', status: 'pending',  signers: ['Ana Vélez'] },
  { id: 'pm3', type: 'Trabajo en caliente', projectId: 'p1', requestedBy: 'u3', validFrom: '2026-05-13T07:00', validTo: '2026-05-13T15:00', status: 'approved', signers: ['Ana Vélez', 'Carlos Restrepo'] },
  { id: 'pm4', type: 'Izaje de cargas',     projectId: 'p5', requestedBy: 'u3', validFrom: '2026-05-15T06:00', validTo: '2026-05-15T17:00', status: 'pending',  signers: [] },
  { id: 'pm5', type: 'Trabajo en altura',   projectId: 'p6', requestedBy: 'u5', validFrom: '2026-05-12T06:00', validTo: '2026-05-12T18:00', status: 'rejected', signers: ['Ana Vélez'] },
];

// Activity feed
const activity = [
  { id: 'a1', userId: 'u1', action: 'subió núcleos del pozo', target: 'DDH-2026-076', meters: '128–134 m', when: new Date(Date.now() - 14 * 60 * 1000).toISOString(), kind: 'core' },
  { id: 'a2', userId: 'u3', action: 'registró', target: 'DDH-2026-074', meters: '24,3 m perforados', when: new Date(Date.now() - 42 * 60 * 1000).toISOString(), kind: 'log' },
  { id: 'a3', userId: 'u2', action: 'reportó incidente leve en', target: 'Buriticá Fase III', meters: '', when: new Date(Date.now() - 95 * 60 * 1000).toISOString(), kind: 'hse' },
  { id: 'a4', userId: 'u4', action: 'subió levantamiento topográfico de', target: 'Cuenca carbonífera Boyacá', meters: '12,8 ha', when: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), kind: 'topo' },
  { id: 'a5', userId: 'u9', action: 'registró', target: 'DDH-2026-077', meters: '18,7 m perforados', when: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), kind: 'log' },
  { id: 'a6', userId: 'u6', action: 'añadió descripción litológica al pozo', target: 'DDH-2026-076', meters: '110–134 m', when: new Date(Date.now() - 6.5 * 60 * 60 * 1000).toISOString(), kind: 'core' },
  { id: 'a7', userId: 'u8', action: 'completó visita HSE en', target: 'Segovia Norte', meters: '', when: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), kind: 'visit' },
];

// Milestones
const milestones = [
  { id: 'ml1', label: 'Entrega informe mensual Cerrejón', date: '2026-05-20', priority: 'high', projectId: 'p1' },
  { id: 'ml2', label: 'Fin de fase Buriticá III',          date: '2026-05-31', priority: 'med',  projectId: 'p3' },
  { id: 'ml3', label: 'Auditoría ISO Drummond',            date: '2026-06-04', priority: 'high', projectId: 'p2' },
  { id: 'ml4', label: 'Renovación contrato Mineros S.A.',  date: '2026-06-10', priority: 'med',  projectId: 'p4' },
  { id: 'ml5', label: 'Cierre comercial Cerrejón Ext.',    date: '2026-05-28', priority: 'high', projectId: null },
];

// Critical alerts
const alerts = [
  { id: 'al1', kind: 'maintenance', label: 'Generador GEN-003 — mantenimiento vencido (14 días)', severity: 'danger' },
  { id: 'al2', kind: 'cert', label: 'Mateo Cárdenas — certificación de alturas vence en 9 días', severity: 'warn' },
  { id: 'al3', kind: 'permit', label: '2 permisos de trabajo pendientes de aprobación HSE', severity: 'warn' },
  { id: 'al4', kind: 'maintenance', label: 'CAM-015 — entró a mantenimiento programado', severity: 'info' },
  { id: 'al5', kind: 'cert', label: 'Diego Beltrán — certificación de alturas vencida', severity: 'danger' },
];

// Notifications
const notifications = [
  { id: 'n1', icon: 'ShieldAlert', title: 'Nuevo incidente reportado', desc: 'Inestabilidad de talud — Programa Marmato Profundo', when: '12 min', severity: 'danger' },
  { id: 'n2', icon: 'FileSignature', title: 'Permiso pendiente de firma', desc: 'Espacios confinados — Buriticá III', when: '1 h', severity: 'warn' },
  { id: 'n3', icon: 'MessageCircle', title: 'WhatsApp de Drummond', desc: 'Andrea Martínez: "¿Podemos mover la reunión?"', when: '2 h', severity: 'info' },
  { id: 'n4', icon: 'TrendingUp', title: 'Oportunidad movida a Cierre', desc: 'Diamantina Cerrejón Ext. — $2.640M', when: '3 h', severity: 'success' },
];

// Lithology layers for a well (example)
const litho = [
  { from: 0,    to: 12.4, name: 'Suelo orgánico',    color: '#8B5A2B', desc: 'Cobertura vegetal, arcillas y limos pardos.' },
  { from: 12.4, to: 47.8, name: 'Andesita alterada', color: '#A78BFA', desc: 'Color verde grisáceo, alteración propilítica moderada.' },
  { from: 47.8, to: 96.2, name: 'Andesita fresca',   color: '#6D28D9', desc: 'Roca masiva, vetillas finas de pirita.' },
  { from: 96.2, to: 152.1, name: 'Pórfido cuarzofeldespático', color: '#EAB308', desc: 'Diseminado fino de pirita y calcopirita. Vetillas tipo B.' },
  { from: 152.1, to: 198.4, name: 'Skarn de granate', color: '#B45309', desc: 'Granate masivo verde-marrón, vetillas de magnetita.' },
  { from: 198.4, to: 247.0, name: 'Mármol',          color: '#E5E7EB', desc: 'Mármol blanco a gris claro, recristalizado.' },
  { from: 247.0, to: 318.7, name: 'Pórfido mineralizado', color: '#EF4444', desc: 'Diseminado de calcopirita y bornita. Ley estimada Cu 0.8–1.2%.' },
];

// Drilling log entries (shift records)
const drillLog = [
  { date: '2026-05-14', shift: 'Día',   from: 195.2, to: 217.4, meters: 22.2, recovery: 96, geologist: 'Carlos Restrepo', notes: 'Pórfido mineralizado con vetillas B abundantes. Sin pérdidas.' },
  { date: '2026-05-13', shift: 'Noche', from: 178.6, to: 195.2, meters: 16.6, recovery: 92, geologist: 'Yulieth Cabrera', notes: 'Cambio de skarn a pórfido mineralizado en 188 m.' },
  { date: '2026-05-13', shift: 'Día',   from: 156.0, to: 178.6, meters: 22.6, recovery: 88, geologist: 'Carlos Restrepo', notes: 'Skarn de granate, pérdidas de fluido moderadas 158–162 m.' },
  { date: '2026-05-12', shift: 'Noche', from: 138.4, to: 156.0, meters: 17.6, recovery: 94, geologist: 'Yulieth Cabrera', notes: 'Tránsito a skarn.' },
  { date: '2026-05-12', shift: 'Día',   from: 118.0, to: 138.4, meters: 20.4, recovery: 90, geologist: 'Carlos Restrepo', notes: 'Pórfido feldespático, vetillas tipo A.' },
  { date: '2026-05-11', shift: 'Noche', from: 98.6,  to: 118.0, meters: 19.4, recovery: 95, geologist: 'Yulieth Cabrera', notes: 'Sin novedades operativas.' },
];

// Surveys (topo / geofísica)
const surveys = [
  { id: 's1', code: 'TOP-2026-022', type: 'Topográfico',    projectId: 'p1', area: '38,4 ha',  device: 'GNSS RTK Trimble R12', responsibleId: 'u4', date: '2026-05-10', status: 'completed' },
  { id: 's2', code: 'MAG-2026-007', type: 'Magnetometría',  projectId: 'p2', area: '212 km lin.', device: 'Geometrics G-859', responsibleId: 'u4', date: '2026-05-08', status: 'inprogress' },
  { id: 's3', code: 'GRV-2026-003', type: 'Gravimetría',    projectId: 'p7', area: '54 km lin.', device: 'Scintrex CG-6', responsibleId: 'u8', date: '2026-05-05', status: 'inprogress' },
  { id: 's4', code: 'SIS-2026-002', type: 'Sísmica',        projectId: 'p4', area: '18 km lin.', device: 'Geode 24', responsibleId: 'u8', date: '2026-05-02', status: 'paused' },
  { id: 's5', code: 'IP-2026-014',  type: 'Inducida (IP)',  projectId: 'p4', area: '24 km lin.', device: 'GDD GRx8mini', responsibleId: 'u8', date: '2026-04-28', status: 'completed' },
];

// Core boxes (geology)
const coreBoxes = [
  { id: 'cb1', wellId: 'w3', from: 110, to: 134, photoColor: '#B45309', photographer: 'u6', date: '2026-05-13', lab: 'Pendiente' },
  { id: 'cb2', wellId: 'w3', from: 86,  to: 110, photoColor: '#A78BFA', photographer: 'u6', date: '2026-05-12', lab: 'En análisis' },
  { id: 'cb3', wellId: 'w1', from: 96,  to: 152, photoColor: '#EAB308', photographer: 'u1', date: '2026-05-12', lab: 'Recibido' },
  { id: 'cb4', wellId: 'w1', from: 152, to: 198, photoColor: '#B45309', photographer: 'u1', date: '2026-05-11', lab: 'Pendiente' },
  { id: 'cb5', wellId: 'w1', from: 198, to: 247, photoColor: '#E5E7EB', photographer: 'u1', date: '2026-05-10', lab: 'Recibido' },
  { id: 'cb6', wellId: 'w1', from: 247, to: 320, photoColor: '#EF4444', photographer: 'u1', date: '2026-05-09', lab: 'Cu 1,08%' },
  { id: 'cb7', wellId: 'w4', from: 60,  to: 84,  photoColor: '#6D28D9', photographer: 'u6', date: '2026-05-13', lab: 'En análisis' },
  { id: 'cb8', wellId: 'w4', from: 84,  to: 110, photoColor: '#0EA5E9', photographer: 'u6', date: '2026-05-12', lab: 'Pendiente' },
  { id: 'cb9', wellId: 'w2', from: 100, to: 142, photoColor: '#EAB308', photographer: 'u1', date: '2026-05-13', lab: 'Pendiente' },
];

// Field visits
const visits = [
  { id: 'vi1', projectId: 'p1', type: 'Supervisión',    userId: 'u2', date: '2026-05-14T07:32', lat: 11.45, lng: -72.95, desc: 'Verificación de plataforma de perforación DDH-2026-074. Buenas prácticas observadas.', photos: 3, color: '#0A2540' },
  { id: 'vi2', projectId: 'p3', type: 'Auditoría HSE',  userId: 'u2', date: '2026-05-13T14:20', lat:  6.72, lng: -75.91, desc: 'Auditoría EPP completa, hallazgos menores en señalización.', photos: 5, color: '#B45309' },
  { id: 'vi3', projectId: 'p5', type: 'Inspección',     userId: 'u3', date: '2026-05-13T09:10', lat:  7.61, lng: -74.81, desc: 'Verificación de RC-2026-019 al inicio del turno.', photos: 2, color: '#047857' },
  { id: 'vi4', projectId: 'p2', type: 'Entrega',        userId: 'u4', date: '2026-05-12T16:45', lat:  9.55, lng: -73.32, desc: 'Entrega de datos crudos de magnetometría, día 18 de 30.', photos: 4, color: '#1E3A8A' },
  { id: 'vi5', projectId: 'p1', type: 'Mantenimiento',  userId: 'u5', date: '2026-05-12T08:00', lat: 11.45, lng: -72.95, desc: 'Cambio de aceite y filtros de PERF-001.', photos: 6, color: '#0A2540' },
];

// Chart data for dashboard
const sparkMeters = [86, 92, 105, 98, 124, 130, 142, 138, 156, 162, 174, 188].map((v, i) => ({ x: i, v }));
const hseTrend = [
  { m: 'Jun', v: 92 }, { m: 'Jul', v: 94 }, { m: 'Ago', v: 91 }, { m: 'Sep', v: 95 },
  { m: 'Oct', v: 96 }, { m: 'Nov', v: 93 }, { m: 'Dic', v: 97 }, { m: 'Ene', v: 96 },
  { m: 'Feb', v: 98 }, { m: 'Mar', v: 97 }, { m: 'Abr', v: 98 }, { m: 'May', v: 99 },
];

const metersByProject = [
  { name: 'Buriticá III',   meters: 1820 },
  { name: 'Cerrejón Sur',   meters: 1640 },
  { name: 'El Bagre',       meters:  920 },
  { name: 'Marmato',        meters:  610 },
  { name: 'Cesar Norte',    meters:  380 },
];

// Reports gallery
const reports = [
  { id: 'r1', title: 'Avance por proyecto',                  desc: 'Comparativo planeado vs ejecutado de todos los proyectos activos.', icon: 'BarChart3' },
  { id: 'r2', title: 'Productividad por equipo de perforación', desc: 'Metros/turno, eficiencia mecánica y tiempos muertos por rig.', icon: 'Drill' },
  { id: 'r3', title: 'Costo por metro perforado',            desc: 'Análisis de costos directos e indirectos por metro.', icon: 'TrendingUp' },
  { id: 'r4', title: 'Indicadores HSE',                      desc: 'Tasa de incidentes (TRIR), severidad, cumplimiento de inspecciones.', icon: 'ShieldAlert' },
  { id: 'r5', title: 'Facturación por cliente',              desc: 'Estado de cuenta, hitos facturados y proyección.', icon: 'FileText' },
  { id: 'r6', title: 'Cumplimiento de certificaciones',      desc: 'Matriz de personal vs certificaciones vigentes / vencidas.', icon: 'Award' },
  { id: 'r7', title: 'Mantenimiento de flota',               desc: 'Horómetros, mantenimientos vencidos, disponibilidad de equipos.', icon: 'Wrench' },
  { id: 'r8', title: 'Resultados de laboratorio',            desc: 'Leyes por pozo, intervalos significativos y mapas de calor.', icon: 'Layers' },
];

// Permissions matrix (for settings)
const roles = ['Admin', 'Comercial', 'Operaciones', 'Geólogo', 'HSE', 'Cliente'];
const permModules = ['Dashboard','Proyectos','Clientes','Pipeline','Perforaciones','Topografía','Geología','Visitas','HSE','Flota','Personal','Reportes','Portal Cliente','Configuración'];
// returns set of perms per [module][role] = 'rw'|'r'|'-'
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
