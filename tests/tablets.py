"""Tablet yön değişimi, içerik sınırları ve performans regresyonları."""
import asyncio,os,pathlib,functools,http.server,threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'tests/out';OUT.mkdir(exist_ok=True)

async def fits(pg,label):
 await pg.wait_for_timeout(330)
 result=await pg.evaluate("""()=>{
  const v=document.querySelector('.view.active'),box=v.getBoundingClientRect(),issues=[];
  for(const e of [...v.querySelectorAll('button,input,h1,h2,#learn-copy,#hint-copy,.fact-card,.quiz-art,.target,.final-book,#cert-img')].filter(e=>!e.closest('.iso'))){
   const r=e.getBoundingClientRect(),s=getComputedStyle(e);if(!r.width||!r.height||s.display==='none')continue;
   if(r.left<box.left-2||r.right>box.right+2||r.top<box.top-2||r.bottom>box.bottom+2)issues.push('outside '+(e.id||e.className));
   if(e.scrollWidth>e.clientWidth+2&&s.overflowX!=='visible')issues.push('clipped '+(e.id||e.className));
   if(e.matches('.icon-btn,input,.opt,.avatars button')&&(r.height<44||r.width<44))issues.push('small target '+e.className);
  }
  if(v.scrollHeight>v.clientHeight+2)issues.push('page needs scrolling');
  for(const id of ['learn-copy','hint-copy']){const e=v.querySelector('#'+id);if(!e)continue;const card=e.closest('.paper'),r=e.getBoundingClientRect(),c=card.getBoundingClientRect();if(r.bottom>c.bottom-5||card.scrollHeight>card.clientHeight+2)issues.push('hidden copy '+id);}
  const title=v.querySelector('#quiz-q'),art=v.querySelector('#quiz-art');if(title&&art){const a=title.getBoundingClientRect(),b=art.getBoundingClientRect();if(a.left<b.right-2&&a.right>b.left+2&&a.top<b.bottom-2&&a.bottom>b.top+2)issues.push('quiz overlap');}
  return issues;
 }""")
 if result:await pg.screenshot(path=str(OUT/(label+'-FAIL.png')))
 assert not result,(label,result)

async def tablet_cases(br,engine,base,configs=None):
 configs=configs or [(600,960),(768,1024),(1024,768),(1366,1024)]
 for w,h in configs:
  label=f'tablet-{engine}-{w}x{h}'
  ctx=await br.new_context(viewport={'width':w,'height':h},device_scale_factor=2,has_touch=True)
  pg=await ctx.new_page();await pg.goto(base);await pg.evaluate('document.fonts.ready')
  await fits(pg,label+'-welcome');await pg.screenshot(path=str(OUT/(label+'-welcome.png')))
  perf=await pg.evaluate("""async()=>{await new Promise(r=>setTimeout(r,200));const original=requestAnimationFrame;let calls=0;window.requestAnimationFrame=fn=>{calls++;return original(fn)};for(let i=0;i<20;i++)dispatchEvent(new Event('resize'));await new Promise(r=>setTimeout(r,250));window.requestAnimationFrame=original;return calls}""")
  assert perf<=4,(label,'resize burst',perf)
  await pg.evaluate("localStorage.setItem('okyanus-kasifi-v1',JSON.stringify({v:1,id:'tablet',name:'Uzun Kaşif Adı',avatar:'vatoz',badges:{},created:1}))")
  await pg.reload();await fits(pg,label+'-home');await pg.screenshot(path=str(OUT/(label+'-home.png')))
  width=await pg.locator('#v-home').evaluate('(e)=>e.clientWidth');assert width>=w*.75,(label,'phone column',width)
  await pg.click('#btn-help');await pg.wait_for_timeout(400)
  assert await pg.evaluate("document.querySelector('#howto').scrollHeight<=document.querySelector('#howto').clientHeight+2"),(label,'help scrolling')
  await pg.click('#help-close');await pg.click('#btn-hints')
  for i in range(9):
   await fits(pg,label+f'-hint-{i}')
   if i==3:await pg.screenshot(path=str(OUT/(label+'-fossil.png')))
   if i<8:await pg.click('#hint-next')
  await pg.click('#hint-home')
  stations=await pg.evaluate("KASIF.stations.filter(s=>['pirana','fosil','megalodon'].includes(s.id))")
  for st in stations:
   await pg.goto(base+'#s='+st['code']);await fits(pg,label+'-learn-'+st['id'])
   if st['id']=='fosil':await pg.screenshot(path=str(OUT/(label+'-learn.png')))
   if st['id']!='pirana':await pg.click('#learn-back');continue
   await pg.click('#learn-next');await fits(pg,label+'-quiz');await pg.screenshot(path=str(OUT/(label+'-quiz.png')))
   await pg.click(f"#quiz-opts .opt:nth-child({(st['quiz']['answer']+1)%3+1})");await fits(pg,label+'-wrong')
   await pg.click(f"#quiz-opts .opt:nth-child({st['quiz']['answer']+1})");await pg.wait_for_timeout(1600)
   await fits(pg,label+'-reward');await pg.screenshot(path=str(OUT/(label+'-reward.png')))
   pixels=await pg.evaluate("document.querySelector('#confetti').width*document.querySelector('#confetti').height")
   assert pixels<=3000000,(label,'confetti pixel budget',pixels)
   await pg.click('#rw-next');await pg.wait_for_function("document.querySelector('#confetti').width===1",timeout=4000)
  await pg.click('#btn-scan');await pg.wait_for_timeout(300);await fits(pg,label+'-scan')
  assert await pg.evaluate("getComputedStyle(document.querySelector('.swimmer')).animationPlayState==='paused'"),(label,'scan background animation')
  await pg.click('#v-scan [data-back]');await pg.click('#btn-menu');await fits(pg,label+'-menu');await pg.click('#v-menu [data-back]')
  await pg.set_viewport_size({'width':h,'height':w});await fits(pg,label+'-rotated-home')
  await pg.click('#btn-hints');await fits(pg,label+'-rotated-hint');await pg.click('#hint-home')
  await pg.set_viewport_size({'width':540,'height':720});await fits(pg,label+'-split-home')
  assert await pg.evaluate("document.documentElement.dataset.tablet==='false'"),(label,'split screen fallback')
  await pg.set_viewport_size({'width':w,'height':h})
  await pg.evaluate("localStorage.setItem('okyanus-kasifi-v1',JSON.stringify({v:1,id:'tablet',name:'Uzun Kaşif Adı',avatar:'vatoz',badges:Object.fromEntries(KASIF.stations.map(s=>[s.id,Date.now()])),created:1}))")
  await pg.reload();await pg.click('#btn-cert');await pg.wait_for_timeout(2200);await fits(pg,label+'-final')
  await pg.screenshot(path=str(OUT/(label+'-final.png')))
  await pg.click('#btn-preview');await pg.wait_for_function("document.querySelector('#cert-img').naturalWidth===1080");await fits(pg,label+'-preview')
  await pg.screenshot(path=str(OUT/(label+'-preview.png')))
  print('PASS',label,'resize frames',perf,flush=True)
  await ctx.close()

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass
async def main():
 server=Server(('127.0.0.1',8774),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  br=await p.chromium.launch(executable_path=os.environ.get('KASIF_BROWSER'))
  await tablet_cases(br,'chrome','http://127.0.0.1:8774/',[(600,960),(768,1024),(820,1180),(1024,768),(1180,820),(1280,800),(1366,1024)])
  await br.close()
 server.shutdown()
if __name__=='__main__':asyncio.run(main())
