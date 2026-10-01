-- japjap – initiales Schema
-- Inhalte (Kana, Vokabeln, Kanji, …) sind öffentlich lesbar und werden nur per Seed/Service-Role geschrieben.
-- Nutzerdaten sind per Row Level Security strikt auf den jeweiligen Nutzer beschränkt.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type learning_status as enum ('unseen', 'familiar', 'learning', 'known', 'mastered');
create type content_type as enum ('kana', 'vocabulary', 'kanji', 'grammar', 'sentence', 'expression', 'conversation');
create type difficulty as enum ('beginner', 'elementary', 'intermediate', 'advanced');
create type jlpt_level as enum ('N5', 'N4', 'N3', 'N2', 'N1');
create type script_type as enum ('hiragana', 'katakana');
create type review_rating as enum ('again', 'hard', 'good', 'easy');

-- ---------------------------------------------------------------------------
-- Inhalte
-- ---------------------------------------------------------------------------

create table kana_groups (
  id text primary key,
  script_type script_type not null,
  name_de text not null,
  position int not null
);

create table kana (
  id text primary key,
  character text not null unique,
  script_type script_type not null,
  romaji text not null,
  pronunciation text,
  "row" text not null,
  "group" text not null check ("group" in ('basic', 'dakuten', 'handakuten', 'yoon')),
  group_id text references kana_groups (id),
  stroke_count int,
  stroke_order_data jsonb,
  audio_url text,
  base_character text,
  dakuten_variant text,
  handakuten_variant text,
  related_characters text[] not null default '{}',
  confusion_group text
);
create index kana_script_idx on kana (script_type, "group");
create index kana_romaji_idx on kana (romaji);

create table audio_assets (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  url text not null,
  voice text,
  speed numeric not null default 1,
  created_at timestamptz not null default now()
);
create index audio_assets_text_idx on audio_assets (text);

create table kanji (
  id text primary key,
  character text not null unique,
  meanings_de text[] not null,
  meanings_en text[],
  onyomi text[] not null default '{}',
  kunyomi text[] not null default '{}',
  radical text not null,
  components text[] not null default '{}',
  stroke_count int not null,
  jlpt jlpt_level,
  frequency int,
  grade int,
  stroke_order_data jsonb
);
create index kanji_jlpt_idx on kanji (jlpt);

create table vocabulary (
  id text primary key,
  japanese text not null,
  reading text not null,
  furigana text,
  romaji text not null,
  german text[] not null,
  english text[],
  part_of_speech text not null,
  jlpt jlpt_level,
  frequency int,
  audio_url text,
  tags text[] not null default '{}'
);
create index vocabulary_jlpt_idx on vocabulary (jlpt);
create index vocabulary_japanese_idx on vocabulary (japanese);
create index vocabulary_reading_idx on vocabulary (reading);
create index vocabulary_romaji_trgm on vocabulary using gin (romaji gin_trgm_ops);
create index vocabulary_tags_idx on vocabulary using gin (tags);

create table grammar_points (
  id text primary key,
  slug text not null unique,
  pattern text not null,
  meaning_de text not null,
  structure text not null,
  explanation_de text not null,
  jlpt jlpt_level,
  usage_notes text,
  common_mistakes text[] not null default '{}'
);

create table sentences (
  id text primary key,
  japanese text not null,
  furigana text,
  reading text not null,
  romaji text not null,
  german text not null,
  audio_url text
);

create table sentence_vocabulary (
  sentence_id text references sentences (id) on delete cascade,
  vocabulary_id text references vocabulary (id) on delete cascade,
  primary key (sentence_id, vocabulary_id)
);
create index sentence_vocabulary_vocab_idx on sentence_vocabulary (vocabulary_id);

create table sentence_grammar (
  sentence_id text references sentences (id) on delete cascade,
  grammar_id text references grammar_points (id) on delete cascade,
  primary key (sentence_id, grammar_id)
);
create index sentence_grammar_grammar_idx on sentence_grammar (grammar_id);

create table situations (
  id text primary key,
  slug text not null unique,
  title_ja text not null,
  title_de text not null,
  description_de text not null,
  difficulty difficulty not null,
  category text not null check (category in ('everyday', 'travel', 'social', 'work')),
  cultural_notes_de text[] not null default '{}'
);

create table conversations (
  id text primary key,
  title_ja text not null,
  title_de text not null,
  situation_id text not null references situations (id) on delete cascade,
  difficulty difficulty not null,
  jlpt_estimate jlpt_level,
  description_de text not null,
  audio_url text
);
create index conversations_situation_idx on conversations (situation_id);

