-- Create headquarters table
CREATE TABLE IF NOT EXISTS headquarters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for headquarters
ALTER TABLE headquarters ENABLE ROW LEVEL SECURITY;

-- Create policy for headquarters (allow read for authenticated users)
CREATE POLICY "Allow read access for authenticated users" ON headquarters
  FOR SELECT TO authenticated USING (true);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Energía', 'Agua', 'Actas')),
  year INTEGER NOT NULL,
  headquarters_id UUID REFERENCES headquarters(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Procesado', 'Error')),
  data JSONB, -- Para almacenar información específica por tipo (consumo, costo, gestor, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for invoices
-- NOTA: Si obtienes error "relation storage.buckets does not exist",
-- debes crear el bucket 'invoices' manualmente desde el Dashboard de Supabase
-- o usando el CLI: supabase storage buckets create invoices

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('invoices', 'invoices', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage policies
-- IMPORTANTE: No se pueden crear políticas de storage desde este script debido a restricciones de esquema.
-- DEBES configurar esto manualmente en el Dashboard de Supabase:
-- 1. Ve a Storage -> Policies
-- 2. Crea una política para el bucket 'invoices' que permita INSERT a usuarios autenticados.
-- 3. Crea una política para el bucket 'invoices' que permita SELECT a usuarios autenticados (si es necesario).
