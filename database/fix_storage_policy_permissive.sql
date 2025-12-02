-- Política PERMISIVA para depuración
-- Esto permitirá a cualquier usuario logueado ver CUALQUIER factura
-- Úsalo solo para probar si es un problema de coincidencia de ID/Owner

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        
        DROP POLICY IF EXISTS "Users can view their own invoice files" ON storage.objects;
        
        -- Política temporal: Permitir ver TODO en el bucket invoices
        CREATE POLICY "Users can view their own invoice files" ON storage.objects
        FOR SELECT TO authenticated
        USING (bucket_id = 'invoices');
        
        RAISE NOTICE 'Política PERMISIVA creada. Intenta ver el archivo ahora.';
    ELSE
        RAISE NOTICE 'No se tiene acceso al esquema storage.';
    END IF;
END
$$;
