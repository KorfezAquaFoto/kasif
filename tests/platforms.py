"""WebKit, klavye, büyük yazı, kayıt hatası, kamera yaşamı ve cache kapsamı."""
import asyncio,functools,http.server,pathlib,threading,base64,io
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'tests'/'out';OUT.mkdir(exist_ok=True)
B='http://127.0.0.1:8767/'
KEY='okyanus-kasifi-v1'
SEED={'v':1,'id':'1234','name':'Kaşif','avatar':'vatoz','badges':{},'created':1}
async def bounds(pg,label):
 await pg.wait_for_timeout(350)
 result=await pg.evaluate('''()=>{
  const v=document.querySelector('.view.active'),vr=v.getBoundingClientRect();
  return [...v.querySelectorAll('button,input,#hint-copy,.quick-tip')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&(r.top<vr.top-2||r.bottom>vr.bottom-4||r.left<vr.left-2||r.right>vr.right+2)}).map(e=>e.id||e.className);
 }''')
 if result:
  print('PLATFORM_FAIL_BASE64:'+base64.b64encode(await pg.screenshot(type='jpeg',quality=75)).decode(),flush=True)
  extra=await pg.evaluate('({height:innerHeight,visual:visualViewport.height,app:getComputedStyle(document.documentElement).getPropertyValue("--app-height"),scrollY,layout:document.documentElement.dataset.layout})')
  print('PLATFORM_BOUNDS:'+str(extra),flush=True)
 assert not result,(label,result)

