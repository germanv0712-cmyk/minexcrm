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

-- 2) Usuario ADMIN principal
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

-- 3) SUPER_ADMIN (Germán Velásquez — acceso total)
INSERT INTO users (
  id, "tenantId", email, "passwordHash", name, role,
  avatar, color, phone, position, eps, arl, shift,
  active, "mfaEnabled", "createdAt", "updatedAt"
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'cb3e8939-921d-4507-8510-f57176adc8f1',
  'germanvelasquezz@gmail.com',
  '$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK',
  'Germán Velásquez',
  'SUPER_ADMIN',
  'GV', '#0A2540',
  '',
  'Director',
  'Sura', 'Positiva', 'Día',
  true, false,
  NOW(), NOW()
);

-- 4) Usuarios de prueba por cada perfil
INSERT INTO users (
  id, "tenantId", email, "passwordHash", name, role,
  avatar, color, position, eps, arl, shift,
  active, "mfaEnabled", "createdAt", "updatedAt"
) VALUES
  ('b1000001-0000-0000-0000-000000000001','cb3e8939-921d-4507-8510-f57176adc8f1','manager@geoandes.co','$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK','Carlos Restrepo','MANAGER','CR','#1E3A8A','Gerente de Proyecto','Sura','Positiva','Día',true,false,NOW(),NOW()),
  ('b1000002-0000-0000-0000-000000000002','cb3e8939-921d-4507-8510-f57176adc8f1','campo@geoandes.co','$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK','Ana Vélez','FIELD','AV','#B45309','Supervisora HSE','Sanitas','Sura','Día',true,false,NOW(),NOW()),
  ('b1000003-0000-0000-0000-000000000003','cb3e8939-921d-4507-8510-f57176adc8f1','visor@geoandes.co','$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK','Visor Demo','VIEWER','VD','#64748B','Consultor','Sura','Positiva','Día',true,false,NOW(),NOW()),
  ('b1000004-0000-0000-0000-000000000004','cb3e8939-921d-4507-8510-f57176adc8f1','portal@geoandes.co','$2a$12$Z1JLLDm0hMzUst11d/vGmOYu1L7OKnQ7dmhD7j2YQYGHihmcNuPaK','Cliente Portal','PORTAL','CP','#10B981','Contacto cliente','N/A','N/A','Día',true,false,NOW(),NOW())
ON CONFLICT DO NOTHING;

-- Verificar:
SELECT name, email, role FROM users ORDER BY role;
