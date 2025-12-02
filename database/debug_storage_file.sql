-- Script de depuración para ver los metadatos del archivo
-- Reemplaza el nombre del archivo con el que está fallando si es diferente

SELECT 
    id, 
    bucket_id, 
    name, 
    owner, 
    created_at, 
    updated_at,
    metadata
FROM storage.objects
WHERE bucket_id = 'invoices'
AND name LIKE '%1764633094420_9ytgvs.pdf%';