async def certificate_cases(pg,engine):
 await pg.add_init_script("""(()=>{
  window.__certTexts=[];window.__certArcs=[];
  const proto=CanvasRenderingContext2D.prototype,fill=proto.fillText,arc=proto.arc;
  proto.fillText=function(value,x,y,...rest){
   if(this.canvas.width===1080&&this.canvas.height===1350){
    const m=this.measureText(value);
    const matrix=this.getTransform();
    const points=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent]].map(([a,b])=>new DOMPoint(a,b).matrixTransform(matrix));
    window.__certTexts.push({value:String(value),left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))});
   }
   return fill.call(this,value,x,y,...rest);
  };
  proto.arc=function(x,y,r,...rest){
   if(this.canvas.width===1080&&this.canvas.height===1350)window.__certArcs.push({x,y,r});
   return arc.call(this,x,y,r,...rest);
  };
 })()""")
 cases=[('Deniz',a) for a in ['kesis','vatoz','orfoz','pirana','mersin','karagoz']]
 cases += [('WWWWWWWWWWWWWWWW','mersin'),('Çağrı İpek','vatoz')]
 for index,(name,avatar) in enumerate(cases):
  await pg.evaluate("""({name,avatar})=>{
   const time=Date.parse('2026-10-15T10:00:00Z');
   localStorage.setItem('okyanus-kasifi-v1',JSON.stringify({v:1,id:'2026',name,avatar,badges:Object.fromEntries(KASIF.stations.map(s=>[s.id,time])),created:time}));
  }""",{'name':name,'avatar':avatar})
  if index==6:await pg.set_viewport_size({'width':280,'height':480})
  if index==7:await pg.emulate_media(reduced_motion='reduce')
  await pg.reload();await pg.click('#btn-cert')
  if index==0:
   await pg.wait_for_timeout(80);await pg.screenshot(path=str(OUT/f'final-closed-{engine}.png'))
   await pg.wait_for_timeout(500);await pg.screenshot(path=str(OUT/f'final-opening-{engine}.png'))
   await pg.wait_for_timeout(850);await pg.screenshot(path=str(OUT/f'final-press-{engine}.png'))
  await pg.wait_for_timeout(700 if index==0 else 2100)
  final=await pg.evaluate("""()=>{
   const book=document.querySelector('.final-book').getBoundingClientRect(),page=document.querySelector('.final-right-page').getBoundingClientRect(),seal=document.querySelector('#final-seal').getBoundingClientRect(),friend=document.querySelector('#final-friend').getBoundingClientRect(),name=document.querySelector('#final-name'),nr=name.getBoundingClientRect();
   return {coverHidden:getComputedStyle(document.querySelector('#final-cover')).visibility==='hidden'||getComputedStyle(document.querySelector('#final-cover')).display==='none',inside:seal.left>=page.left&&seal.right<=page.right&&seal.top>=page.top&&seal.bottom<=page.bottom,centered:Math.abs((book.left+book.right)/2-innerWidth/2)<2,ink:+getComputedStyle(document.querySelector('#final-seal')).opacity,friend:friend.width>20&&friend.height>20,nameFits:name.scrollWidth<=name.clientWidth+1&&nr.bottom<=book.bottom&&nr.top>=book.top,visible:book.top>=0&&book.bottom<=visualViewport.height};
  }""")
  assert all(final.values()),(engine,name,final)
  await bounds(pg,f'{engine}-final-book-{index}')
  if index in [0,6,7]:await pg.screenshot(path=str(OUT/f'final-open-{engine}-{index}.png'))
  await pg.click('#btn-preview')
  if index==6:await pg.set_viewport_size({'width':390,'height':844})
  if index==7:await pg.emulate_media(reduced_motion='no-preference')
  await pg.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
  result=await pg.evaluate("""name=>{
   const texts=__certTexts,hero=texts.find(t=>t.value===name&&t.top<400),circle=__certArcs.find(t=>t.r===80);
   const problems=[];
   const letters=texts.filter(t=>t.value.trim().length===1&&t.top<200);
   if(letters.length<10||((letters[0].top+letters[0].bottom+letters[letters.length-1].top+letters[letters.length-1].bottom)/4-(letters[Math.floor(letters.length/2)].top+letters[Math.floor(letters.length/2)].bottom)/2)<10)problems.push('curved certificate heading');
   if(!hero||!circle||Math.abs((hero.top+hero.bottom)/2-circle.y)>1)problems.push('avatar/name vertical alignment');
   if(hero&&circle&&(hero.left<circle.x+circle.r+20||hero.right>1010))problems.push('name overlaps or clips');
   if(texts.some(t=>t.left<65||t.right>1015||t.top<60||t.bottom>1245))problems.push('certificate text outside page');
   if(texts.some(t=>/tamamlayarak|oldun|hepsini keşfetti/.test(t.value)))problems.push('removed sentence returned');
   const dates=texts.filter(t=>t.value==='15 Ekim 2026'),seal=__certArcs.find(t=>t.r===36);
   if(dates.length!==1)problems.push('single completion date');
   if(dates.length&&Math.abs((dates[0].left+dates[0].right)/2-540)>2)problems.push('completion date not centered');
   if(!seal||!hero||hero.right+24>seal.x-45||Math.abs(seal.y-circle.y)>1)problems.push('name/seal clearance');
   if(!texts.some(t=>t.value==='9 / 9'&&t.top<400))problems.push('discovery seal beside name');
   for(const st of KASIF.stations){
    if(!texts.some(t=>t.value===st.name&&t.top>500))problems.push('missing creature caption '+st.id);
    const svg=stampSVG(st,{certificate:true});
    if(/2026|KÖRFEZ AQUA/.test(svg)||!svg.includes('★ ★ ★')||new DOMParser().parseFromString(svg,'image/svg+xml').querySelector('parsererror'))problems.push('certificate stamp '+st.id);
   }
   return {problems,hero,circle};
  }""",name)
  assert not result['problems'],(engine,name,avatar,result)
  await bounds(pg,f'{engine}-certificate-{index}')
  data=await pg.locator('#cert-img').get_attribute('src')
  (OUT/f'certificate-{engine}-{index}.png').write_bytes(base64.b64decode(data.split(',',1)[1]))

