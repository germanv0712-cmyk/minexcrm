const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Seeding MinexCRM database…');

  // ── Tenants ────────────────────────────────────────────────────────────────
  const t1 = await prisma.tenant.upsert({
    where:  { nit: '900.123.456-7' },
    update: {},
    create: { name: 'GeoAndes Drilling S.A.S.', short: 'GA', nit: '900.123.456-7', plan: 'ENTERPRISE' },
  });

  await prisma.tenant.upsert({
    where:  { nit: '901.876.554-2' },
    update: {},
    create: { name: 'PerfoCol Servicios Mineros', short: 'PC', nit: '901.876.554-2', plan: 'PROFESSIONAL' },
  });

  await prisma.tenant.upsert({
    where:  { nit: '900.554.221-9' },
    update: {},
    create: { name: 'MinTech Field Operations', short: 'MT', nit: '900.554.221-9', plan: 'STARTER' },
  });

  // ── Users (GeoAndes tenant) ────────────────────────────────────────────────
  const hash = (p) => bcrypt.hash(p, 12);

  const userMap = {};

  const usersData = [
    { email: 'admin@geoandes.co',      name: 'Admin GeoAndes',       role: 'ADMIN',    position: 'Administrador',           avatar: 'AG', color: '#2563EB', phone: '+57 300 000 0001', eps: 'Sura',      arl: 'Positiva',  shift: 'Día' },
    { email: 'crestrepo@geoandes.co',  name: 'Carlos Restrepo',      role: 'MANAGER',  position: 'Geólogo Senior',          avatar: 'CR', color: '#1E3A8A', phone: '+57 310 555 0012', eps: 'Sura',      arl: 'Positiva',  shift: 'Día' },
    { email: 'avelez@geoandes.co',     name: 'Ana Vélez',            role: 'FIELD',    position: 'Supervisora HSE',         avatar: 'AV', color: '#B45309', phone: '+57 311 887 4421', eps: 'Sanitas',   arl: 'Sura',      shift: 'Día' },
    { email: 'jquintero@geoandes.co',  name: 'Jhon Quintero',        role: 'FIELD',    position: 'Operador de perforación', avatar: 'JQ', color: '#047857', phone: '+57 312 220 7755', eps: 'Nueva EPS', arl: 'Positiva',  shift: 'Noche' },
    { email: 'lgomez@geoandes.co',     name: 'Luisa Gómez',          role: 'FIELD',    position: 'Topógrafa',               avatar: 'LG', color: '#0EA5E9', phone: '+57 313 990 1188', eps: 'Sura',      arl: 'Colmena',  shift: 'Día' },
    { email: 'mcardenas@geoandes.co',  name: 'Mateo Cárdenas',       role: 'FIELD',    position: 'Asistente perforación',   avatar: 'MC', color: '#6D28D9', phone: '+57 315 442 0099', eps: 'Compensar', arl: 'Sura',      shift: 'Noche' },
    { email: 'ycabrera@geoandes.co',   name: 'Yulieth Cabrera',      role: 'FIELD',    position: 'Geóloga Junior',          avatar: 'YC', color: '#0A2540', phone: '+57 318 220 1100', eps: 'Sura',      arl: 'Positiva',  shift: 'Día' },
    { email: 'dbeltran@geoandes.co',   name: 'Diego Beltrán',        role: 'FIELD',    position: 'Conductor 4×4',           avatar: 'DB', color: '#334155', phone: '+57 319 778 5544', eps: 'Nueva EPS', arl: 'Positiva',  shift: 'Día' },
    { email: 'psanin@geoandes.co',     name: 'Paola Sanín',          role: 'FIELD',    position: 'Geofísica',               avatar: 'PS', color: '#B91C1C', phone: '+57 320 110 8822', eps: 'Sanitas',   arl: 'Sura',      shift: 'Día' },
    { email: 'emarin@geoandes.co',     name: 'Esteban Marín',        role: 'FIELD',    position: 'Operador de perforación', avatar: 'EM', color: '#047857', phone: '+57 321 220 7700', eps: 'Sura',      arl: 'Positiva',  shift: 'Día' },
    { email: 'npardo@geoandes.co',     name: 'Nicolás Pardo',        role: 'MANAGER',  position: 'Coordinador comercial',   avatar: 'NP', color: '#2563EB', phone: '+57 322 555 1100', eps: 'Sanitas',   arl: 'Sura',      shift: 'Día' },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where:  { tenantId_email: { tenantId: t1.id, email: u.email } },
      update: {},
      create: {
        tenantId: t1.id,
        email:        u.email,
        passwordHash: await hash('Minex2026!'),
        name:         u.name,
        role:         u.role,
        position:     u.position,
        avatar:       u.avatar,
        color:        u.color,
        phone:        u.phone,
        eps:          u.eps,
        arl:          u.arl,
        shift:        u.shift,
      },
    });
    userMap[u.avatar] = user.id;
  }

  // ── Clients ────────────────────────────────────────────────────────────────
  const clientData = [
    { name: 'Cerrejón',           nit: '860.069.804-5', contact: 'Andrea Martínez', email: 'amartinez@cerrejon.com',       phone: '+57 5 350 5555', region: 'La Guajira', tier: 'A', logo: 'CJ', color: '#0A2540', ltv: 5_840_000_000 },
    { name: 'Drummond Ltd.',      nit: '800.021.308-5', contact: 'Ricardo Lugo',    email: 'rlugo@drummondltd.com',        phone: '+57 5 423 9000', region: 'Cesar',      tier: 'A', logo: 'DR', color: '#1E3A8A', ltv: 4_120_000_000 },
    { name: 'Mineros S.A.',       nit: '890.904.713-0', contact: 'Catalina Ríos',   email: 'crios@mineros.com.co',         phone: '+57 4 266 3500', region: 'Antioquia',  tier: 'B', logo: 'MS', color: '#047857', ltv: 3_220_000_000 },
    { name: 'Continental Gold',   nit: '900.331.881-1', contact: 'Sebastián Pulido',email: 's.pulido@continentalgold.co',  phone: '+57 4 444 1212', region: 'Antioquia',  tier: 'A', logo: 'CG', color: '#B45309', ltv: 6_300_000_000 },
    { name: 'Gran Colombia Gold', nit: '900.245.601-3', contact: 'M. F. Ortiz',     email: 'mortiz@gcgold.com',            phone: '+57 4 320 1010', region: 'Antioquia',  tier: 'B', logo: 'GC', color: '#6D28D9', ltv: 1_980_000_000 },
    { name: 'Carbones del Cesar', nit: '892.300.150-8', contact: 'Hernán Olivares', email: 'h.olivares@cardelcesar.co',   phone: '+57 5 580 4040', region: 'Cesar',      tier: 'C', logo: 'CC', color: '#334155', ltv: 1_120_000_000 },
  ];

  const clientMap = {};
  for (const c of clientData) {
    const cl = await prisma.client.upsert({
      where:  { tenantId_nit: { tenantId: t1.id, nit: c.nit } },
      update: {},
      create: { tenantId: t1.id, ...c, ltv: c.ltv },
    });
    clientMap[c.logo] = cl.id;
  }

  // ── Projects ───────────────────────────────────────────────────────────────
  const projectData = [
    { code: 'PRJ-2026-018', name: 'Exploración Cerro Matoso Sur 2026', clientLogo: 'CJ', service: 'Perforación diamantina', progress: 68, start: '2026-02-01', end: '2026-09-30', ownerAvatar: 'CR', status: 'ACTIVE',    region: 'La Guajira', lat: 11.45, lng: -72.95, contractValue: 2_400_000_000, billed: 1_632_000_000, color: '#0A2540' },
    { code: 'PRJ-2026-021', name: 'Levantamiento geofísico La Jagua',  clientLogo: 'DR', service: 'Magnetometría aérea',   progress: 42, start: '2026-03-10', end: '2026-07-15', ownerAvatar: 'LG', status: 'ACTIVE',    region: 'Cesar',      lat:  9.55, lng: -73.32, contractValue: 1_180_000_000, billed:  495_000_000, color: '#1E3A8A' },
    { code: 'PRJ-2026-024', name: 'Sondeos Buriticá Fase III',         clientLogo: 'CG', service: 'Perforación + Geología', progress: 81, start: '2026-01-15', end: '2026-08-30', ownerAvatar: 'CR', status: 'ACTIVE',    region: 'Antioquia',  lat:  6.72, lng: -75.91, contractValue: 3_120_000_000, billed: 2_527_000_000, color: '#B45309' },
    { code: 'PRJ-2026-026', name: 'Mediciones IP Segovia Norte',       clientLogo: 'MS', service: 'Geofísica IP',          progress: 23, start: '2026-04-05', end: '2026-10-20', ownerAvatar: 'LG', status: 'PAUSED',    region: 'Antioquia',  lat:  7.07, lng: -74.70, contractValue:   860_000_000, billed:  198_000_000, color: '#047857' },
    { code: 'PRJ-2026-029', name: 'Pozos exploratorios El Bagre',      clientLogo: 'MS', service: 'Perforación RC',         progress: 55, start: '2026-02-20', end: '2026-08-10', ownerAvatar: 'JQ', status: 'ACTIVE',    region: 'Antioquia',  lat:  7.61, lng: -74.81, contractValue: 1_540_000_000, billed:  847_000_000, color: '#0EA5E9' },
    { code: 'PRJ-2026-031', name: 'Programa Marmato Profundo',         clientLogo: 'GC', service: 'Perforación diamantina', progress: 12, start: '2026-04-22', end: '2026-12-15', ownerAvatar: 'CR', status: 'ALERT',     region: 'Caldas',     lat:  5.47, lng: -75.60, contractValue: 2_980_000_000, billed:  357_000_000, color: '#6D28D9' },
    { code: 'PRJ-2026-033', name: 'Cuenca carbonífera Boyacá',         clientLogo: 'CC', service: 'Topografía + Geología',  progress: 38, start: '2026-03-28', end: '2026-09-05', ownerAvatar: 'LG', status: 'ACTIVE',    region: 'Boyacá',     lat:  5.55, lng: -73.36, contractValue: 1_120_000_000, billed:  425_000_000, color: '#334155' },
    { code: 'PRJ-2025-099', name: 'Cierre Cerrejón Tabaco Sur',        clientLogo: 'CJ', service: 'Perforación diamantina', progress: 100, start: '2025-08-01', end: '2026-01-28', ownerAvatar: 'CR', status: 'COMPLETED', region: 'La Guajira', lat: 11.18, lng: -72.82, contractValue: 1_840_000_000, billed: 1_840_000_000, color: '#0A2540' },
  ];

  const projectMap = {};
  for (const p of projectData) {
    const proj = await prisma.project.upsert({
      where:  { tenantId_code: { tenantId: t1.id, code: p.code } },
      update: {},
      create: {
        tenantId:      t1.id,
        clientId:      clientMap[p.clientLogo],
        ownerId:       userMap[p.ownerAvatar],
        code:          p.code,
        name:          p.name,
        service:       p.service,
        progress:      p.progress,
        startDate:     new Date(p.start),
        endDate:       new Date(p.end),
        status:        p.status,
        region:        p.region,
        lat:           p.lat,
        lng:           p.lng,
        contractValue: p.contractValue,
        billed:        p.billed,
        coverColor:    p.color,
      },
    });
    projectMap[p.code] = proj.id;
  }

  // ── Wells ──────────────────────────────────────────────────────────────────
  const wellData = [
    { code: 'DDH-2026-074', projectCode: 'PRJ-2026-018', type: 'Diamantina', utmE: 1093540, utmN: 1727854, utmZ: 245, depthCurrent: 217.4, depthTarget: 320, bit: 'Diamantina HQ', status: 'ACTIVE',    azimuth: 270, dip: -65 },
    { code: 'DDH-2026-075', projectCode: 'PRJ-2026-018', type: 'Diamantina', utmE: 1093610, utmN: 1727930, utmZ: 248, depthCurrent: 142.8, depthTarget: 280, bit: 'Diamantina NQ', status: 'ACTIVE',    azimuth: 280, dip: -60 },
    { code: 'DDH-2026-076', projectCode: 'PRJ-2026-024', type: 'Diamantina', utmE:  843770, utmN:  742190, utmZ: 1840, depthCurrent: 318.7, depthTarget: 350, bit: 'Diamantina HQ', status: 'ACTIVE',    azimuth: 95, dip: -70 },
    { code: 'DDH-2026-077', projectCode: 'PRJ-2026-024', type: 'Diamantina', utmE:  843810, utmN:  742205, utmZ: 1842, depthCurrent: 274.2, depthTarget: 340, bit: 'Diamantina HQ', status: 'ACTIVE',    azimuth: 95, dip: -70 },
    { code: 'RC-2026-018',  projectCode: 'PRJ-2026-029', type: 'Aire reverso (RC)', utmE: 834520, utmN: 840110, utmZ: 120, depthCurrent: 88.0, depthTarget: 200, bit: 'Tricono 5 7/8"', status: 'PAUSED', azimuth: 0, dip: -90 },
    { code: 'DDH-2026-078', projectCode: 'PRJ-2026-031', type: 'Diamantina', utmE:  836210, utmN:  605110, utmZ: 1620, depthCurrent:  42.5, depthTarget: 400, bit: 'Diamantina HQ', status: 'ALERT',     azimuth: 180, dip: -75 },
    { code: 'DDH-2026-073', projectCode: 'PRJ-2026-018', type: 'Diamantina', utmE: 1093488, utmN: 1727770, utmZ: 244, depthCurrent: 320.0, depthTarget: 320, bit: 'Diamantina HQ', status: 'COMPLETED', azimuth: 270, dip: -65 },
    { code: 'RC-2026-019',  projectCode: 'PRJ-2026-029', type: 'Aire reverso (RC)', utmE: 834570, utmN: 840150, utmZ: 118, depthCurrent: 132.0, depthTarget: 220, bit: 'Tricono 5 7/8"', status: 'ACTIVE', azimuth: 0, dip: -90 },
  ];

  for (const w of wellData) {
    await prisma.well.upsert({
      where:  { tenantId_code: { tenantId: t1.id, code: w.code } },
      update: {},
      create: { tenantId: t1.id, projectId: projectMap[w.projectCode], ...w, projectCode: undefined },
    });
  }

  // ── Equipment ─────────────────────────────────────────────────────────────
  const eqData = [
    { code: 'PERF-001', type: 'Perforadora',     brand: 'Atlas Copco Christensen', model: 'CT20',    hours: 4280, lastMaint: '2026-04-12', nextMaint: '2026-05-18', status: 'OPERATIONAL', projectCode: 'PRJ-2026-018', fuelRate: 4.6 },
    { code: 'PERF-002', type: 'Perforadora',     brand: 'Boart Longyear',          model: 'LF90',    hours: 5612, lastMaint: '2026-03-30', nextMaint: '2026-05-15', status: 'MAINTENANCE', projectCode: 'PRJ-2026-024', fuelRate: 5.1 },
    { code: 'PERF-003', type: 'Perforadora',     brand: 'Schramm',                 model: 'T685WS',  hours: 3120, lastMaint: '2026-04-25', nextMaint: '2026-06-05', status: 'OPERATIONAL', projectCode: 'PRJ-2026-029', fuelRate: 6.8 },
    { code: 'PERF-004', type: 'Perforadora',     brand: 'Sandvik',                 model: 'DE712',   hours: 1880, lastMaint: '2026-04-30', nextMaint: '2026-06-12', status: 'OPERATIONAL', projectCode: 'PRJ-2026-031', fuelRate: 4.9 },
    { code: 'CAM-014',  type: 'Camioneta',       brand: 'Toyota',                  model: 'Hilux 2024', hours: 38420, lastMaint: '2026-04-02', nextMaint: '2026-05-22', status: 'OPERATIONAL', projectCode: 'PRJ-2026-018', fuelRate: 11.3 },
    { code: 'CAM-015',  type: 'Camioneta',       brand: 'Toyota',                  model: 'Hilux 2024', hours: 22115, lastMaint: '2026-03-15', nextMaint: '2026-05-10', status: 'MAINTENANCE', projectCode: 'PRJ-2026-024', fuelRate: 10.8 },
    { code: 'CAM-016',  type: 'Camioneta',       brand: 'Nissan',                  model: 'Frontier', hours: 41280, lastMaint: '2026-04-18', nextMaint: '2026-06-01', status: 'OPERATIONAL', projectCode: 'PRJ-2026-021', fuelRate: 12.4 },
    { code: 'GEN-003',  type: 'Generador',       brand: 'Cummins',                 model: 'C150D5',  hours: 2480,  lastMaint: '2026-02-12', nextMaint: '2026-04-30', status: 'OUT',         projectCode: 'PRJ-2026-026', fuelRate: 14.0 },
    { code: 'RET-002',  type: 'Retroexcavadora', brand: 'Caterpillar',             model: '320D',    hours: 6890,  lastMaint: '2026-04-10', nextMaint: '2026-06-08', status: 'OPERATIONAL', projectCode: 'PRJ-2026-024', fuelRate: 18.2 },
  ];

  for (const eq of eqData) {
    await prisma.equipment.upsert({
      where:  { tenantId_code: { tenantId: t1.id, code: eq.code } },
      update: {},
      create: { tenantId: t1.id, ...eq, projectId: projectMap[eq.projectCode], projectCode: undefined, lastMaint: new Date(eq.lastMaint), nextMaint: new Date(eq.nextMaint) },
    });
  }

  // ── Pipeline opportunities ────────────────────────────────────────────────
  const oppData = [
    { name: 'Programa exploración Cesar Norte', clientLogo: 'DR', amount: 1_850_000_000, prob: 30, stage: 'prospect',     closeDate: '2026-08-15', nextAction: 'Llamada de descubrimiento' },
    { name: 'Sondeos geotécnicos Drummond',     clientLogo: 'DR', amount:   720_000_000, prob: 25, stage: 'prospect',     closeDate: '2026-09-01', nextAction: 'Enviar one-pager' },
    { name: 'Magnetometría Cerrejón Norte',     clientLogo: 'CJ', amount: 1_120_000_000, prob: 50, stage: 'qualification', closeDate: '2026-07-25', nextAction: 'Visita técnica' },
    { name: 'Topografía minera Mineros S.A.',   clientLogo: 'MS', amount:   430_000_000, prob: 55, stage: 'qualification', closeDate: '2026-07-12', nextAction: 'Confirmar alcance' },
    { name: 'Renovación contrato Buriticá',     clientLogo: 'CG', amount: 3_650_000_000, prob: 70, stage: 'proposal',     closeDate: '2026-06-30', nextAction: 'Reunión seguimiento' },
    { name: 'Pozos exploratorios Marmato Sur',  clientLogo: 'GC', amount: 2_120_000_000, prob: 60, stage: 'proposal',     closeDate: '2026-07-05', nextAction: 'Aclarar precios' },
    { name: 'Geofísica Carbones del Cesar',     clientLogo: 'CC', amount:   880_000_000, prob: 80, stage: 'negotiation',  closeDate: '2026-06-10', nextAction: 'Negociar plazos' },
    { name: 'Servicios integrales Continental', clientLogo: 'CG', amount: 4_980_000_000, prob: 85, stage: 'negotiation',  closeDate: '2026-06-20', nextAction: 'Firma directiva' },
    { name: 'Diamantina Cerrejón Ext.',         clientLogo: 'CJ', amount: 2_640_000_000, prob: 95, stage: 'close',        closeDate: '2026-05-28', nextAction: 'Firma de contrato' },
    { name: 'Programa anual Mineros S.A.',      clientLogo: 'MS', amount: 1_780_000_000, prob: 100, stage: 'close',       closeDate: '2026-05-22', nextAction: 'Cerrado/Ganado' },
  ];

  for (const o of oppData) {
    await prisma.opportunity.create({
      data: {
        tenantId:   t1.id,
        clientId:   clientMap[o.clientLogo],
        ownerId:    userMap['NP'],
        name:       o.name,
        amount:     o.amount,
        prob:       o.prob,
        stage:      o.stage,
        closeDate:  new Date(o.closeDate),
        nextAction: o.nextAction,
      },
    }).catch(() => {}); // skip duplicates
  }

  // ── Sample incidents ──────────────────────────────────────────────────────
  const incidentData = [
    { type: 'NEAR_MISS', severity: 'MEDIUM', description: 'Trabajador resbaló cerca del pozo DDH-2026-074. Sin lesiones.', projectCode: 'PRJ-2026-018', occurredAt: '2026-05-10T08:30', status: 'CLOSED' },
    { type: 'ACCIDENT',  severity: 'LOW',    description: 'Golpe menor en mano durante manipulación de tubería.', projectCode: 'PRJ-2026-024', occurredAt: '2026-05-08T14:00', status: 'CLOSED' },
    { type: 'ENVIRONMENTAL', severity: 'LOW', description: 'Derrame menor de lubricante. Contenido y limpiado.', projectCode: 'PRJ-2026-029', occurredAt: '2026-05-05T11:15', status: 'INVESTIGATING' },
    { type: 'NEAR_MISS', severity: 'HIGH',   description: 'Falla de winche durante extracción de núcleo. Sin lesiones.', projectCode: 'PRJ-2026-031', occurredAt: '2026-05-01T16:45', status: 'OPEN' },
    { type: 'PROPERTY_DAMAGE', severity: 'MEDIUM', description: 'Daño a manguera hidráulica del equipo PERF-002.', projectCode: 'PRJ-2026-024', occurredAt: '2026-04-28T09:00', status: 'CLOSED' },
  ];

  for (const inc of incidentData) {
    await prisma.incident.create({
      data: {
        tenantId:   t1.id,
        type:       inc.type,
        severity:   inc.severity,
        description: inc.description,
        projectId:  projectMap[inc.projectCode],
        occurredAt: new Date(inc.occurredAt),
        status:     inc.status,
        reportedBy: 'Ana Vélez',
      },
    }).catch(() => {});
  }

  console.log('✅  Seed complete.');
  console.log('');
  console.log('  Login credentials (all tenants): password = Minex2026!');
  console.log('  Admin: admin@geoandes.co');
  console.log('  Manager: crestrepo@geoandes.co | npardo@geoandes.co');
  console.log('  Field: avelez@geoandes.co | jquintero@geoandes.co');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
