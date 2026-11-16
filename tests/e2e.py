"""v14: görev akışı, QR, kayıt, çevrimdışı açılış ve ekran taşması testi."""
import asyncio, functools, http.server, json, os, pathlib, threading
from playwright.async_api import async_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'tests' / 'out'; OUT.mkdir(exist_ok=True)
B = os.environ.get('BASE', 'http://127.0.0.1:8765/')

async def fits(pg, label, shot=True):
    await pg.wait_for_timeout(150)
    result = await pg.evaluate('''() => {
      const v=document.querySelector('.view.active'), r=v.getBoundingClientRect();
      const bad=[...v.querySelectorAll('button,input,.quick-tip,#hint-copy,.quiz-msg,.fact-card')].filter(e=>{
        const b=e.getBoundingClientRect(),s=getComputedStyle(e);
        return b.width && b.height && s.visibility!=='hidden' && (b.bottom>innerHeight+2 || b.top < -2 || b.left < -2 || b.right > innerWidth+2);
      }).map(e=>e.id||e.className);
      return {bad,overflow:v.scrollHeight>v.clientHeight+2,body:document.documentElement.scrollHeight>innerHeight+2};
    }''')
    assert not result['bad'] and not result['overflow'] and not result['body'], (label,result)
    if shot: await pg.screenshot(path=str(OUT / (label+'.png')))

async def lesson_to_quiz(pg, label='task'):
    await pg.locator('#v-learn.active').wait_for()
    await fits(pg,label+'-learn',False)
    await pg.click('#learn-next')
    await pg.locator('#v-quiz.active').wait_for()
    await fits(pg,label+'-quiz',False)

