-- Okyanus Kaşifi · Grup Mücadelesi (v56). Bir kez çalıştırmak yeterli; tekrar çalıştırmak zarar vermez.
-- Bir grup (ör. sınıf) öğretmenin tek telefonuyla oynar; gruplar arası sıralama (bu hafta / bu ay / tüm zamanlar).
-- Veri: grup adı, damga / yanlış / kaçan sayısı, rastgele cihaz no. Kişisel bilgi yok.

-- v55 deneme sürümünün (rehber + ekipler) artık kullanılmayan parçaları
drop function if exists public.kasif_grup_ac(text);
drop function if exists public.kasif_ekip_yaz(text, text, text, int, int, int, boolean);
drop function if exists public.kasif_siralama(text, text);
drop table if exists public.kasif_ekip;
drop table if exists public.kasif_grup;

create table if not exists public.kasif_grup_skor (
  cihaz text primary key,
  ad text not null,
  damga int not null default 0,
  yanlis int not null default 0,
  kacan int not null default 0,
  bitti boolean not null default false,
  baslangic timestamptz not null default now(),
  guncelleme timestamptz not null default now()
);
alter table public.kasif_grup_skor enable row level security;
revoke all on public.kasif_grup_skor from anon, authenticated;

create or replace function public.kasif_grup_yaz(p_cihaz text, p_ad text, p_damga int, p_yanlis int, p_kacan int, p_bitti boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if char_length(coalesce(p_cihaz, '')) not between 8 and 40 then raise exception 'Geçersiz cihaz'; end if;
  if not exists (select 1 from kasif_grup_skor where cihaz = p_cihaz)
     and (select count(*) from kasif_grup_skor where baslangic > now() - interval '1 day') >= 300 then
    raise exception 'Günlük sınır'; end if;
  insert into kasif_grup_skor (cihaz, ad, damga, yanlis, kacan, bitti)
  values (p_cihaz, coalesce(nullif(left(btrim(p_ad), 24), ''), 'Grup'),
          least(greatest(coalesce(p_damga, 0), 0), 20), least(greatest(coalesce(p_yanlis, 0), 0), 99),
          least(greatest(coalesce(p_kacan, 0), 0), 20), coalesce(p_bitti, false))
  on conflict (cihaz) do update set ad = excluded.ad, damga = excluded.damga, yanlis = excluded.yanlis,
    kacan = excluded.kacan, bitti = excluded.bitti, guncelleme = now();
end $$;

-- Sıra: çok damga önde, eşitlikte az yanlış; o da eşitse aynı sıra (rank). Oynamaya başlayıp hiç damga
-- almamış gruplar listede görünmez (kendi grubu hariç). İlk 30 + kendi satırı.
create or replace function public.kasif_grup_siralama(p_donem text default 'tum', p_cihaz text default null)
returns json language sql security definer set search_path = public stable as $$
  with b as (
    select case p_donem
      when 'hafta' then date_trunc('week', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
      when 'ay' then date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
      else '-infinity'::timestamptz end as bas
  ), s as (
    select e.cihaz, e.ad, e.damga, e.yanlis, e.bitti, e.guncelleme,
           rank() over (order by e.damga desc, e.yanlis asc) as sira
    from kasif_grup_skor e, b
    where e.baslangic >= b.bas and (e.damga > 0 or e.bitti or e.cihaz = p_cihaz)
  )
  select json_build_object(
    'toplam', (select count(*) from s),
    'liste', coalesce((select json_agg(json_build_object('ad', t.ad, 'damga', t.damga, 'yanlis', t.yanlis, 'bitti', t.bitti,
        'sira', t.sira, 'ben', t.cihaz = p_cihaz) order by t.sira, t.guncelleme)
      from (select * from s order by sira, guncelleme limit 30) t), '[]'::json),
    'ben', (select json_build_object('ad', ad, 'damga', damga, 'yanlis', yanlis, 'bitti', bitti, 'sira', sira, 'ben', true)
      from s where cihaz = p_cihaz));
$$;

grant execute on function public.kasif_grup_yaz(text, text, int, int, int, boolean) to anon, authenticated;
grant execute on function public.kasif_grup_siralama(text, text) to anon, authenticated;
