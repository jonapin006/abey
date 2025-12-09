## Comando para extraer el esquema de la base de datos

psql -U supabase -d abey -h localhost \
  --no-align \
  --tuples-only \
  --command "
WITH schemas AS (
    SELECT 'public' AS schema_name
    UNION ALL
    SELECT 'auth' AS schema_name
),
tables_data AS (
    SELECT
        t.table_schema,
        t.table_name,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'name', c.column_name,
                    'type', c.data_type,
                    'nullable', c.is_nullable,
                    'default', c.column_default
                ) ORDER BY c.ordinal_position
            )
            FROM information_schema.columns c
            WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name
        ) AS columns,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'constraint', kcu.constraint_name,
                    'column', kcu.column_name,
                    'foreign_table', ccu.table_name,
                    'foreign_schema', ccu.table_schema,
                    'foreign_column', ccu.column_name
                )
            )
            FROM information_schema.key_column_usage kcu
            JOIN information_schema.constraint_column_usage ccu
              ON kcu.constraint_name = ccu.constraint_name
            WHERE kcu.table_schema = t.table_schema
              AND kcu.table_name = t.table_name
              AND kcu.constraint_name IN (
                  SELECT constraint_name
                  FROM information_schema.table_constraints
                  WHERE constraint_type = 'FOREIGN KEY'
              )
        ) AS relationships
    FROM information_schema.tables t
    JOIN schemas s ON t.table_schema = s.schema_name
    WHERE t.table_type = 'BASE TABLE'
)
SELECT jsonb_pretty(jsonb_agg(
    jsonb_build_object(
        'schema', table_schema,
        'table', table_name,
        'columns', columns,
        'relationships', COALESCE(relationships, '[]'::jsonb)
    )
)) 
FROM tables_data;" > esquema_local.json
