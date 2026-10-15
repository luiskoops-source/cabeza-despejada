-- Servidor del respaldo cifrado de Cabeza Despejada (Supabase, código abierto).
-- Se pega una sola vez en Supabase → SQL Editor → Run.
--
-- Qué guarda: por cada código secreto, un casillero con texto cifrado en el teléfono.
-- El servidor nunca ve el código, ni la llave, ni nada legible: solo un número de casillero
-- (derivado del código) y un texto que sin el código es basura.
--
-- Nadie puede listar ni leer la tabla directamente. Solo existen dos puertas:
--   guardar_respaldo(id, datos)  y  leer_respaldo(id)
-- y para usarlas hay que conocer el número de casillero, que solo sale del código.

create table if not exists public.respaldos (
  id          text primary key check (id ~ '^[0-9a-f]{64}$'),
  datos       text not null check (length(datos) < 3000000),
  actualizado timestamptz not null default now()
);

-- Sin políticas: con RLS activo y ninguna regla, la tabla queda cerrada para todos los visitantes.
alter table public.respaldos enable row level security;
revoke all on public.respaldos from anon, authenticated;

create or replace function public.guardar_respaldo(p_id text, p_datos text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.respaldos (id, datos, actualizado)
  values (p_id, p_datos, now())
  on conflict (id) do update set datos = excluded.datos, actualizado = now();
$$;

create or replace function public.leer_respaldo(p_id text)
returns text
language sql
security definer
set search_path = public
as $$
  select datos from public.respaldos where id = p_id;
$$;

revoke all on function public.guardar_respaldo(text, text) from public;
revoke all on function public.leer_respaldo(text) from public;
grant execute on function public.guardar_respaldo(text, text) to anon;
grant execute on function public.leer_respaldo(text) to anon;
