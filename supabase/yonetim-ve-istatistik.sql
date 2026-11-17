-- Okyanus Kaşifi · v58 yönetim + yeni istatistikler. Supabase → SQL Editor → tamamını yapıştır → Run.
-- Bir kez çalıştırmak yeterli; tekrar çalıştırmak zarar vermez, veri silmez.
-- Gerektirir: docs/supabase-kurulum.sql ve supabase/grup-mucadelesi.sql daha önce çalıştırılmış olmalı.

-- ============ 1) Grup yönetimi ============
-- gizli: yönetici "sil" dedi; grup oynamaya devam etse de sıralamaya dönmez.
-- ad_kilit: yönetici adı düzeltti; telefondan gelen ad artık bunu değiştirmez.
alter table public.kasif_grup_skor add column if not exists gizli boolean not null default false;
alter table public.kasif_grup_skor add column if not exists ad_kilit boolean not null default false;

-- Yasaklı kelimeler. tam=false: adın içinde geçerse yakalanır; tam=true: yalnızca ayrı kelime olarak.
create table if not exists public.kasif_yasakli (
  kelime text primary key check (kelime ~ '^[a-z]{2,30}$'),
  tam boolean not null default false,
  eklenme timestamptz not null default now()
);
alter table public.kasif_yasakli enable row level security;
revoke all on public.kasif_yasakli from anon, authenticated;

-- Adı sadeleştirir: Türkçe harf → düz harf, 0/1/3/4/5/7/8/@/$ → harf, tekrarlanan harfler teke iner ("siiik" → "sik").
create or replace function public.kasif_sade(t text) returns text
language sql immutable set search_path = public as $$
  select regexp_replace(
    translate(lower(translate(coalesce(t, ''), 'İIÇĞÖŞÜÂÎÛ', 'iicgosuaiu')), 'çğıöşüâîû0134578@$!|', 'cgiosuaiuoieastbasii'),
    '(.)\1+', '\1', 'g')
$$;

create or replace function public.kasif_ad_uygun(p_ad text) returns boolean
language sql stable security definer set search_path = public as $$
  with n as (select kasif_sade(p_ad) as s)
  select not exists (
    select 1 from kasif_yasakli y, n
    where (not y.tam and regexp_replace(n.s, '[^a-z]', '', 'g') like '%' || y.kelime || '%')
       or (y.tam and y.kelime = any (regexp_split_to_array(n.s, '[^a-z]+'))))
$$;
revoke all on function public.kasif_ad_uygun(text) from public;
grant execute on function public.kasif_ad_uygun(text) to anon, authenticated;   -- oyun, grup adını yazarken sorar

-- Başlangıç listesi (dosyada düz yazı görünmesin diye base64; istatistik ekranında "Yasaklı kelimeler" altında görülür)
insert into public.kasif_yasakli (kelime, tam)
select k, false from regexp_split_to_table(convert_from(decode('b3Jvc3B1IHNpa3RpciBzaWtlcmltIHNpa2V5aW0gYW1jaWsgYW1pbmFrbyBnb3R2ZXJlbiBwZXpldmVuayBrYWhwZSB5YXZzYWsgc2VyZWZzaXoga2FsdGFrIHN1cnR1ayBkYWx5YXJhayBrZXJoYW5lIGlibmUgZ2VyaXpla2FsaSBkYW5nYWxhayBzYWxhayBhcHRhbCBhaG1hayBlbmF5aSBwb3JubyBmdWNrIGJpdGNo', 'base64'), 'UTF8'), ' ') k
union all
select k, true from regexp_split_to_table(convert_from(decode('c2lraXMgc2lraWsgc2lrIHNpa2ltIHNpa28gYW1pbmEgYW0gYW1rIGFtcSBhcSBvYyBtayBnb3QgeWFyYWsgdGFzYWsgcHVzdCBwaWMgZ2F2YXQgZ29kb3MgbWFsIHNla3Mgc2V4IHNoaXQgZGljaw==', 'base64'), 'UTF8'), ' ') k
on conflict (kelime) do nothing;

