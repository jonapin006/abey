-- Intentar con una política basada en el OWNER del objeto
-- Supabase asigna automáticamente el owner al usuario que subió el archivo

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        
        DROP POLICY IF EXISTS "Users can view their own invoice files" ON storage.objects;
        
        -- Opción 3: Usar la columna owner (más seguro y estándar)
        CREATE POLICY "Users can view their own invoice files" ON storage.objects
        FOR SELECT TO authenticated
        USING (
            bucket_id = 'invoices' 
            AND owner = auth.uid()
        );
        
        RAISE NOTICE 'Política actualizada usando OWNER';
    ELSE
        RAISE NOTICE 'No se tiene acceso al esquema storage.';
    END IF;
END
$$;
