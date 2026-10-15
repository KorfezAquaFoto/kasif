"""Dar/kısa ekranlar, tarayıcı çubukları ve okunabilir içerik sınırları."""
import asyncio, functools, http.server, pathlib, threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'tests'/'out';OUT.mkdir(exist_ok=True)

async def check(pg,label):
    await pg.wait_for_timeout(100)
    result=await pg.evaluate('''()=>{
      const v=document.querySelector('.view.active'),vr=v.getBoundingClientRect();
      const all=[...v.querySelectorAll('button,input,.field-label,.field>span,#hint-copy,#learn-copy,.hint-subject,.fact-card,#rw-title')];
      const issues=[];
      for(const e of all){const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||s.display==='none')continue;
        if(r.top<vr.top-2||r.bottom>vr.bottom-5||r.left<vr.left-2||r.right>vr.right+2)issues.push(e.id||e.className);
        if((['hidden','clip','auto','scroll'].includes(s.overflowY)&&e.scrollHeight>e.clientHeight+2)||(['hidden','clip','auto','scroll'].includes(s.overflowX)&&e.scrollWidth>e.clientWidth+2))issues.push('clipped '+(e.id||e.className));
      }
      for(const id of ['hint-copy','learn-copy']){const e=v.querySelector('#'+id);if(!e)continue;const r=e.getBoundingClientRect();const card=e.closest('.paper').getBoundingClientRect();if(r.bottom>card.bottom-5)issues.push('card clipped '+id);}
      const av=[...v.querySelectorAll('#avatars button')].map(e=>e.getBoundingClientRect());
      if(av.some(r=>r.width<43||r.height<43))issues.push('avatar touch size');
      const subject=v.querySelector('.hint-subject'),bubble=v.querySelector('.guide-bubble');
      if(subject&&bubble){const a=subject.getBoundingClientRect(),b=bubble.getBoundingClientRect();if(a.left<b.right-1&&a.right>b.left+1&&a.top<b.bottom-1&&a.bottom>b.top+1)issues.push('hint overlap');}
      const stamp=v.querySelector('.rw-page'),fact=v.querySelector('.fact-card');
      if(stamp&&fact){const a=stamp.getBoundingClientRect(),b=fact.getBoundingClientRect();if(Math.abs(a.left-b.left)>1||Math.abs(a.width-b.width)>1)issues.push('reward card alignment');}
      if(subject&&innerHeight>innerWidth&&getComputedStyle(subject).display!=='none'){
        const art=subject.querySelector('.hint-art').getBoundingClientRect(),title=subject.querySelector('h2').getBoundingClientRect(),card=subject.getBoundingClientRect();
        if(Math.abs(art.left+art.width/2-card.left-card.width/2)>1||Math.abs(title.left+title.width/2-card.left-card.width/2)>1||art.bottom>title.top+1)issues.push('hint identity alignment');
      }
      if(stamp){const a=stamp.getBoundingClientRect(),b=v.querySelector('.big-stamp').getBoundingClientRect();if(b.left<a.left-1||b.right>a.right+1||b.top<a.top-1||b.bottom>a.bottom+1)issues.push('stamp outside card');}
      return {issues,overflow:v.scrollHeight>v.clientHeight+2};
    }''')
    if result['issues'] or result['overflow']:
      import base64
      print('FAIL_QA_BASE64:'+base64.b64encode(await pg.screenshot(type='jpeg',quality=75)).decode(),flush=True)
    assert not result['issues'] and not result['overflow'],(label,result)

