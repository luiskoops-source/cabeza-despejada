-- Chat de Cabeza Despejada: la persona escribe desde la app y responde el dueño, una persona (no una IA).
-- Se pega una sola vez en Supabase → SQL Editor → Run (en el mismo proyecto que supabase.sql).
--
-- Qué guarda: el texto de los mensajes y la hora. Ni nombre, ni correo, ni identificador del teléfono.
-- Cada conversación tiene un número secreto (uuid) que solo conoce el teléfono de quien escribe.
-- Nadie puede leer las tablas desde la app. Solo existen estas puertas:
--   chat_enviar(conversacion, texto)       → la persona escribe (la primera vez crea la conversación)
--   chat_leer(conversacion, desde)         → la persona lee lo nuevo de SU conversación
--   panel_entrar(clave)                    → el panel comprueba la clave
--   panel_conversaciones(clave)            → el dueño ve la lista (en panel.html)
--   panel_leer(clave, conversacion)        → el dueño lee una conversación
--   panel_responder(clave, conversacion, texto) → el dueño responde
--
-- ÚLTIMO PASO, OBLIGATORIO: crear la clave del panel. Cambia el texto entre comillas por una clave larga
-- (mínimo 12 letras, que no uses en otro lado) y ejecuta SOLO esta línea en el SQL Editor:
--   insert into public.chat_config (clave_hash) values (crypt('ESCRIBE-AQUI-TU-CLAVE-LARGA', gen_salt('bf')));
-- Para cambiarla después: delete from public.chat_config; y vuelve a insertar.

create extension if not exists pgcrypto;

create table if not exists public.chat_conversaciones (
  id          uuid primary key default gen_random_uuid(),
  creada      timestamptz not null default now(),
  ultima      timestamptz not null default now(),
  sin_leer    boolean not null default true   -- hay mensajes de la persona que el dueño no ha visto
);
create table if not exists public.chat_mensajes (
  id      bigserial primary key,
  conv    uuid not null references public.chat_conversaciones(id) on delete cascade,
  de      text not null check (de in ('persona','app')),
  texto   text not null check (length(texto) between 1 and 1000),
  creado  timestamptz not null default now()
);
create index if not exists chat_mensajes_conv on public.chat_mensajes (conv, id);
create table if not exists public.chat_config ( clave_hash text not null );
create table if not exists public.chat_intentos ( t timestamptz not null default now() );

alter table public.chat_conversaciones enable row level security;
alter table public.chat_mensajes enable row level security;
alter table public.chat_config enable row level security;
alter table public.chat_intentos enable row level security;
revoke all on public.chat_conversaciones, public.chat_mensajes, public.chat_config, public.chat_intentos from anon, authenticated;

-- La persona escribe. Si no trae conversación (o la suya ya no existe), se crea una nueva y se devuelve su número.
create or replace function public.chat_enviar(p_conv uuid, p_texto text)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare c uuid := p_conv;
begin
  if (select count(*) from public.chat_mensajes where creado > now() - interval '1 minute') >= 60 then
    raise exception 'Hay muchos mensajes llegando. Intenta en un rato.';
  end if;
  if c is null or not exists (select 1 from public.chat_conversaciones where id = c) then
    if (select count(*) from public.chat_conversaciones where creada > now() - interval '1 day') >= 200 then
      raise exception 'Hoy llegaron muchas conversaciones nuevas. Intenta mañana.';
    end if;
    insert into public.chat_conversaciones default values returning id into c;
  end if;
  insert into public.chat_mensajes (conv, de, texto) values (c, 'persona', trim(p_texto));
  update public.chat_conversaciones set ultima = now(), sin_leer = true where id = c;
  return c;
end $$;

-- La persona lee los mensajes de su conversación con número mayor a p_desde
create or replace function public.chat_leer(p_conv uuid, p_desde bigint)
returns table (id bigint, de text, texto text, creado timestamptz)
language sql security definer set search_path = public
as $$
  select m.id, m.de, m.texto, m.creado from public.chat_mensajes m
  where m.conv = p_conv and m.id > coalesce(p_desde, 0) order by m.id;
$$;

-- Revisa la clave del panel. Con muchos intentos fallidos seguidos, se bloquea 15 minutos.
create or replace function public.chat_clave_ok(p_clave text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if (select count(*) from public.chat_intentos where t > now() - interval '15 minutes') >= 10 then
    return false;
  end if;
  if exists (select 1 from public.chat_config where clave_hash = crypt(p_clave, clave_hash)) then
    return true;
  end if;
  insert into public.chat_intentos default values;
  return false;
end $$;

-- Para entrar al panel: dice si la clave es correcta
create or replace function public.panel_entrar(p_clave text)
returns boolean
language sql security definer set search_path = public
as $$ select public.chat_clave_ok(p_clave); $$;

create or replace function public.panel_conversaciones(p_clave text)
returns table (id uuid, ultima timestamptz, sin_leer boolean, ultimo_texto text, ultimo_de text)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.chat_clave_ok(p_clave) then return; end if;
  return query
    select c.id, c.ultima, c.sin_leer, m.texto, m.de
    from public.chat_conversaciones c
    join lateral (select texto, de from public.chat_mensajes where conv = c.id order by id desc limit 1) m on true
    order by c.sin_leer desc, c.ultima desc limit 200;
end $$;

create or replace function public.panel_leer(p_clave text, p_conv uuid)
returns table (id bigint, de text, texto text, creado timestamptz)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.chat_clave_ok(p_clave) then return; end if;
  update public.chat_conversaciones set sin_leer = false where chat_conversaciones.id = p_conv;
  return query select m.id, m.de, m.texto, m.creado from public.chat_mensajes m where m.conv = p_conv order by m.id;
end $$;

create or replace function public.panel_responder(p_clave text, p_conv uuid, p_texto text)
returns boolean
language plpgsql security definer set search_path = public
as $$
begin
  if not public.chat_clave_ok(p_clave) then return false; end if;
  insert into public.chat_mensajes (conv, de, texto) values (p_conv, 'app', trim(p_texto));
  update public.chat_conversaciones set ultima = now(), sin_leer = false where id = p_conv;
  return true;
end $$;

revoke all on function public.chat_enviar(uuid, text), public.chat_leer(uuid, bigint), public.chat_clave_ok(text), public.panel_entrar(text),
  public.panel_conversaciones(text), public.panel_leer(text, uuid), public.panel_responder(text, uuid, text) from public;
grant execute on function public.chat_enviar(uuid, text), public.chat_leer(uuid, bigint), public.panel_entrar(text),
  public.panel_conversaciones(text), public.panel_leer(text, uuid), public.panel_responder(text, uuid, text) to anon;
