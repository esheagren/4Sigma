-- Complete Supabase Schema Setup
-- Run this entire script in your Supabase SQL Editor

-- 1. users (piggy-backs on Supabase auth)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz default now(),
  avatar_url text,
  constraint display_name_unique unique(display_name)
);

-- 2. categories
create table public.categories (
  id serial primary key,
  slug text unique not null,
  label text not null
);

-- 3. questions
create table public.questions (
  id bigserial primary key,
  prompt text not null,
  correct_answer numeric not null,
  version int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3b. questions ↔ categories join
create table public.question_categories (
  question_id bigint references questions(id) on delete cascade,
  category_id int references categories(id) on delete cascade,
  primary key (question_id, category_id)
);

-- 4. game_sessions
create table public.game_sessions (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  mode text check (mode in ('daily','custom','practice')) not null,
  started_at timestamptz default now()
);

-- 4b. sessions ↔ questions join
create table public.session_questions (
  session_id bigint references game_sessions(id) on delete cascade,
  question_id bigint references questions(id),
  order_idx int,
  primary key (session_id, question_id)
);

-- 5. submissions
create table public.submissions (
  id bigserial primary key,
  session_id bigint references game_sessions(id) on delete cascade,
  question_id bigint references questions(id),
  user_id uuid references users(id),
  lower_bound numeric not null,
  upper_bound numeric not null,
  elapsed_ms int,
  score numeric,          -- populated by trigger
  created_at timestamptz default now(),
  constraint interval_valid check (lower_bound < upper_bound)
);

-- 6. session_results  (one row per finished session)
create table public.session_results (
  session_id bigint primary key references game_sessions(id) on delete cascade,
  total_score numeric,
  questions_answered int,
  finished_at timestamptz,
  duration_ms int
);

-- Now insert sample data

-- Sample categories
INSERT INTO public.categories (slug, label) VALUES
('science', 'Science'),
('geography', 'Geography'),
('economics', 'Economics'),
('technology', 'Technology'),
('history', 'History');

-- Sample questions
INSERT INTO public.questions (prompt, correct_answer) VALUES
('What is the height of Mount Everest in meters?', 8849),
('What is the average distance from Earth to the Moon in kilometers?', 384400),
('What is the population of Tokyo metropolitan area?', 37400000),
('What is the average human body temperature in degrees Celsius?', 37),
('What was the GDP of Germany in 2022 in trillion USD?', 4.07),
('What is the wingspan of a Boeing 747 in meters?', 68.5),
('What is the speed of light in meters per second?', 299792458),
('What is the diameter of Earth in kilometers?', 12742),
('What year was the World Wide Web invented?', 1989),
('What is the boiling point of water at sea level in degrees Celsius?', 100);

-- Link questions to categories
INSERT INTO public.question_categories (question_id, category_id) VALUES
(1, 2), -- Mount Everest -> Geography
(2, 1), -- Earth-Moon distance -> Science
(3, 2), -- Tokyo population -> Geography
(4, 1), -- Body temperature -> Science
(5, 3), -- Germany GDP -> Economics
(6, 4), -- Boeing 747 -> Technology
(7, 1), -- Speed of light -> Science
(8, 1), -- Earth diameter -> Science
(9, 4), -- WWW invention -> Technology
(10, 1); -- Water boiling point -> Science 