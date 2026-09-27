-- =====================================================================
-- PLEX PLAY 1.17 — ejecutar una sola vez en Supabase → SQL Editor → Run
-- 1) Registro de errores de la app (monitoreo gratuito)
-- 2) Compañeros de clase para la clasificación «Mi clase»
-- Se puede ejecutar varias veces sin problema.
-- =====================================================================

-- 1) Errores de la app -------------------------------------------------
create table if not exists public.app_errors (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid,
  msg         text not null,
  src         text,
  stack       text,
  ver         text,
  view        text,
  ua          text,
  demo        boolean not null default false
);
create index if not exists app_errors_created_idx on public.app_errors (created_at desc);
alter table public.app_errors enable row level security;

-- cualquiera (también la demo sin cuenta) puede reportar un error, con límites de tamaño
drop policy if exists app_errors_insert on public.app_errors;
create policy app_errors_insert on public.app_errors
  for insert to anon, authenticated
  with check (
    length(msg) <= 500
    and coalesce(length(src), 0) <= 300
    and coalesce(length(stack), 0) <= 2000
    and coalesce(length(ua), 0) <= 200
    and (user_id is null or user_id = auth.uid())
  );

-- solo el administrador ve y borra los errores
drop policy if exists app_errors_admin_read on public.app_errors;
create policy app_errors_admin_read on public.app_errors
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists app_errors_admin_delete on public.app_errors;
create policy app_errors_admin_delete on public.app_errors
  for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- los errores se borran solos a los 30 días (si pg_cron no está activo, esta parte se omite)
do $$ begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('plx-app-errors-clean', '15 3 * * *',
      $c$ delete from public.app_errors where created_at < now() - interval '30 days' $c$);
  end if;
exception when others then null;
end $$;

-- 2) Compañeros de clase ------------------------------------------------
-- Devuelve los miembros de las clases activas donde el usuario es estudiante o docente.
create or replace function public.class_mates()
returns table (class_id text, class_name text, user_id uuid)
language sql
security definer
set search_path = public
stable
as $$
  select c.id::text, c.name, m.user_id
  from public.classes c
  join public.class_members m on m.class_id = c.id
  where coalesce(c.archived, false) = false
    and (
      c.teacher_id = auth.uid()
      or exists (select 1 from public.class_members me
                 where me.class_id = c.id and me.user_id = auth.uid())
    );
$$;
revoke all on function public.class_mates() from public, anon;
grant execute on function public.class_mates() to authenticated;
