-- Actualizar política de lectura usando LIKE (más robusto)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        
        DROP POLICY IF EXISTS "Users can view their own invoice files" ON storage.objects;
        
        -- Usar LIKE para comparar el path directamente con el ID del usuario
        CREATE POLICY "Users can view their own invoice files" ON storage.objects
        FOR SELECT TO authenticated
        USING (
            bucket_id = 'invoices' 
            AND name LIKE (auth.uid()::text || '/%')
        );
        
        RAISE NOTICE 'Política actualizada usando LIKE';
    ELSE
        RAISE NOTICE 'No se tiene acceso al esquema storage.';
    END IF;
END
$$;
