
create extension if not exists "pgcrypto";

create table if not exists public.respuestas_bieps_a (
  id                 uuid primary key default gen_random_uuid(),

  matricula          text not null,
  nombre             text not null,
  facultad           text not null,
  programa           text not null,
  edad               smallint,
  sexo               text,

  item_01            smallint not null check (item_01 between 1 and 3),
  item_02            smallint not null check (item_02 between 1 and 3),
  item_03            smallint not null check (item_03 between 1 and 3),
  item_04            smallint not null check (item_04 between 1 and 3),
  item_05            smallint not null check (item_05 between 1 and 3),
  item_06            smallint not null check (item_06 between 1 and 3),
  item_07            smallint not null check (item_07 between 1 and 3),
  item_08            smallint not null check (item_08 between 1 and 3),
  item_09            smallint not null check (item_09 between 1 and 3),
  item_10            smallint not null check (item_10 between 1 and 3),
  item_11            smallint not null check (item_11 between 1 and 3),
  item_12            smallint not null check (item_12 between 1 and 3),
  item_13            smallint not null check (item_13 between 1 and 3),

  aceptacion_control smallint not null,  -- ítems 2, 11, 13   (rango 3-9)
  vinculos           smallint not null,  -- ítems 5, 7, 8     (rango 3-9)
  autonomia          smallint not null,  -- ítems 4, 9, 12    (rango 3-9)
  proyectos          smallint not null,  -- ítems 1, 3, 6, 10 (rango 4-12)
  puntaje_total      smallint not null,  -- suma de los 13 ítems (rango 13-39)

  creado_en          timestamptz not null default now()
);

alter table public.respuestas_bieps_a enable row level security;

create policy "El formulario puede insertar respuestas"
  on public.respuestas_bieps_a
  for insert
  to anon
  with check (true);