-- Oyunun yazdığı skor: yönetici adı düzelttiyse ad değişmez.
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
  on conflict (cihaz) do update set
    ad = case when kasif_grup_skor.ad_kilit then kasif_grup_skor.ad else excluded.ad end,
    damga = excluded.damga, yanlis = excluded.yanlis, kacan = excluded.kacan, bitti = excluded.bitti, guncelleme = now();
end $$;

-- Sıralama: silinen gruplar görünmez, uygunsuz ad "İsimsiz grup" görünür.
create or replace function public.kasif_grup_siralama(p_donem text default 'tum', p_cihaz text default null)
returns json language sql security definer set search_path = public stable as $$
  with b as (
    select case p_donem
      when 'hafta' then date_trunc('week', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
      when 'ay' then date_trunc('month', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
      else '-infinity'::timestamptz end as bas
  ), s as (
    select e.cihaz, case when kasif_ad_uygun(e.ad) then e.ad else 'İsimsiz grup' end as ad,
           e.damga, e.yanlis, e.bitti, e.guncelleme,
           rank() over (order by e.damga desc, e.yanlis asc) as sira
    from kasif_grup_skor e, b
    where e.baslangic >= b.bas and not e.gizli and (e.damga > 0 or e.bitti or e.cihaz = p_cihaz)
  )
  select json_build_object(
    'toplam', (select count(*) from s),
    'liste', coalesce((select json_agg(json_build_object('ad', t.ad, 'damga', t.damga, 'yanlis', t.yanlis, 'bitti', t.bitti,
        'sira', t.sira, 'ben', t.cihaz = p_cihaz) order by t.sira, t.guncelleme)
      from (select * from s order by sira, guncelleme limit 30) t), '[]'::json),
    'ben', (select json_build_object('ad', ad, 'damga', damga, 'yanlis', yanlis, 'bitti', bitti, 'sira', sira, 'ben', true)
      from s where cihaz = p_cihaz));
$$;

-- Yönetici: tüm gruplar (son 500) + yasaklı kelimeler
create or replace function public.kasif_yonetim_gruplar()
returns json language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
  return json_build_object(
    'gruplar', coalesce((select json_agg(json_build_object('cihaz', g.cihaz, 'ad', g.ad, 'damga', g.damga, 'yanlis', g.yanlis,
        'kacan', g.kacan, 'bitti', g.bitti, 'baslangic', g.baslangic, 'guncelleme', g.guncelleme, 'gizli', g.gizli,
        'ad_kilit', g.ad_kilit, 'uygun', kasif_ad_uygun(g.ad)) order by g.baslangic desc)
      from (select * from kasif_grup_skor order by baslangic desc limit 500) g), '[]'::json),
    'kelimeler', coalesce((select json_agg(json_build_object('kelime', kelime, 'tam', tam) order by kelime) from kasif_yasakli), '[]'::json));
end $$;

-- Yönetici: p_islem 'gizle' (sil) | 'goster' (geri al) | 'ad' (adı düzelt)
create or replace function public.kasif_yonetim_grup(p_cihaz text, p_islem text, p_ad text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
  if p_islem = 'gizle' then update kasif_grup_skor set gizli = true where cihaz = p_cihaz;
  elsif p_islem = 'goster' then update kasif_grup_skor set gizli = false where cihaz = p_cihaz;
  elsif p_islem = 'ad' then
    if char_length(btrim(coalesce(p_ad, ''))) = 0 then raise exception 'Ad boş olamaz'; end if;
    update kasif_grup_skor set ad = left(btrim(p_ad), 24), ad_kilit = true where cihaz = p_cihaz;
  else raise exception 'Bilinmeyen işlem'; end if;
end $$;

-- Yönetici: yasaklı kelime ekle / kaldır
create or replace function public.kasif_yonetim_kelime(p_kelime text, p_tam boolean default false, p_sil boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare k text := regexp_replace(kasif_sade(p_kelime), '[^a-z]', '', 'g');
begin
  if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
  if k !~ '^[a-z]{2,30}$' then raise exception 'Geçersiz kelime'; end if;
  if p_sil then delete from kasif_yasakli where kelime = k;
  else insert into kasif_yasakli (kelime, tam) values (k, coalesce(p_tam, false)) on conflict (kelime) do update set tam = excluded.tam;
  end if;
end $$;

revoke all on function public.kasif_yonetim_gruplar() from public, anon;
revoke all on function public.kasif_yonetim_grup(text, text, text) from public, anon;
revoke all on function public.kasif_yonetim_kelime(text, boolean, boolean) from public, anon;
grant execute on function public.kasif_yonetim_gruplar() to authenticated;
grant execute on function public.kasif_yonetim_grup(text, text, text) to authenticated;
grant execute on function public.kasif_yonetim_kelime(text, boolean, boolean) to authenticated;

-- ============ 2) Yeni istatistikler ============
-- yanlis_sik: görev başına hangi yanlış şık kaç kez seçildi (detail = şık sırası, 0'dan)
-- sureler: QR'ı bulma (Tanış ekranı → QR okutma) ve önceki damgadan bu damgaya geçen süre (ortanca, dk)
-- gunler: haftanın günlerine göre oyuna başlayan (1 = Pazartesi … 7 = Pazar)
-- grup_kacan: Grup Mücadelesinde görev başına kaç grubun damgası kaçtı (2+ yanlış)
create or replace function public.kasif_stats2(baslangic date, bitis date)
returns json language plpgsql stable security definer set search_path = public as $$
declare sonuc json;
begin
  if auth.uid() is null then raise exception 'Giriş gerekli'; end if;
  with e as (
    select device, event, station, detail, happened_at, (happened_at at time zone 'Europe/Istanbul') as yerel
    from events
    where not test and (happened_at at time zone 'Europe/Istanbul')::date between baslangic and bitis
  ),
  bul as (
    select l.device, l.station, extract(epoch from (min(s.happened_at) - min(l.happened_at))) / 60 as dk
    from e l join e s on s.device = l.device and s.station = l.station and s.event = 'scan' and s.happened_at > l.happened_at
    where l.event = 'learn' group by l.device, l.station
  ),
  dmg as (
    select device, station, happened_at, lag(happened_at) over (partition by device order by happened_at) as onceki
    from (select device, station, min(happened_at) as happened_at from e where event = 'stamp' group by device, station) x
  ),
  ara as (
    select station, extract(epoch from (happened_at - onceki)) / 60 as dk from dmg
    where onceki is not null and happened_at - onceki < interval '90 minutes'
  ),
  gc as (select distinct device from e where event = 'start' and detail = 'grup'),
  gk as (
    select station, count(*) filter (where n >= 2) as kacan, count(*) as oynayan
    from (select device, station, count(*) filter (where event = 'wrong') as n
          from e where station is not null and event in ('scan', 'wrong', 'stamp') and device in (select device from gc)
          group by device, station) x
    group by station
  )
  select json_build_object(
    'yanlis_sik', (select coalesce(json_agg(w), '[]'::json) from (
        select station, detail as sik, count(*) as adet, count(distinct device) as cihaz
        from e where event = 'wrong' and station is not null and detail ~ '^[0-9]$' group by station, detail) w),
    'sureler', (select coalesce(json_agg(t), '[]'::json) from (
        select st.station,
               (select percentile_cont(0.5) within group (order by dk) from bul where bul.station = st.station and dk < 60) as bulma_dk,
               (select count(*) from bul where bul.station = st.station and dk < 60) as bulma_adet,
               (select percentile_cont(0.5) within group (order by dk) from ara where ara.station = st.station) as ara_dk,
               (select count(*) from ara where ara.station = st.station) as ara_adet
        from (select distinct station from e where station is not null) st) t),
    'gunler', (select coalesce(json_agg(g order by g.gun), '[]'::json) from (
        select extract(isodow from yerel)::int as gun, count(distinct device) filter (where event = 'start') as oyuncu,
               count(distinct device) as cihaz
        from e group by 1) g),
    'grup_kacan', (select coalesce(json_agg(k), '[]'::json) from (select * from gk) k)
  ) into sonuc;
  return sonuc;
end $$;
revoke all on function public.kasif_stats2(date, date) from public, anon;
grant execute on function public.kasif_stats2(date, date) to authenticated;