async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',8767),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  for engine in [p.chromium,p.webkit]:
   br=await engine.launch()
   for w,h in [(320,568),(375,667),(390,844)]:
    ctx=await br.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True)
    pg=await ctx.new_page();await pg.goto(B);await pg.evaluate('document.fonts.ready');await bounds(pg,f'{engine.name}-{w}-welcome')
    if w==320:
     await pg.evaluate('''async()=>{
      const src=KASIF_ART_PACK.src,blob=await(await fetch(src)).blob();
      const data=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(blob)});
      const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(artSVG('mersin').split(src).join(data));await image.decode();
      const c=document.createElement('canvas');c.width=c.height=200;const x=c.getContext('2d');x.drawImage(image,0,0,200,200);
      const pixels=x.getImageData(0,0,200,200).data;let solid=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>128)solid++;
      if(solid<2500)throw new Error('Yeni çizim tarayıcıda boş');
     }''')
    await pg.focus('#in-name');await pg.set_viewport_size({'width':w,'height':300});await pg.fill('#in-name','Kaşif')
    await pg.wait_for_function("""()=>{const r=document.querySelector('#in-name').getBoundingClientRect();return r.top>=0&&r.bottom<=visualViewport.height+2}""",timeout=3000)
    r=await pg.locator('#in-name').bounding_box();assert r['y']>=0 and r['y']+r['height']<=302,(engine.name,'keyboard',r)
    await pg.press('#in-name','Enter');assert await pg.evaluate('document.activeElement.id')!='in-name'
    await pg.set_viewport_size({'width':w,'height':h});await bounds(pg,f'{engine.name}-{w}-keyboard-close')
    await pg.evaluate('(s)=>localStorage.setItem("okyanus-kasifi-v1",JSON.stringify(s))',SEED)
    await pg.reload();await pg.click('#btn-help');await pg.wait_for_timeout(400)
    # WebKit'te pencere açılış animasyonu ve alt piksel yuvarlaması yerleşene kadar bekle.
    await pg.wait_for_function("""()=>{const d=document.querySelector('#help .drawer-box').getBoundingClientRect(),l=document.querySelector('#howto'),b=document.querySelector('#help-close').getBoundingClientRect();window.__helpLayout={top:d.top,bottom:d.bottom,viewport:visualViewport.height,scroll:l.scrollHeight,client:l.clientHeight};return d.top>=0&&d.bottom<=visualViewport.height+2&&b.bottom<=d.bottom+2&&l.scrollHeight<=l.clientHeight+2&&[...l.querySelectorAll('p')].every(e=>getComputedStyle(e).textAlign==='left')}""",timeout=3000)
    await pg.click('#help-close');await pg.click('#btn-hints')
    for i in range(9):
     await bounds(pg,f'{engine.name}-{w}-hint-{i}')
     if i<8:await pg.click('#hint-next')
    # Yeni damga, her iki tarayıcıda da karta sığmalı ve düz durmalı.
    await pg.click('#hint-home')
    st=await pg.evaluate("KASIF.stations.find(s=>s.id==='korfez')")
    await pg.goto(B+'#s='+st['code']);await pg.click('#learn-next')
    await bounds(pg,f'{engine.name}-{w}-quiz')
    if w==390:
      r=await pg.locator('#quiz-art').bounding_box()
      assert r['width']>=240 and r['height']>=180,(engine.name,'quiz art size',r)
    await pg.click(f"#quiz-opts .opt:nth-child({(st['quiz']['answer']+1)%3+1})")
    await bounds(pg,f'{engine.name}-{w}-quiz-clue')
    await pg.click(f"#quiz-opts .opt:nth-child({st['quiz']['answer']+1})")
    await pg.wait_for_timeout(1800);await bounds(pg,f'{engine.name}-{w}-stamp')
    assert await pg.evaluate("""()=>{const a=document.querySelector('.rw-page').getBoundingClientRect(),b=document.querySelector('.big-stamp').getBoundingClientRect(),m=new DOMMatrix(getComputedStyle(document.querySelector('.big-stamp')).transform);return b.left>=a.left-1&&b.right<=a.right+1&&b.top>=a.top-1&&b.bottom<=a.bottom+1&&Math.abs(m.b)<.001&&Math.abs(m.c)<.001}"""),(engine.name,w,'stamp containment')
    await pg.click('#rw-next');await pg.click('#btn-hints')
    # Azaltılmış hareket tercihinde canlı hareketi durmalı.
    await pg.emulate_media(reduced_motion='reduce')
    await pg.click('#hint-home');await pg.click('#target-learn')
    assert await pg.locator('#learn-art>svg').evaluate('(e)=>getComputedStyle(e).animationName')=='none'
    await bounds(pg,f'{engine.name}-{w}-reduced-motion')
    await pg.click('#learn-back');await pg.click('#btn-hints');await pg.emulate_media(reduced_motion='no-preference')
    # Kullanıcı yazıyı büyüttüğünde metnin tamamı erişilebilir kalır.
    await pg.add_style_tag(content='.guide-bubble p,.quick-tip{font-size:24px!important}')
    await pg.click('#hint-home');await pg.click('#btn-hints')
    for i in range(9):
     await pg.wait_for_timeout(100)
     card=pg.locator('.hint-card');await card.evaluate('(e)=>e.scrollTop=e.scrollHeight')
     assert await pg.locator('#hint-copy').inner_text()
     r=await pg.locator('#hint-copy').bounding_box();c=await card.bounding_box();assert r['y']+r['height']<=c['y']+c['height']+2,(engine.name,w,'large-font',i,r,c)
     if i<8:await pg.click('#hint-next')
    if w==390:await certificate_cases(pg,engine.name)
    await ctx.close()
   await br.close()
  # Başarısız kaydı görünür bildir, izin düzelince yeniden kaydet.
  br=await p.chromium.launch(args=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'])
  ctx=await br.new_context(viewport={'width':390,'height':844},permissions=['camera'])
  await ctx.add_init_script('''window.__denySave=true;const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='okyanus-kasifi-v1'&&window.__denySave)throw new DOMException('Blocked','QuotaExceededError');return original.call(this,k,v)}''')
  pg=await ctx.new_page();await pg.goto(B);await pg.fill('#in-name','Kaşif');await pg.click('#btn-start');await pg.locator('#modal:not(.hidden)').wait_for()
  assert 'kaydedilemedi' in await pg.locator('#modal-title').inner_text()
  await pg.wait_for_timeout(600)
  await pg.screenshot(path=str(OUT/'storage-warning.png'))
  await pg.get_by_role('button',name='Oynamaya devam et',exact=True).click();await pg.locator('#v-home.active').wait_for()
  await pg.evaluate('window.__denySave=false');await pg.click('#btn-menu');await pg.click('#save-retry')
  assert await pg.evaluate("!!JSON.parse(localStorage.getItem('okyanus-kasifi-v1'))")
  assert await pg.locator('#save-warning').evaluate('(e)=>e.classList.contains("hidden")')
  await pg.click('#v-menu [data-back]');await pg.click('#btn-scan',force=True)
  await pg.wait_for_function('document.querySelector("#video").videoWidth>0')
  await pg.evaluate('window.auditTracks=document.querySelector("#video").srcObject.getTracks()')
  await pg.click('#v-scan [data-back]');assert await pg.evaluate('auditTracks.every(t=>t.readyState==="ended")')
  # Bir sonraki service worker etkinleşirken başka uygulamanın cache'i korunmalı.
  await pg.evaluate('navigator.serviceWorker.ready')
  await pg.evaluate('''async()=>{await (await navigator.serviceWorker.getRegistration()).unregister();for(const k of ['another-app-cache','kasif-obsolete']){const c=await caches.open(k);await c.put('/probe',new Response('ok'))}await navigator.serviceWorker.register('sw.js?scope-test=1')}''')
  await pg.wait_for_function('''async()=>{const keys=await caches.keys();return keys.includes('another-app-cache')&&!keys.includes('kasif-obsolete')}''')
  await ctx.close();await br.close()
 server.shutdown()
 print('PASS: Chromium + WebKit, keyboard, 24px text, storage retry, camera cleanup and isolated cache cleanup',flush=True)
 from PIL import Image
 im=Image.open(OUT/'storage-warning.png').convert('RGB');im.thumbnail((390,844));b=io.BytesIO();im.save(b,format='JPEG',quality=80);print('STORAGE_QA_BASE64:'+base64.b64encode(b.getvalue()).decode(),flush=True)
 sheet=Image.new('RGB',(1080,675),'#0b3c6e')
 for i,index in enumerate([0,6]):
  im=Image.open(OUT/f'certificate-chromium-{index}.png').convert('RGB');im.thumbnail((540,675));sheet.paste(im,(i*540,0))
 b=io.BytesIO();sheet.save(b,format='JPEG',quality=85)
 print('CERTIFICATE_QA_BASE64:'+base64.b64encode(b.getvalue()).decode(),flush=True)
asyncio.run(main())