async def group_race(br):
  """v56 Grup Mücadelesi: grup tek telefonla oynar, gruplar arası sıralama (sahte Supabase, bellek içi)."""
  store={'rows':{},'down':False,'t':0}
  cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'POST, OPTIONS'}
  async def rpc(route):
    req=route.request
    if req.method=='OPTIONS': return await route.fulfill(status=204,headers=cors)
    if store['down']: return await route.abort()
    name=req.url.split('?')[0].rsplit('/',1)[1];body=json.loads(req.post_data or '{}')
    async def reply(obj,status=200): await route.fulfill(status=status,headers={**cors,'content-type':'application/json'},body=json.dumps(obj))
    if name=='kasif_grup_yaz':
      assert 8<=len(body['p_cihaz'])<=40
      store['t']+=1;old=store['rows'].get(body['p_cihaz'],{'donem':'hafta'})
      store['rows'][body['p_cihaz']]={'ad':body['p_ad'],'damga':body['p_damga'],'yanlis':body['p_yanlis'],'kacan':body['p_kacan'],'bitti':body['p_bitti'],'t':store['t'],'cihaz':body['p_cihaz'],'donem':old['donem']}
      return await route.fulfill(status=204,headers=cors,body='')
    if name=='kasif_grup_siralama':
      d=body['p_donem'];me=body.get('p_cihaz')
      ok={'hafta':['hafta'],'ay':['hafta','ay'],'tum':['hafta','ay','tum']}[d]
      rows=sorted([e for e in store['rows'].values() if e['donem'] in ok and (e['damga']>0 or e['bitti'] or e['cihaz']==me)],key=lambda e:(-e['damga'],e['yanlis'],e['t']))
      out=[]
      for i,e in enumerate(rows):
        sira=i+1 if not i or (e['damga'],e['yanlis'])!=(rows[i-1]['damga'],rows[i-1]['yanlis']) else out[-1]['sira']
        out.append({'ad':e['ad'],'damga':e['damga'],'yanlis':e['yanlis'],'bitti':e['bitti'],'sira':sira,'ben':e['cihaz']==me})
      ben=next(({**o,'ben':True} for o in out if o['ben']),None)
      return await reply({'toplam':len(out),'liste':out[:store.get('limit',30)],'ben':ben})
    return await reply({'message':'?'},404)
  errors=[]
  ctx=await br.new_context(viewport={'width':390,'height':844},has_touch=True,service_workers='block')
  await ctx.route('**/rest/v1/rpc/*',rpc)
  a=await ctx.new_page();a.on('pageerror',lambda e:errors.append(str(e)))
  def row(): return next(e for e in store['rows'].values() if e['ad']=='5-B Atatürk')
  async def modal_with(text):
    await a.wait_for_function("t=>!document.querySelector('#modal').classList.contains('hidden')&&document.querySelector('#modal').textContent.includes(t)",arg=text)
  async def answer(i): await a.click(f"#quiz-opts .opt:nth-child({i+1})")
  st=None
  # Girişte oyun türü: Grup Mücadelesi
  await a.goto(B);await a.locator('#v-welcome.active').wait_for()
  assert await a.locator('#mode-solo').get_attribute('aria-checked')=='true'
  await a.click('#mode-group')
  assert await a.locator('#name-label').inner_text()=='Grubunuzun adı'
  assert await a.locator('#in-name').get_attribute('maxlength')=='24'
  await fits(a,'grup-karsilama')
  await a.fill('#in-name','5-B Atatürk');await a.click('#btn-start')
  await a.locator('#v-home.active').wait_for();await modal_with('1 yanlış hakkınız')
  await a.click('#modal-btns button');assert await a.locator('#btn-race').is_visible()
  await fits(a,'grup-ana')
  assert row()['damga']==0
  st=await a.evaluate('KASIF.stations.map(s=>({id:s.id,code:s.code,answer:s.quiz.answer,n:s.quiz.options.length}))')
  # Pirana: 2 yanlış → damga kaçar, doğru bulunana kadar devam
  pir,mer=st[0],st[1];wrong=[i for i in range(pir['n']) if i!=pir['answer']]
  await a.goto(B+'#s='+pir['code']);await lesson_to_quiz(a,'grup-pirana')
  assert '1 yanlış hakkınız' in await a.locator('#quiz-msg').inner_text()
  await answer(wrong[0]);assert 'Son hakkınız' in await a.locator('#quiz-msg').inner_text()
  await answer(wrong[1]);assert 'kaçırdınız' in await a.locator('#quiz-msg').inner_text()
  await fits(a,'grup-kacti-soru')
  await a.goto(B+'#s='+pir['code']);await a.locator('#v-quiz.active').wait_for()   # QR yeniden: doğrudan soru
  assert 'kaçtı' in await a.locator('#quiz-msg').inner_text()
  await answer(pir['answer']);await a.locator('#v-reward.active.missed').wait_for();await a.wait_for_timeout(900)
  assert await a.locator('#rw-title').inner_text()=='Damga kaçtı'
  assert 'artık biliyorsunuz' in await a.locator('#rw-fact-title').text_content()
  await fits(a,'grup-kacti-damga')
  await a.click('#rw-next');await a.locator('#v-home.active').wait_for()
  assert await a.locator('.stop.missed[data-id="'+pir['id']+'"] .stop-done').inner_text()=='✕'
  assert await a.locator('.stop.on').get_attribute('data-id')==mer['id']
  await a.goto(B+'#s='+pir['code']);await modal_with('damga kaçtı');await a.click('#modal-btns button')
  await a.goto(B+'#s='+mer['code']);await lesson_to_quiz(a,'grup-mersin');await answer(mer['answer'])
  await a.locator('#v-reward.active:not(.missed)').wait_for();await a.click('#rw-next')
  await a.wait_for_timeout(300)
  assert {k:row()[k] for k in ('damga','yanlis','kacan','bitti')}=={'damga':1,'yanlis':2,'kacan':1,'bitti':False},row()
  # Başka gruplar: eşitlik aynı sırayı paylaşır; dönem sekmeleri
  for i,(ad,dm,yn,donem) in enumerate([('Yunuslar',2,0,'hafta'),('Ahtapotlar',1,1,'hafta'),('Mürenler',1,1,'hafta'),('Geçen ay',8,0,'tum'),('Bu ayın başı',3,0,'ay'),('Hiç damga yok',0,0,'hafta')]):
    store['t']+=1;c='x'*10+str(i);store['rows'][c]={'ad':ad,'damga':dm,'yanlis':yn,'kacan':0,'bitti':False,'t':store['t'],'cihaz':c,'donem':donem}
  await a.click('#btn-race');await a.locator('#v-race.active').wait_for()
  await a.wait_for_function("document.querySelectorAll('#race-list li').length===4")
  rows=await a.locator('#race-list li').all_inner_texts()
  assert '🥇' in rows[0] and 'Yunuslar' in rows[0],rows
  assert rows[1].startswith('🥈') and rows[2].startswith('🥈') and 'Ahtapotlar' in rows[1] and 'Mürenler' in rows[2],rows
  assert rows[3].startswith('4.') and '5-B Atatürk (siz)' in rows[3] and '⭐ 1 · 2 yanlış' in rows[3],rows
  assert 'Bu hafta 4 grup arasında 4. sıradasınız' in await a.locator('#race-me').inner_text()
  assert 'Son güncelleme' in await a.locator('#race-status').inner_text()
  await fits(a,'grup-siralama')
  await a.click('#race-tabs [data-donem="ay"]');await a.wait_for_function("document.querySelectorAll('#race-list li').length===5")
  await a.click('#race-tabs [data-donem="tum"]');await a.wait_for_function("document.querySelectorAll('#race-list li').length===6")
  assert 'Geçen ay' in (await a.locator('#race-list li').all_inner_texts())[0]
  # Kendi grubu ilk listede yoksa altta ayrıca gösterilir
  store['limit']=2;await a.click('#race-tabs [data-donem="hafta"]')
  await a.wait_for_function("document.querySelector('#race-list li.gap')&&document.querySelector('#race-list li.ben')")
  store.pop('limit')
  # İnternet yok: oyun sürer, skor bekler; bağlanınca gönderilir
  store['down']=True
  await a.click('#v-race [data-back]');await a.click('#btn-race')
  await a.wait_for_function("document.querySelector('#race-status').textContent.includes('İnternet yok')")
  await a.click('#v-race [data-back]')
  kes=st[2];await a.goto(B+'#s='+kes['code']);await lesson_to_quiz(a,'grup-kesis')
  await answer([i for i in range(kes['n']) if i!=kes['answer']][0]);await answer(kes['answer'])
  await a.locator('#v-reward.active:not(.missed)').wait_for();await a.click('#rw-next')
  assert await a.evaluate("JSON.parse(localStorage.getItem('okyanus-kasifi-v1')).group.dirty===true")
  store['down']=False;await a.evaluate("window.dispatchEvent(new Event('online'))")
  await a.wait_for_function("JSON.parse(localStorage.getItem('okyanus-kasifi-v1')).group.dirty===false")
  assert row()['damga']==2 and row()['yanlis']==3
  # Bitiş: son görev → "Mücadeleyi bitir" → sıralama + pasaport
  await a.evaluate("""ids=>{const s=JSON.parse(localStorage.getItem('okyanus-kasifi-v1'));ids.forEach((id,i)=>s.badges[id]=Date.now()+i);localStorage.setItem('okyanus-kasifi-v1',JSON.stringify(s));}""",[x['id'] for x in st[3:-1]])
  await a.reload();await a.locator('#v-home.active').wait_for()
  last=st[-1];await a.goto(B+'#s='+last['code']);await lesson_to_quiz(a,'grup-son');await answer(last['answer'])
  await a.locator('#v-reward.active').wait_for()
  assert await a.locator('#rw-next').inner_text()=='Mücadeleyi bitir 🏁'
  await a.click('#rw-next');await a.locator('#v-race.active').wait_for()
  n=len(st);assert f'Mücadeleyi bitirdiniz! {n-1}/{n} damga' in await a.locator('#race-finish-title').inner_text()
  await a.wait_for_function("document.querySelector('#race-list li.ben')&&document.querySelector('#race-list li.ben').dataset.rank==='1'")
  await fits(a,'grup-bitis')
  assert row()['bitti'] is True and row()['damga']==n-1
  await a.click('#race-cert');await a.locator('#v-cert.active.preview-passport').wait_for()
  await a.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
  await a.click('#v-cert [data-back]');await a.locator('#v-home.active').wait_for()
  await a.click('#road-end');await a.locator('#v-race.active #race-finish:not(.hidden)').wait_for()
  # Tek kişilik oyunda grup parçaları görünmez, sınırsız deneme sürer
  await a.evaluate("localStorage.clear()");await a.reload();await a.locator('#v-welcome.active').wait_for()
  await a.fill('#in-name','Tek');await a.click('#btn-start');await a.locator('#v-home.active').wait_for()
  assert not await a.locator('#btn-race').is_visible()
  assert not errors,errors
  await ctx.close()
  print('PASS: Grup Mücadelesi (tek telefon, kaçan damga, gruplar sıralaması, dönemler, çevrimdışı skor, bitiş)',flush=True)

