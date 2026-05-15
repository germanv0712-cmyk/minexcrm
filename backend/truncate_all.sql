-- ============================================================
-- MinexCRM — Vaciar todas las tablas (preserva estructura)
-- Ejecutar en Supabase → SQL Editor
-- ADVERTENCIA: borra TODOS los datos
-- ============================================================
TRUNCATE TABLE
  webhook_deliveries,
  webhooks,
  audit_logs,
  files,
  visits,
  maintenances,
  equipment,
  certifications,
  permits,
  incidents,
  core_samples,
  drill_logs,
  wells,
  milestones,
  alerts,
  projects,
  opportunities,
  contacts,
  clients,
  refresh_tokens,
  users,
  tenants
CASCADE;