async def main():
  server=http.server.ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
  threading.Thread(target=server.serve_forever,daemon=True).start()
  async with async_playwright() as p:
    br=await p.chromium.launch()
    for w,h,chrome in [(280,480,0),(320,480,0),(320,568,96),(360,640,110),(375,667,100),(390,844,120),(412,915,120),(430,932,120),(253,429,0),(844,390,0),(320,568,56),(360,780,112),(393,852,122),(414,896,122),(384,854,128),(428,926,128)]:
      ctx=await br.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,device_scale_factor=2)
      if chrome:
        await ctx.add_init_script(f"Object.defineProperty(window,'visualViewport',{{value:{{height:{h-chrome},width:{w},addEventListener(){{}}}}}})")
      pg=await ctx.new_page();await pg.goto('http://127.0.0.1:8766/');await pg.evaluate('document.fonts.ready')
      if w>=375:
        await pg.add_style_tag(content=':root{--safe-t:24px;--safe-b:24px}')
      await check(pg,f'{w}x{h}-welcome')
      if w in [280,320,375]: await pg.screenshot(path=str(OUT/f'responsive-{w}x{h}-welcome.png'))
      await pg.evaluate("localStorage.setItem('okyanus-kasifi-v1',JSON.stringify({v:1,id:'1234',name:'Uzun Kaşif Adı',avatar:'vatoz',badges:{},created:Date.now()}))")
      await pg.reload();await pg.click('#btn-hints')
      for i in range(9):
        await check(pg,f'{w}x{h}-hint-{i}')
        if i==0 and w in [280,320,375]:await pg.screenshot(path=str(OUT/f'responsive-{w}x{h}-hints.png'))
        if i==3 and w in [320,375,390]:await pg.screenshot(path=str(OUT/f'responsive-{w}x{h}-fossil.png'))
        if i<8:await pg.click('#hint-next')
      await pg.click('#hint-home')
      for st in await pg.evaluate('KASIF.stations.map(s=>s.id)'):
        await pg.click(f'.stop[data-id="{st}"]');await pg.click('#target-learn');await check(pg,f'{w}x{h}-learn-{st}')
        await pg.click('#learn-back')
      st=await pg.evaluate("KASIF.stations.find(s=>s.id==='korfez')")
      await pg.goto('http://127.0.0.1:8766/#s='+st['code']);await pg.click('#learn-next')
      await pg.click(f"#quiz-opts .opt:nth-child({st['quiz']['answer']+1})")
      await pg.wait_for_timeout(2000);await check(pg,f'{w}x{h}-reward')
      await pg.click('#rw-next')
      # Aynı telefonda tarayıcı çubuğu açılıp kapandığında düzen yeniden hesaplanır.
      if chrome:
        await pg.evaluate('(height)=>{visualViewport.height=height;window.dispatchEvent(new Event("resize"))}',h-80)
      else:
        await pg.set_viewport_size({'width':w,'height':max(429,h-100)})
      await pg.wait_for_timeout(250)
      await check(pg,f'{w}x{h}-resized-home')
      await pg.click('#btn-hints');await check(pg,f'{w}x{h}-resized-hint')
      await ctx.close()
    await br.close()
  server.shutdown()
  print('PASS: 16 mobile configurations, all 9 hints and lessons; touch sizes, clipping and overlaps')
  from PIL import Image,ImageOps,ImageDraw
  import io,base64
  names=['responsive-320x480-welcome.png','responsive-320x480-hints.png','responsive-375x667-welcome.png','responsive-375x667-hints.png']
  sheet=Image.new('RGB',(1000,600),'#fff');d=ImageDraw.Draw(sheet)
  for i,name in enumerate(names):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((240,560));sheet.paste(im,(i*250,28));d.text((i*250+4,4),name,fill='#000')
  b=io.BytesIO();sheet.save(b,format='JPEG',quality=85);print('RESPONSIVE_QA_BASE64:'+base64.b64encode(b.getvalue()).decode())

  names=['responsive-320x480-fossil.png','responsive-375x667-fossil.png','responsive-390x844-fossil.png']
  sheet=Image.new('RGB',(900,650),'#0b3c6e')
  for i,name in enumerate(names):
    im=Image.open(OUT/name).convert('RGB');im.thumbnail((300,650));sheet.paste(im,(i*300,0))
  data=io.BytesIO();sheet.save(data,format='JPEG',quality=85)
  print('CENTERED_HINTS_QA_BASE64:'+base64.b64encode(data.getvalue()).decode(),flush=True)

asyncio.run(main())

