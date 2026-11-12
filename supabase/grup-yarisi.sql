-- Okyanus Kaşifi · Grup yarışı (v55). Bir kez çalıştırmak yeterli; tekrar çalıştırmak zarar vermez.
-- Veri: grup adı, ekip adı, damga / yanlış / kaçan sayısı. Kişisel bilgi yok. 3 günden eski gruplar silinir.
create table if not exists public.kasif_grup (
  kod text primary key,
  ad text not null check (char_length(ad) between 1 and 24),
  olusturma timestamptz not null default now()
);
create table if not exists public.kasif_ekip (
  kod text not null references public.kasif_grup(kod) on delete cascade,
  cihaz text not null,
  ad text not null,
  damga int not null default 0,
  yanlis int not null default 0,
  kacan int not null default 0,
  bitti boolean not null default false,
  guncelleme timestamptz not null default now(),
  primary key (kod, cihaz)
);
alter table public.kasif_grup enable row level security;
alter table public.kasif_ekip enable row level security;
revoke all on public.kasif_grup from anon, authenticated;
revoke all on public.kasif_ekip from anon, authenticated;

create or replace function public.kasif_grup_ac(p_ad text)
returns text language plpgsql security definer set search_path = public as $$
declare v_kod text; harfler constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
begin
  p_ad := left(btrim(coalesce(p_ad, '')), 24);
  if p_ad = '' then raise exception 'Grup adı gerekli'; end if;
  delete from kasif_grup where olusturma < now() - interval '3 days';
  loop
    v_kod := '';
    for i in 1..4 loop v_kod := v_kod || substr(harfler, 1 + floor(random() * length(harfler))::int, 1); end loop;
    exit when not exists (select 1 from kasif_grup where kod = v_kod);
  end loop;
  insert into kasif_grup (kod, ad) values (v_kod, p_ad);
  return v_kod;
end $$;

create or replace function public.kasif_ekip_yaz(p_kod text, p_cihaz text, p_ad text, p_damga int, p_yanlis int, p_kacan int, p_bitti boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  p_kod := upper(btrim(coalesce(p_kod, '')));
  if not exists (select 1 from kasif_grup where kod = p_kod and olusturma > now() - interval '3 days') then
    raise exception 'Grup bulunamadı'; end if;
  if char_length(coalesce(p_cihaz, '')) not between 8 and 40 then raise exception 'Geçersiz cihaz'; end if;
  if not exists (select 1 from kasif_ekip where kod = p_kod and cihaz = p_cihaz)
     and (select count(*) from kasif_ekip where kod = p_kod) >= 60 then raise exception 'Grup dolu'; end if;
  insert into kasif_ekip (kod, cihaz, ad, damga, yanlis, kacan, bitti, guncelleme)
  values (p_kod, p_cihaz, coalesce(nullif(left(btrim(p_ad), 20), ''), 'Ekip'),
          least(greatest(coalesce(p_damga, 0), 0), 20), least(greatest(coalesce(p_yanlis, 0), 0), 99),
          least(greatest(coalesce(p_kacan, 0), 0), 20), coalesce(p_bitti, false), now())
  on conflict (kod, cihaz) do update set ad = excluded.ad, damga = excluded.damga, yanlis = excluded.yanlis,
    kacan = excluded.kacan, bitti = excluded.bitti, guncelleme = now();
end $$;

create or replace function public.kasif_siralama(p_kod text, p_cihaz text default null)
returns json language sql security definer set search_path = public stable as $$
  select json_build_object('kod', g.kod, 'ad', g.ad, 'olusturma', g.olusturma,
    'ekipler', coalesce((select json_agg(json_build_object('ad', e.ad, 'damga', e.damga, 'yanlis', e.yanlis,
        'kacan', e.kacan, 'bitti', e.bitti, 'guncelleme', e.guncelleme, 'ben', (e.cihaz = p_cihaz))
        order by e.damga desc, e.yanlis asc, e.guncelleme asc) from kasif_ekip e where e.kod = g.kod), '[]'::json))
  from kasif_grup g where g.kod = upper(btrim(p_kod)) and g.olusturma > now() - interval '3 days';
$$;

grant execute on function public.kasif_grup_ac(text) to anon, authenticated;
grant execute on function public.kasif_ekip_yaz(text, text, text, int, int, int, boolean) to anon, authenticated;
grant execute on function public.kasif_siralama(text, text) to anon, authenticated;
