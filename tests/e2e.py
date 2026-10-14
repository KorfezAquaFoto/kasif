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
      const bad=[...v.querySelectorAll('button,input,.intro-facts,.observe-text,.quiz-msg,.fact-card')].filter(e=>{
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
    assert await pg.locator('#learn-heading').inner_text() == 'Yakından bak'
    await fits(pg,label+'-observe',False)
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
      prefix=f'{width}x{height}'
      await fits(pg,prefix+'-welcome')
      await pg.fill('#in-name','Kaşif');await pg.click('#btn-start');await pg.wait_for_timeout(1200)
      opening=await pg.locator('.opening .book-open').bounding_box()
      assert opening and abs(opening['y']+opening['height']/2-height/2) < height*.15,(prefix,opening)
      ready=await pg.locator('#ready-msg').bounding_box()
      assert ready and opening['y']+opening['height'] <= ready['y']+2,(prefix,'opening overlap',opening,ready)
      await pg.screenshot(path=str(OUT/(prefix+'-opening.png')))
      await pg.wait_for_timeout(1600)
      await fits(pg,prefix+'-home')
      await pg.click('.stop[data-id="fosil"]')
      assert 'duvarların yukarısındaki' in await pg.locator('.tg-where').inner_text()
      await fits(pg,prefix+'-fossil-location')
      await pg.click('.stop[data-id="pirana"]')
      await pg.click('#target-learn');await fits(pg,prefix+'-learn')
      await pg.click('#learn-next');await fits(pg,prefix+'-observe')
      await pg.reload();await pg.locator('#v-learn.active').wait_for()
      assert await pg.locator('#learn-heading').inner_text()=='Yakından bak'
      await pg.click('#learn-next');await pg.locator('#v-scan.active').wait_for()
      await fits(pg,prefix+'-scan')
      await pg.fill('#in-code','PRN-3T9F');await pg.click('#manual-form button')
      await pg.locator('#v-quiz.active').wait_for();await fits(pg,prefix+'-quiz')
      await pg.click('#quiz-opts .opt:nth-child(1)')
      assert 'İpucu' in await pg.locator('#quiz-msg').inner_text()
      await fits(pg,prefix+'-hint')
      await pg.click('#quiz-opts .opt:nth-child(2)');await pg.wait_for_timeout(1100)
      await fits(pg,prefix+'-reward');await pg.click('#rw-next')
      stations=await pg.evaluate('KASIF.stations.map(s=>({code:s.code,answer:s.quiz.answer}))')
      # QR bağlantıları da bilgiden başlar; kodları değiştirmeden tüm görevler tamamlanır.
      for st in stations[1:]:
        await pg.goto(B+'#s='+st['code']);await lesson_to_quiz(pg,prefix+'-'+st['code'])
        await pg.click(f"#quiz-opts .opt:nth-child({st['answer']+1})")
        await pg.wait_for_timeout(1000)
        await pg.click('#rw-next')
      await pg.locator('#v-cert.active').wait_for();await fits(pg,prefix+'-final')
      await pg.click('#btn-preview');await pg.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
      await fits(pg,prefix+'-passport')
      await pg.click('#v-cert [data-back]');await fits(pg,prefix+'-complete')
      await pg.click('#btn-help');await pg.click('#help-close');await pg.click('#btn-menu');await fits(pg,prefix+'-menu')
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
    await br.close()
  # Küçük bir görsel kontrol şeridi, test günlüğünden incelenebilir.
  import base64, io
  from PIL import Image
  names=['390x844-welcome.png','390x844-opening.png','390x844-home.png','390x844-learn.png']
  sheet=Image.new('RGB',(1000,542),'#0b3c6e')
  for i,name in enumerate(names):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((250,542));sheet.paste(im,(i*250,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=65)
  print('VISUAL_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)
  server.shutdown()
  print('PASS: 5 ekran boyutu, 9 görev, bilgi/gözlem, QR, final, kayıt ve çevrimdışı açılış')

asyncio.run(main())
