alter table "public"."profiles" add column role text default 'user' not null;
alter table "public"."profiles" add constraint "profiles_role_check" check (role in ('user', 'admin'));