async def main():
  handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
  server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),handler)
  threading.Thread(target=server.serve_forever,daemon=True).start()
  async with async_playwright() as p:
    br=await p.chromium.launch()
    if os.environ.get('GROUP_ONLY'):
      await group_race(br);await br.close();server.shutdown();return
    for width,height in [(320,568),(360,640),(390,844),(768,1024),(844,390)]:
      ctx=await br.new_context(viewport={'width':width,'height':height},has_touch=True)
      pg=await ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
      await pg.goto(B);await pg.locator('#v-welcome.active').wait_for()
      await pg.evaluate('document.fonts.load(\'600 16px "DynaPuff"\', "ÇĞİÖŞÜçğıöşü")')
      assert await pg.evaluate('document.fonts.check(\'600 16px "DynaPuff"\')')
      await pg.evaluate('document.fonts.ready')
      assert await pg.evaluate('Object.keys(KASIF_ART_PACK.sprites).length')==9
      assert await pg.evaluate("async()=>{const i=new Image();i.src=KASIF_ART_PACK.src;await i.decode();return i.naturalWidth}")==1254
      assert await pg.evaluate("async()=>{const i=new Image();i.src='logo2.png';await i.decode();return i.naturalWidth}")==1920
      assert await pg.locator('#v-welcome .brand-logo').count()==1
      assert await pg.locator('#v-welcome .field-label').evaluate('(e)=>getComputedStyle(e).textAlign')=='center'
      assert await pg.locator('#v-welcome .field>span').evaluate('(e)=>getComputedStyle(e).textAlign')=='center'
      assert await pg.locator('.welcome-brand .brand-logo').evaluate('(e)=>getComputedStyle(e).backgroundColor')=='rgba(0, 0, 0, 0)'
      # Her iki kapakta gerçek amblem kutusu daire merkezindedir; dalga kaldırıldı.
      assert await pg.locator('.pp-emblem > path').count()==0
      for emblem in await pg.locator('.pp-emblem > svg').all():
        assert await emblem.evaluate("(e)=>Math.abs(+e.getAttribute('x')+(+e.getAttribute('width'))/2-60)<.01 && Math.abs(+e.getAttribute('y')+(+e.getAttribute('height'))/2-60)<.01")
      prefix=f'{width}x{height}'
      await fits(pg,prefix+'-welcome')
      await pg.locator('#avatars button').nth(1).click()
      assert await pg.locator('#avatars button').nth(1).get_attribute('aria-pressed')=='true'
      assert await pg.locator('#avatars .avatar-check').count()==1
      await pg.fill('#in-name','Kaşif');await pg.click('#btn-start');await pg.wait_for_timeout(1200)
      opening=await pg.locator('.opening .book-open').bounding_box()
      assert opening and abs(opening['y']+opening['height']/2-height/2) < height*.15,(prefix,opening)
      ready=await pg.locator('#ready-msg').bounding_box()
      assert ready and opening['y']+opening['height'] <= ready['y']+2,(prefix,'opening overlap',opening,ready)
      await pg.screenshot(path=str(OUT/(prefix+'-opening.png')))
      await pg.wait_for_timeout(1600)
      await fits(pg,prefix+'-home')
      assert 'Buradasın' in await pg.locator('.stop.on .here-pin').inner_text()
      assert await pg.locator('.stop.on').get_attribute('aria-current') == 'step'
      await pg.click('.stop[data-id="fosil"]')
      assert 'duvarların yukarısındaki' in await pg.locator('.tg-where').inner_text()
      await fits(pg,prefix+'-fossil-location')
      await pg.click('.stop[data-id="pirana"]')
      await pg.click('#target-learn');await fits(pg,prefix+'-learn')
      await pg.reload();await pg.locator('#v-learn.active').wait_for()
      assert await pg.locator('#learn-heading').inner_text()=='Tanış ve bul'
      assert await pg.locator('.quick-tip').count()==1
      assert 'GÜNEY AMERİKA' in await pg.locator('#learn-region').inner_text()
      assert await pg.locator('.region-counter').inner_text()=='1 / '+str(await pg.evaluate('KASIF.stations.length'))
      assert await pg.locator('.tip-fact').count()==1
      assert await pg.locator('.tip-heading').evaluate('(e)=>getComputedStyle(e).justifyContent')=='center'
      assert await pg.locator('.quick-tip').evaluate('(e)=>getComputedStyle(e).textAlign')=='left'
      await pg.click('#learn-next');await pg.locator('#v-scan.active').wait_for()
      await fits(pg,prefix+'-scan')
      await pg.click('#v-scan [data-back]');await pg.click('#learn-back')
      await pg.click('#btn-hints');await pg.locator('#v-hints.active').wait_for()
      await fits(pg,prefix+'-hints')
      assert await pg.locator('#hint-copy').evaluate('(e)=>getComputedStyle(e).textAlign')=='left'
      stations=await pg.evaluate('KASIF.stations.map(s=>({region:s.region,tip:s.tip}))')
      for i,st in enumerate(stations):
        assert await pg.locator('#hint-region').inner_text()==await pg.evaluate('KASIF.regions['+repr(st['region'])+'].label')
        assert ' '.join((await pg.locator('#hint-copy').inner_text()).split())==' '.join(st['tip'].split())
        assert len(st['tip'].split())<=30
        await fits(pg,prefix+'-hint-region-'+str(i),False)
        if i<len(stations)-1: await pg.click('#hint-next')
      assert await pg.locator('#hint-next').is_disabled()
      await pg.click('#hint-home');await pg.locator('#v-home.active').wait_for();await pg.click('#btn-hints');await pg.click('#hint-go')
      await pg.fill('#in-code','PRN-3T9F');await pg.click('#manual-form button')
      await pg.locator('#v-quiz.active').wait_for();await fits(pg,prefix+'-quiz')
      if width==390:
        art_box=await pg.locator('#quiz-art').bounding_box()
        assert art_box['width']>=240 and art_box['height']>=180,('quiz art too small',art_box)
        await pg.screenshot(path=str(OUT/'quiz-large-pirana.png'))
      await pg.click('#quiz-opts .opt:nth-child(1)')
      assert 'İpucu' in await pg.locator('#quiz-msg').inner_text()
      await fits(pg,prefix+'-hint')
      await pg.click('#quiz-opts .opt:nth-child(2)')
      assert await pg.locator('#quiz-opts .right .l').inner_text()=='✓'
      if width==390:await pg.screenshot(path=str(OUT/(prefix+'-correct-answer.png')))
      await pg.wait_for_timeout(1100)
      await pg.wait_for_timeout(1300)
      await fits(pg,prefix+'-reward')
      assert 'keşfedildi!' in await pg.locator('#rw-title').inner_text()
      assert await pg.locator('#rw-fact').inner_text()==await pg.evaluate('KASIF.stations[0].reward')
      assert await pg.locator('#rw-fact-title').text_content()=='Biliyor muydun?'
      assert await pg.locator('#rw-fact-title').evaluate('(e)=>getComputedStyle(e).textAlign')=='center'
      assert await pg.locator('.fact-card').evaluate('(e)=>getComputedStyle(e).textAlign')=='center'
      assert await pg.locator('.leaf-hd').evaluate('(e)=>getComputedStyle(e).color')=='rgb(11, 79, 112)'
      page_box=await pg.locator('.rw-page').bounding_box()
      fact_box=await pg.locator('.fact-card').bounding_box()
      assert abs(page_box['x']-fact_box['x'])<1 and abs(page_box['width']-fact_box['width'])<1,(prefix,page_box,fact_box)
      assert await pg.locator('.big-stamp').evaluate("(e)=>{const m=new DOMMatrix(getComputedStyle(e).transform);return Math.abs(m.b)<.001&&Math.abs(m.c)<.001}")
      for selector in ['.rw-page','.stamp-stage']:
        bounds=await pg.locator(selector).bounding_box()
        assert abs(bounds['x']+bounds['width']/2-width/2)<2,(prefix,selector,bounds)
      await pg.click('#rw-next')
      assert await pg.locator('.stop.got .stop-done').count() == 1
      # Pusula: damgadan sonra sıradaki keşfin haritası kendiliğinden açılır
      await pg.locator('#guide:not(.hidden)').wait_for()
      assert await pg.locator('#gd-title').inner_text()==await pg.evaluate('KASIF.stations[1].name')
      assert await pg.locator('#gd-map .gd-here').count()==1 and await pg.locator('#gd-map .gd-target').count()==1
      await pg.wait_for_timeout(2300);await fits(pg,prefix+'-pusula')
      await pg.click('#gd-close');assert await pg.locator('#guide').evaluate("e=>e.classList.contains('hidden')")
      stations=await pg.evaluate('KASIF.stations.map(s=>({id:s.id,code:s.code,answer:s.quiz.answer,reward:s.reward}))')
      # QR bağlantıları da bilgiden başlar; kodları değiştirmeden tüm görevler tamamlanır.
      for st in stations[1:]:
        await pg.goto(B+'#s='+st['code']);await lesson_to_quiz(pg,prefix+'-'+st['code'])
        wrong=(st['answer']+1)%3
        if width==390 and st['id'] in ['fosil','mersin','megalodon']:
          await pg.screenshot(path=str(OUT/('quiz-large-'+st['id']+'.png')))
        await pg.click(f"#quiz-opts .opt:nth-child({wrong+1})")
        assert 'İpucu' in await pg.locator('#quiz-msg').inner_text()
        await fits(pg,prefix+'-'+st['code']+'-wrong-answer',False)
        await pg.click(f"#quiz-opts .opt:nth-child({st['answer']+1})")
        await pg.wait_for_timeout(1000)
        await fits(pg,prefix+'-'+st['code']+'-reward',False)
        assert await pg.locator('#rw-fact').inner_text()==st['reward']
        if width==390 and st['id'] in ['mersin','fosil']:
          await pg.wait_for_timeout(500)
          await pg.screenshot(path=str(OUT/(prefix+'-'+st['id']+'-new-fact.png')))
        await pg.click('#rw-next')
      await pg.locator('#v-cert.active').wait_for();await pg.wait_for_timeout(2100);await fits(pg,prefix+'-final')
      # v42: hazine sandığından sonra sertifika önizlemesi doğrudan açılır
      if not await pg.evaluate("document.querySelector('#v-cert').classList.contains('preview-passport')"):await pg.click('#btn-preview')
      await pg.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
      await fits(pg,prefix+'-passport')
      await pg.click('#v-cert [data-back]');await fits(pg,prefix+'-complete')
      await pg.click('#btn-help');await pg.click('#help-close');await pg.click('#btn-menu');await fits(pg,prefix+'-menu')
      assert await pg.locator('#sound-toggle').get_attribute('aria-checked')=='false'
      await pg.click('#sound-toggle');assert await pg.evaluate("JSON.parse(localStorage.getItem('okyanus-kasifi-v1')).sound===true")
      await pg.click('#sound-toggle');assert await pg.locator('#sound-toggle').get_attribute('aria-checked')=='false'
      # Önbellek güncellemesi sonrası çevrimdışı açılış ve damgaların korunması.
      await pg.evaluate('navigator.serviceWorker.ready');await pg.wait_for_timeout(1000)
      await ctx.set_offline(True);await pg.reload();await pg.locator('#v-home.active').wait_for()
      n=await pg.evaluate('KASIF.stations.length');assert f'{n}/{n}' in await pg.locator('#me-count').inner_text()
      assert not errors,errors
      await ctx.close()
    # Gerçek QR çözümleyici: jsQR ile giriş ve dokuz görev QR'ını çöz.
    ctx=await br.new_context();pg=await ctx.new_page();await pg.goto(B)
    await pg.add_script_tag(url=B+'vendor/qrcode.js')
    codes=await pg.evaluate('KASIF.stations.map(s=>s.code)')
    for code in codes:
      decoded=await pg.evaluate('''async code=>{
        const text=location.href.split('#')[0]+'#s='+code,q=qrcode(0,'M');q.addData(text);q.make();
        const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(q.createSvgTag({cellSize:8,margin:4}));await image.decode();
        const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,c.width,c.height);x.drawImage(image,0,0);
        return jsQR(x.getImageData(0,0,c.width,c.height).data,c.width,c.height)?.data;
      }''',code)
      assert decoded and decoded.endswith('#s='+code),(code,decoded)
    # Harici atlasın kaydedilen SVG/PNG içinde de gerçekten çizildiğini doğrula.
    await pg.evaluate('''async()=>{
      const src=KASIF_ART_PACK.src,blob=await(await fetch(src)).blob();
      const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob)});
      for(const key of Object.keys(ART)){
        const svg=artSVG(key).split(src).join(data),image=new Image();
        image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await image.decode();
        const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.drawImage(image,0,0,200,200);
        const pixels=x.getImageData(0,0,200,200).data;let solid=0;
        for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)solid++;
        if(solid<2500)throw new Error('Çizim dışa aktarımda boş: '+key+' '+solid);
        if(key==='megalodon'&&x.getImageData(100,100,1,1).data[3]>10)throw new Error('Çenenin iç boşluğu şeffaf değil');
      }
    }''')
    # Ses iptal edilince yanlışlıkla hata penceresi açılmamalı.
    await pg.fill('#in-name','Kaşif');await pg.click('#btn-start');await pg.wait_for_timeout(2800)
    # Hedef kartındaki 🧭: girişten ilk keşfe yol, "Tanış ve bul" görevi açar
    await pg.click('#target-map');await pg.locator('#guide:not(.hidden)').wait_for()
    assert 'Giriş' in await pg.locator('#gd-from').inner_text()
    await pg.click('#gd-go');await pg.locator('#v-learn.active').wait_for()
    assert await pg.locator('#learn-name').inner_text()==await pg.evaluate('KASIF.stations[0].name')
    await pg.click('#learn-back');await pg.locator('#v-home.active').wait_for()
    await pg.click('#target-learn')
    await pg.evaluate('''() => {
      let active=null;
      Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
        getVoices:()=>[],speak:u=>{active=u;},cancel:()=>{const u=active;active=null;if(u)setTimeout(()=>u.onerror({error:'interrupted'}),0);}
      }});
    }''')
    await pg.click('#v-learn [data-listen]');await pg.click('#learn-next');await pg.wait_for_timeout(100)
    assert await pg.locator('#modal').evaluate("e=>e.classList.contains('hidden')")
    await pg.set_viewport_size({'width':600,'height':600})
    assert await pg.evaluate('''() => Object.keys(ART).every(k=>!new DOMParser().parseFromString(artSVG(k),'image/svg+xml').querySelector('parsererror'))''')
    await pg.evaluate('''() => {
      const g=document.createElement('div');g.style.cssText='position:fixed;inset:0;z-index:100;background:#fff8ec;display:grid;grid-template-columns:repeat(3,1fr);padding:10px;gap:6px;color:#15384a';
      g.innerHTML=KASIF.stations.map(s=>'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:18px"><div style="width:155px;height:155px">'+artSVG(s.art)+'</div>'+s.name+'</div>').join('');document.body.append(g);
    }''')
    await pg.screenshot(path=str(OUT/'art-gallery.png'))
    await pg.evaluate("""()=>{document.body.lastElementChild.innerHTML=KASIF.stations.map(s=>'<div style="display:grid;justify-items:center;align-content:center;gap:3px;font-size:16px"><div style="width:168px;height:168px">'+stampSVG(s,{date:Date.now()})+'</div>'+s.name+'</div>').join('')}""")
    await pg.screenshot(path=str(OUT/'stamp-gallery.png'))
    await pg.goto(B+'qr-kodlari.html')
    n=await pg.evaluate('KASIF.stations.length')
    assert await pg.locator('.poster').count()==n+1
    assert await pg.locator('.poster .em image').count()==n+1
    assert await pg.locator('.code').all_text_contents()==codes
    await pg.evaluate("async()=>{const i=new Image();i.src=KASIF_ART_PACK.src;await i.decode()}")
    await group_race(br)
    await br.close()
  # Küçük bir görsel kontrol şeridi, test günlüğünden incelenebilir.
  import base64, io
  from PIL import Image
  names=['390x844-welcome.png','390x844-opening.png','390x844-learn.png','390x844-hints.png','390x844-passport.png']
  sheet=Image.new('RGB',(1250,542),'#0b3c6e')
  for i,name in enumerate(names):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((250,542));sheet.paste(im,(i*250,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=65)
  print('VISUAL_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  im=Image.open(OUT/'art-gallery.png').convert('RGB');im.thumbnail((600,600));data=io.BytesIO();im.save(data,format='JPEG',quality=75)
  print('ART_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  im=Image.open(OUT/'390x844-reward.png').convert('RGB');im.thumbnail((390,844));data=io.BytesIO();im.save(data,format='JPEG',quality=80)
  print('STAMP_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  sheet=Image.new('RGB',(1170,844),'#0b3c6e')
  for i,name in enumerate(['390x844-learn.png','390x844-hint.png','390x844-reward.png']):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((390,844));sheet.paste(im,(i*390,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=80)
  print('CONTENT_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  sheet=Image.new('RGB',(1170,844),'#0b3c6e')
  for i,name in enumerate(['390x844-learn.png','390x844-mersin-new-fact.png','390x844-fosil-new-fact.png']):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((390,844));sheet.paste(im,(i*390,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=80)
  print('NEW_FACTS_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  sheet=Image.new('RGB',(1170,844),'#0b3c6e')
  for i,name in enumerate(['390x844-learn.png','390x844-correct-answer.png','390x844-reward.png']):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((390,844));sheet.paste(im,(i*390,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=80)
  print('CHILD_FRIENDLY_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  im=Image.open(OUT/'stamp-gallery.png').convert('RGB');data=io.BytesIO();im.save(data,format='JPEG',quality=85)
  print('STAMP_GALLERY_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  sheet=Image.new('RGB',(1170,844),'#0b3c6e')
  for i,name in enumerate(['quiz-large-pirana.png','quiz-large-fosil.png','quiz-large-megalodon.png']):
    im=Image.open(OUT/name).convert('RGB');sheet.paste(im,(i*390,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=85)
  print('QUIZ_ART_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  server.shutdown()
  print('PASS: 5 ekran boyutu, tüm görevler, bilgi/gözlem, QR, final, kayıt ve çevrimdışı açılış')

asyncio.run(main())
