-- Phase 2: erweiterte Katakana, Spaltenposition für Kana-Tabellen, Lernhilfen im Profil.

alter table kana drop constraint if exists kana_group_check;
alter table kana add constraint kana_group_check
  check ("group" in ('basic', 'dakuten', 'handakuten', 'yoon', 'extended'));

alter table kana add column if not exists "column" int not null default 0;
alter table kana add column if not exists alternatives text[] not null default '{}';
alter table kana add column if not exists counterpart text;

alter table profiles add column if not exists aids text[] not null default '{}';