create table conversation_lines (
  id uuid primary key default gen_random_uuid(),
  conversation_id text not null references conversations (id) on delete cascade,
  speaker text not null,
  position int not null,
  japanese text not null,
  furigana text,
  reading text not null,
  romaji text not null,
  german text not null,
  audio_url text,
  unique (conversation_id, position)
);

create table conversation_vocabulary (
  conversation_id text references conversations (id) on delete cascade,
  vocabulary_id text references vocabulary (id) on delete cascade,
  primary key (conversation_id, vocabulary_id)
);
create index conversation_vocabulary_vocab_idx on conversation_vocabulary (vocabulary_id);

create table conversation_grammar (
  conversation_id text references conversations (id) on delete cascade,
  grammar_id text references grammar_points (id) on delete cascade,
  primary key (conversation_id, grammar_id)
);
create index conversation_grammar_grammar_idx on conversation_grammar (grammar_id);

-- Einheitliche Referenz auf beliebige lernbare Inhalte (für Reviews und Pfade).
create table learning_items (
  id uuid primary key default gen_random_uuid(),
  content_type content_type not null,
  content_id text not null,
  unique (content_type, content_id)
);

create table learning_paths (
  id text primary key,
  slug text not null unique,
  section text not null,
  title_de text not null,
  title_ja text,
  description_de text not null,
  difficulty difficulty not null,
  position int not null
);

create table learning_path_items (
  path_id text references learning_paths (id) on delete cascade,
  position int not null,
  content_type content_type not null,
  content_id text not null,
  primary key (path_id, position)
);

-- ---------------------------------------------------------------------------
-- Nutzerdaten
-- ---------------------------------------------------------------------------

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  experience text,
  goals text[] not null default '{}',
  hiragana_knowledge text,
  katakana_knowledge text,
  daily_minutes int,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table user_learning_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type content_type not null,
  content_id text not null,
  status learning_status not null default 'unseen',
  ease_factor numeric not null default 2.5,
  interval_days numeric not null default 0,
  repetitions int not null default 0,
  lapses int not null default 0,
  next_review_at timestamptz,
  last_reviewed_at timestamptz,
  correct_count int not null default 0,
  incorrect_count int not null default 0,
  scheduler text not null default 'sm2',
  updated_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);
create index user_progress_due_idx on user_learning_progress (user_id, next_review_at)
  where next_review_at is not null;
create index user_progress_status_idx on user_learning_progress (user_id, content_type, status);

-- Geplante Reviews einer Sitzung (offene Queue)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type content_type not null,
  content_id text not null,
  task_type text not null,
  due_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index reviews_user_due_idx on reviews (user_id, due_at);

create table review_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type content_type not null,
  content_id text not null,
  task_type text not null,
  rating review_rating not null,
  answer text,
  previous_interval_days numeric,
  next_interval_days numeric,
  reviewed_at timestamptz not null default now()
);
create index review_history_user_idx on review_history (user_id, reviewed_at desc);
create index review_history_item_idx on review_history (user_id, content_type, content_id);

create table favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  content_type content_type not null,
  content_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, content_type, content_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- Inhalte: öffentlich lesbar, keine Schreibrechte für anon/authenticated.
do $$
declare t text;
begin
  foreach t in array array[
    'kana_groups', 'kana', 'audio_assets', 'kanji', 'vocabulary', 'grammar_points', 'sentences',
    'sentence_vocabulary', 'sentence_grammar', 'situations', 'conversations', 'conversation_lines',
    'conversation_vocabulary', 'conversation_grammar', 'learning_items', 'learning_paths',
    'learning_path_items'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "content is readable" on %I for select using (true)', t);
  end loop;
end $$;

-- Profile: Primärschlüssel = auth.uid()
alter table profiles enable row level security;
create policy "own profile select" on profiles for select using ((select auth.uid()) = id);
create policy "own profile insert" on profiles for insert with check ((select auth.uid()) = id);
create policy "own profile update" on profiles for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Übrige Nutzertabellen: user_id = auth.uid()
do $$
declare t text;
begin
  foreach t in array array[
    'user_settings', 'user_learning_progress', 'reviews', 'review_history', 'favorites'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "own rows select" on %I for select using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows insert" on %I for insert with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows update" on %I for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows delete" on %I for delete using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Profil automatisch bei Registrierung anlegen
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
