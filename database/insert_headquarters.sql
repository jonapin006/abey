-- Insertar sedes para la compañía
-- Company ID: fa701a63-4ea3-4e33-be2f-02d815ff9d56

INSERT INTO headquarters (name, company_id) VALUES
  ('Sede Principal', 'fa701a63-4ea3-4e33-be2f-02d815ff9d56')
ON CONFLICT DO NOTHING;

-- Verificar las sedes creadas
SELECT id, name, company_id, created_at 
FROM headquarters 
ORDER BY name;
