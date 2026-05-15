-- ============================================================
-- MinexCRM — Crear empresa + admin inicial
-- Hash = bcrypt('Minex2026!', 12)
-- Ejecutar DESPUÉS de truncate_all.sql (o con DB vacía)
-- ============================================================

-- 1) Tenant (tu empresa)
INSERT INTO tenants (id, name, short, nit, plan, active, "createdAt", "updatedAt")
VALUES (
  'cb3e8939-921d-4507-8510-f57176adc8f1',
  'GeoAndes Drilling S.A.S.',
  'GA',
  '900.123.456-7',
  'ENTERPRISE',
  true,
  NOW(), NOW()
);

-- 2) Usuario ADMIN
INSERT INTO users (
  id, "tenantId", email, "passwordHash", name, role,
  avatar, color, phone, position, eps, arl, shift,
  active, "mfaEnabled", "createdAt", "updatedAt"
) VALUES (
  '4bea3bed-784c-449e-ac25-3d1e8527a9dc',
  'cb3e8939-921d-4507-8510-f57176adc8f1',
  'admin@geoandes.co',
  '$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK',
  'Admin GeoAndes',
  'ADMIN',
  'AG', '#2563EB',
  '+57 300 000 0001',
  'Administrador',
  'Sura', 'Positiva', 'Día',
  true, false,
  NOW(), NOW()
);

-- Verificar:
SELECT id, email, role FROM users;
