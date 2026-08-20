-- ============================================================
-- BIEPS-A · Esquema de base de datos para Supabase
-- Escala de Bienestar Psicológico para Adultos (Casullo, 2002)
-- UNACAR · Unidad de Servicios Psicopedagógicos
-- ============================================================
-- Cómo usarlo:
-- 1. Entra a tu proyecto en https://supabase.com/dashboard
-- 2. Ve a "SQL Editor" (menú izquierdo) → "New query"
-- 3. Pega TODO este archivo y dale "Run"
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.respuestas_bieps_a (
  id                 uuid primary key default gen_random_uuid(),

  -- Datos de identificación del estudiante
  matricula          text not null,
  nombre             text not null,
  facultad           text not null,
  programa           text not null,
  edad               smallint,
  sexo               text,

  -- Respuestas crudas de cada ítem (1 = En desacuerdo, 2 = Ni de acuerdo
  -- ni en desacuerdo, 3 = De acuerdo), en el orden original del instrumento
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

  -- Puntajes por dimensión, calculados en el navegador antes de enviarse
  aceptacion_control smallint not null,  -- ítems 2, 11, 13   (rango 3-9)
  vinculos           smallint not null,  -- ítems 5, 7, 8     (rango 3-9)
  autonomia          smallint not null,  -- ítems 4, 9, 12    (rango 3-9)
  proyectos          smallint not null,  -- ítems 1, 3, 6, 10 (rango 4-12)
  puntaje_total      smallint not null,  -- suma de los 13 ítems (rango 13-39)

  creado_en          timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Seguridad a nivel de fila (RLS)
-- ------------------------------------------------------------
-- La llave "anon" queda visible en el código del sitio (config.js),
-- así que CUALQUIERA que la vea podría intentar leer la tabla si no
-- se lo impides explícitamente. Estas políticas permiten que el
-- formulario público SOLO pueda insertar filas nuevas, nunca leerlas,
-- editarlas ni borrarlas. Para consultar los resultados, usa el
-- Table Editor o el SQL Editor dentro del panel de Supabase, con tu
-- propia sesión (esa vía no pasa por la llave anon).

alter table public.respuestas_bieps_a enable row level security;

create policy "El formulario puede insertar respuestas"
  on public.respuestas_bieps_a
  for insert
  to anon
  with check (true);

-- Nota: a propósito NO se crea ninguna política de "select" para el
-- rol anon. Sin una política de lectura, RLS bloquea todas las
-- lecturas públicas por defecto. Para consultar los resultados, usa
-- el Table Editor o el SQL Editor dentro del panel de Supabase, con
-- tu propia sesión (esa vía no pasa por la llave anon) — y desde ahí
-- exporta el CSV que abre panel-local.html.

-- ------------------------------------------------------------
-- ¿Ya habías creado la tabla antes de que existieran facultad/programa?
-- ------------------------------------------------------------
-- Si el "create table" de arriba no hizo nada porque la tabla ya
-- existía, corre esto una sola vez en el SQL Editor para agregar las
-- columnas nuevas sin perder las respuestas que ya tengas guardadas:
--
-- alter table public.respuestas_bieps_a add column if not exists facultad text;
-- alter table public.respuestas_bieps_a add column if not exists programa text;
