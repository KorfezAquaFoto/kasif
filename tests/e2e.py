"""v14: görev akışı, QR, kayıt, çevrimdışı açılış ve ekran taşması testi."""
import asyncio, functools, http.server, os, pathlib, threading
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

async def main():
  handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT))
  server=http.server.ThreadingHTTPServer(('127.0.0.1',8765),handler)
  threading.Thread(target=server.serve_forever,daemon=True).start()
  async with async_playwright() as p:
    br=await p.chromium.launch()
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
      assert await pg.locator('.region-counter').inner_text()=='1 / 9'
      assert await pg.locator('.tip-fact').count()==1
      assert await pg.locator('.tip-heading').evaluate('(e)=>getComputedStyle(e).justifyContent')=='center'
      assert await pg.locator('.quick-tip').evaluate('(e)=>getComputedStyle(e).textAlign')=='center'
      await pg.click('#learn-next');await pg.locator('#v-scan.active').wait_for()
      await fits(pg,prefix+'-scan')
      await pg.click('#v-scan [data-back]');await pg.click('#learn-back')
      await pg.click('#btn-hints');await pg.locator('#v-hints.active').wait_for()
      await fits(pg,prefix+'-hints')
      stations=await pg.evaluate('KASIF.stations.map(s=>({region:s.region,tip:s.tip}))')
      for i,st in enumerate(stations):
        assert await pg.locator('#hint-region').inner_text()==await pg.evaluate('KASIF.regions['+repr(st['region'])+'].label')
        assert ' '.join((await pg.locator('#hint-copy').inner_text()).split())==' '.join(st['tip'].split())
        assert len(st['tip'].split())<=30
        await fits(pg,prefix+'-hint-region-'+str(i),False)
        if i<8: await pg.click('#hint-next')
      assert await pg.locator('#hint-next').is_disabled()
      await pg.click('#hint-home');await pg.locator('#v-home.active').wait_for();await pg.click('#btn-hints');await pg.click('#hint-go')
      await pg.fill('#in-code','PRN-3T9F');await pg.click('#manual-form button')
      await pg.locator('#v-quiz.active').wait_for();await fits(pg,prefix+'-quiz')
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
      for selector in ['.rw-page','.stamp-stage']:
        bounds=await pg.locator(selector).bounding_box()
        assert abs(bounds['x']+bounds['width']/2-width/2)<2,(prefix,selector,bounds)
      await pg.click('#rw-next')
      assert await pg.locator('.stop.got .stop-done').count() == 1
      stations=await pg.evaluate('KASIF.stations.map(s=>({id:s.id,code:s.code,answer:s.quiz.answer,reward:s.reward}))')
      # QR bağlantıları da bilgiden başlar; kodları değiştirmeden tüm görevler tamamlanır.
      for st in stations[1:]:
        await pg.goto(B+'#s='+st['code']);await lesson_to_quiz(pg,prefix+'-'+st['code'])
        wrong=(st['answer']+1)%3
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
      await pg.locator('#v-cert.active').wait_for();await fits(pg,prefix+'-final')
      await pg.click('#btn-preview');await pg.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
      await fits(pg,prefix+'-passport')
      await pg.click('#v-cert [data-back]');await fits(pg,prefix+'-complete')
      await pg.click('#btn-help');await pg.click('#help-close');await pg.click('#btn-menu');await fits(pg,prefix+'-menu')
      assert await pg.locator('#sound-toggle').get_attribute('aria-checked')=='false'
      await pg.click('#sound-toggle');assert await pg.evaluate("JSON.parse(localStorage.getItem('okyanus-kasifi-v1')).sound===true")
      await pg.click('#sound-toggle');assert await pg.locator('#sound-toggle').get_attribute('aria-checked')=='false'
      # Önbellek güncellemesi sonrası çevrimdışı açılış ve damgaların korunması.
      await pg.evaluate('navigator.serviceWorker.ready');await pg.wait_for_timeout(1000)
      await ctx.set_offline(True);await pg.reload();await pg.locator('#v-home.active').wait_for()
      assert '9/9' in await pg.locator('#me-count').inner_text()
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
    await pg.goto(B+'qr-kodlari.html')
    assert await pg.locator('.poster').count()==10
    assert await pg.locator('.poster .em image').count()==10
    assert await pg.locator('.code').all_text_contents()==codes
    await pg.evaluate("async()=>{const i=new Image();i.src=KASIF_ART_PACK.src;await i.decode()}")
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
  server.shutdown()
  print('PASS: 5 ekran boyutu, 9 görev, bilgi/gözlem, QR, final, kayıt ve çevrimdışı açılış')

asyncio.run(main())
