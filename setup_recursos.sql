-- Crea la tabla 'recursos' si no existe
create table if not exists public.recursos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  fecha timestamp with time zone default timezone('utc'::text, now()) not null,
  audio_url text not null,
  portada_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilita Row Level Security (RLS)
alter table public.recursos enable row level security;

-- Política de lectura pública (cualquiera puede ver los recursos)
create policy "Acceso público a recursos"
  on public.recursos for select
  using (true);

-- Política de inserción/actualización solo para usuarios autenticados (opcional, ajusta según necesites)
-- create policy "Solo admin puede editar"
--   on public.recursos for insert
--   with check (auth.role() = 'authenticated');
