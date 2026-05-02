-- ============================================================
-- Portfolio Platform — Supabase Schema
-- Запускать в Supabase SQL Editor целиком, за один раз
-- ============================================================


-- ============================================================
-- 1. ТАБЛИЦЫ
-- ============================================================

-- designers
-- user_id ссылается на auth.users, управляемый Supabase Auth
-- fts — generated tsvector для полнотекстового поиска
create table designers (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade unique,
  username     text unique not null,
  name         text not null,
  headline     text,
  bio          text,
  location     text,
  email        text,
  telegram     text,
  linkedin     text,
  behance      text,
  avatar_url   text,
  is_available boolean default true,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now(),
  fts          tsvector generated always as (
                 to_tsvector(
                   'russian',
                   coalesce(name, '') || ' ' ||
                   coalesce(headline, '') || ' ' ||
                   coalesce(bio, '')
                 )
               ) stored
);

-- cases
create table cases (
  id                uuid primary key default gen_random_uuid(),
  designer_id       uuid references designers(id) on delete cascade,
  slug              text not null,
  title             text not null,
  short_description text,
  cover_image_url   text,
  status            text default 'draft'    check (status in ('draft', 'published')),
  visibility        text default 'private'  check (visibility in ('public', 'private')),
  order_index       integer default 0,
  tags              text[],
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique(designer_id, slug)
);

-- case_blocks
create table case_blocks (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid references cases(id) on delete cascade,
  block_type  text not null check (block_type in (
                'overview', 'context', 'research', 'design', 'results'
              )),
  content     jsonb default '{}',
  order_index integer not null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- skills (справочник, без RLS — читают все)
create table skills (
  id       uuid primary key default gen_random_uuid(),
  name     text unique not null,
  category text check (category in ('research', 'design', 'tools', 'methods'))
);

-- designer_skills (N:M)
create table designer_skills (
  designer_id uuid references designers(id) on delete cascade,
  skill_id    uuid references skills(id) on delete cascade,
  primary key (designer_id, skill_id)
);

-- work_experience
create table work_experience (
  id          uuid primary key default gen_random_uuid(),
  designer_id uuid references designers(id) on delete cascade,
  company     text not null,
  position    text not null,
  start_date  date not null,
  end_date    date,          -- NULL = текущее место работы
  description text,
  order_index integer default 0
);


-- ============================================================
-- 2. ИНДЕКСЫ
-- ============================================================

-- FTS — GIN-индекс по generated tsvector
create index idx_designers_fts on designers using gin(fts);

-- Быстрый поиск дизайнера по username (URL публичного портфолио)
create index idx_designers_username on designers(username);

-- Фильтрация по локации и доступности
create index idx_designers_location     on designers(location);
create index idx_designers_is_available on designers(is_available);

-- Кейсы по дизайнеру + статус/видимость (часто используется совместно)
create index idx_cases_designer_id          on cases(designer_id);
create index idx_cases_status_visibility    on cases(status, visibility);
create index idx_cases_designer_slug        on cases(designer_id, slug);

-- Блоки кейса
create index idx_case_blocks_case_id on case_blocks(case_id);

-- Навыки дизайнера (для фильтрации в поиске)
create index idx_designer_skills_skill_id    on designer_skills(skill_id);
create index idx_designer_skills_designer_id on designer_skills(designer_id);

-- Опыт работы
create index idx_work_experience_designer_id on work_experience(designer_id);


-- ============================================================
-- 3. ТРИГГЕР updated_at
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_designers_updated_at
  before update on designers
  for each row execute function set_updated_at();

create trigger trg_cases_updated_at
  before update on cases
  for each row execute function set_updated_at();

create trigger trg_case_blocks_updated_at
  before update on case_blocks
  for each row execute function set_updated_at();


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

alter table designers      enable row level security;
alter table cases          enable row level security;
alter table case_blocks    enable row level security;
alter table designer_skills enable row level security;
alter table work_experience enable row level security;
-- skills: RLS не нужен, таблица публична и управляется только через seed


-- designers: читают все, пишет только владелец
create policy "Public read designers"
  on designers for select using (true);

create policy "Owner write designers"
  on designers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- cases: публичные видны всем, черновики — только владельцу
create policy "Public read published cases"
  on cases for select
  using (
    (visibility = 'public' and status = 'published')
    or designer_id in (
      select id from designers where user_id = auth.uid()
    )
  );

create policy "Owner write cases"
  on cases for all
  using (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  )
  with check (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  );


-- case_blocks: наследует логику cases
create policy "Read case_blocks with case access"
  on case_blocks for select
  using (
    case_id in (
      select id from cases
      where (visibility = 'public' and status = 'published')
        or designer_id in (
          select id from designers where user_id = auth.uid()
        )
    )
  );

create policy "Owner write case_blocks"
  on case_blocks for all
  using (
    case_id in (
      select id from cases
      where designer_id in (
        select id from designers where user_id = auth.uid()
      )
    )
  )
  with check (
    case_id in (
      select id from cases
      where designer_id in (
        select id from designers where user_id = auth.uid()
      )
    )
  );


-- designer_skills: читают все, пишет только владелец
create policy "Public read designer_skills"
  on designer_skills for select using (true);

create policy "Owner write designer_skills"
  on designer_skills for all
  using (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  )
  with check (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  );


-- work_experience: читают все, пишет только владелец
create policy "Public read work_experience"
  on work_experience for select using (true);

create policy "Owner write work_experience"
  on work_experience for all
  using (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  )
  with check (
    designer_id in (
      select id from designers where user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. SEED — СПРАВОЧНИК НАВЫКОВ (20 навыков, 4 категории)
-- ============================================================

insert into skills (name, category) values
  -- research (5)
  ('Пользовательские интервью',   'research'),
  ('Юзабилити-тестирование',      'research'),
  ('Конкурентный анализ',         'research'),
  ('Количественные исследования', 'research'),
  ('Дневниковые исследования',    'research'),

  -- design (5)
  ('UI-дизайн',                   'design'),
  ('Прототипирование',            'design'),
  ('Визуальный дизайн',           'design'),
  ('Дизайн-системы',              'design'),
  ('Адаптивный дизайн',           'design'),

  -- tools (5)
  ('Figma',                       'tools'),
  ('Miro',                        'tools'),
  ('Principle',                   'tools'),
  ('Adobe Illustrator',           'tools'),
  ('Notion',                      'tools'),

  -- methods (5)
  ('Design Thinking',             'methods'),
  ('Jobs To Be Done',             'methods'),
  ('Double Diamond',              'methods'),
  ('CJM / Customer Journey Map',  'methods'),
  ('Agile / Scrum',               'methods');
