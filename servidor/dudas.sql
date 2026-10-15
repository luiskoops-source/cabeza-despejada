-- Dudas de Cabeza Despejada: la gente pregunta lo que no encontró en la app y el dueño responde.
-- Se pega una sola vez en Supabase → SQL Editor → Run (después de supabase.sql, en el mismo proyecto).
--
-- Qué guarda: solo el texto de la duda, la respuesta y las fechas. Ni nombre, ni correo, ni identificador del teléfono.
-- Nadie puede listar la tabla desde la app. Solo existen tres puertas:
--   enviar_duda(pregunta)  → devuelve un número secreto (uuid) que se queda en el teléfono de quien preguntó
--   ver_duda(id)           → con ese número, la persona ve si ya hay respuesta
--   dudas_publicas()       → las dudas que el dueño marcó para que todos las vean
--
-- Cómo responder: Supabase → Table Editor → dudas. Escribe en "respuesta" (la fecha se pone sola).
-- Si la respuesta le sirve a todos, marca "publicar". Antes de publicar, revisa que la pregunta no tenga datos de nadie.

create extension if not exists pgcrypto;

create table if not exists public.dudas (
  id         uuid primary key default gen_random_uuid(),
  pregunta   text not null check (length(pregunta) between 10 and 500),
  respuesta  text check (length(respuesta) <= 3000),
  publicar   boolean not null default false,
  creada     timestamptz not null default now(),
  respondida timestamptz
);

alter table public.dudas enable row level security;
revoke all on public.dudas from anon, authenticated;

-- La fecha de respuesta se pone sola cuando el dueño escribe o cambia la respuesta
create or replace function public.dudas_fecha_respuesta()
returns trigger language plpgsql as $$
begin
  if new.respuesta is distinct from old.respuesta then
    new.respondida := case when new.respuesta is null or new.respuesta = '' then null else now() end;
  end if;
  return new;
end $$;
drop trigger if exists dudas_fecha_respuesta on public.dudas;
create trigger dudas_fecha_respuesta before update on public.dudas
  for each row execute function public.dudas_fecha_respuesta();

-- Enviar: con frenos contra el abuso (no hay forma de saber quién envía, así que el tope es para todos juntos)
create or replace function public.enviar_duda(p_pregunta text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare nuevo uuid;
begin
  if (select count(*) from public.dudas where creada > now() - interval '1 minute') >= 20 then
    raise exception 'Hay muchas dudas llegando. Intenta en un rato.';
  end if;
  if (select count(*) from public.dudas where respuesta is null) >= 300 then
    raise exception 'Hay muchas dudas esperando respuesta. Intenta en unos días.';
  end if;
  insert into public.dudas (pregunta) values (trim(p_pregunta)) returning id into nuevo;
  return nuevo;
end $$;

-- Ver la respuesta de una duda propia (hay que conocer su número secreto)
create or replace function public.ver_duda(p_id uuid)
returns table (respuesta text, respondida timestamptz)
language sql
security definer
set search_path = public
as $$
  select d.respuesta, d.respondida from public.dudas d where d.id = p_id;
$$;

-- Las respondidas que el dueño marcó para todos, las más nuevas primero
create or replace function public.dudas_publicas()
returns table (pregunta text, respuesta text, respondida timestamptz)
language sql
security definer
set search_path = public
as $$
  select d.pregunta, d.respuesta, d.respondida from public.dudas d
  where d.publicar and d.respuesta is not null and d.respuesta <> ''
  order by d.respondida desc limit 50;
$$;

revoke all on function public.enviar_duda(text) from public;
revoke all on function public.ver_duda(uuid) from public;
revoke all on function public.dudas_publicas() from public;
grant execute on function public.enviar_duda(text) to anon;
grant execute on function public.ver_duda(uuid) to anon;
grant execute on function public.dudas_publicas() to anon;
