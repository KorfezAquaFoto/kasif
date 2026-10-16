"""Poster payloads, print geometry, dark/blurred QR decoding and A4 PDF checks."""
import asyncio,base64,functools,http.server,io,json,mimetypes,os,pathlib,shutil,subprocess,threading
from urllib.parse import unquote,urlparse
from PIL import Image,ImageEnhance,ImageFilter,ImageOps,ImageDraw
from pypdf import PdfReader
from playwright.async_api import async_playwright

ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT/'tests/out/posters';OUT.mkdir(parents=True,exist_ok=True)
LIVE='https://korfezaquafoto.github.io/kasif/'
MM=96/25.4

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
class Server(http.server.ThreadingHTTPServer):
 def handle_error(self,*args):pass

async def decode(pg,png):
 return await pg.evaluate("""async bytes=>{
  const image=new Image();image.src='data:image/png;base64,'+bytes;await image.decode();
  const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
  const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(image,0,0);
  const pixels=x.getImageData(0,0,c.width,c.height);
  return jsQR(pixels.data,c.width,c.height,{inversionAttempts:'dontInvert'})?.data||null;
 }""",base64.b64encode(png).decode())

def png_bytes(image):
 b=io.BytesIO();image.save(b,format='PNG');return b.getvalue()

def render_pdf(path,prefix):
 try:
  import fitz
 except ImportError:
  command=shutil.which('pdftoppm')
  if not command:raise RuntimeError('PDF render needs PyMuPDF or pdftoppm')
  subprocess.run([command,'-png','-r','110',str(path),str(OUT/prefix)],check=True,capture_output=True)
  return sorted(OUT.glob(prefix+'-*.png'),key=lambda p:int(p.stem.rsplit('-',1)[1]))
 doc=fitz.open(path);paths=[]
 for i,page in enumerate(doc):
  output=OUT/f'{prefix}-{i+1:02d}.png';page.get_pixmap(matrix=fitz.Matrix(110/72,110/72),alpha=False).save(output);paths.append(output)
 doc.close();return paths

async def geometry(pg):
 return await pg.evaluate("""()=>[...document.querySelectorAll('.poster')].map(p=>{
  const r=p.getBoundingClientRect(),frame=p.querySelector('.poster-frame').getBoundingClientRect(),qr=p.querySelector('.qr').getBoundingClientRect(),code=p.querySelector('.code'),issues=[];
  for(const e of p.querySelectorAll('.topline,.hero,.manual,.qr,.footer,h2,.instruction,.code')){
   const a=e.getBoundingClientRect();if(a.left<frame.left+3||a.right>frame.right-3||a.top<frame.top+3||a.bottom>frame.bottom-3)issues.push('outside '+e.className);
   const s=getComputedStyle(e);if((s.overflowY!=='visible'&&e.scrollHeight>e.clientHeight+2)||(s.overflowX!=='visible'&&e.scrollWidth>e.clientWidth+2))issues.push('clipped '+e.className);
  }
  const sections=[...p.querySelector('.poster-frame').children].map(e=>e.getBoundingClientRect());
  for(let i=1;i<sections.length;i++)if(sections[i].top<sections[i-1].bottom-1)issues.push('overlap');
  let ink=0;if(code){const x=document.createElement('canvas').getContext('2d'),s=getComputedStyle(code);x.font=s.fontWeight+' '+s.fontSize+' '+s.fontFamily;const m=x.measureText(code.textContent);ink=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;}
  const svg=p.querySelector('.qr svg');
  return {station:p.dataset.station,width:r.width,height:r.height,qr:qr.width,ink,issues,quiet:+svg.dataset.quiet,level:svg.dataset.errorCorrection,modules:+svg.dataset.modules};
 })""")

async def check_set(pg,base,label,dim=True):
 await pg.evaluate('document.fonts.ready');await pg.add_script_tag(path=str(ROOT/'vendor/jsQR.js'))
 await pg.emulate_media(media='print');await pg.wait_for_timeout(150)
 stations=await pg.evaluate('KASIF.stations.map(s=>({id:s.id,code:s.code,title:s.title,q:s.quiz?.q,tip:s.tip,reward:s.reward}))')
 posters=pg.locator('.poster');assert await posters.count()==len(stations)+1==10
 expected=[base]+[base+'#s='+s['code'] for s in stations]
 bounds=await geometry(pg)
 for index,g in enumerate(bounds):
  assert not g['issues'],(label,index,g)
  assert abs(g['width']-210*MM)<1 and abs(g['height']-297*MM)<1,(label,'A4',g)
  assert g['qr']>=120*MM and g['quiet']>=4 and g['level']=='M',(label,'QR geometry',g)
  if index:assert g['ink']>=10*MM,(label,'code ink under 1 cm',g)
 for i in range(10):
  poster=posters.nth(i);text=await poster.inner_text()
  if i:
   assert (await poster.locator('.code').inner_text())==stations[i-1]['code']
   for hidden in [stations[i-1]['q'],stations[i-1]['tip'],stations[i-1]['reward']]:
    if hidden:assert hidden not in text,(label,'question or hint leaked',i)
  pure=await poster.locator('.qr svg').evaluate("""async svg=>{
   const n=+svg.dataset.modules,q=+svg.dataset.quiet,side=(n+q*2)*10;
   const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(svg));await image.decode();
   const c=document.createElement('canvas');c.width=c.height=side;const x=c.getContext('2d');x.drawImage(image,0,0,side,side);const p=x.getImageData(0,0,side,side).data;
   for(let row=0;row<side;row++)for(let col=0;col<side;col++){
    const k=(row*side+col)*4,v=p[k],white=row<q*10||col<q*10||row>=side-q*10||col>=side-q*10;
    if(p[k+1]!==v||p[k+2]!==v||p[k+3]!==255||(v!==0&&v!==255)||(white&&v!==255))return false;
   }return true;
  }""")
  assert pure,(label,'QR must be pure black/white with 4 white modules',i)
  png=await poster.screenshot();assert await decode(pg,png)==expected[i],(label,'normal',i)
  if dim:
   image=Image.open(io.BytesIO(png)).convert('RGB')
   dark=ImageEnhance.Brightness(image).enhance(.35).filter(ImageFilter.GaussianBlur(.7))
   dark.save(OUT/f'{label}-dim-{i:02d}.png')
   assert await decode(pg,png_bytes(dark))==expected[i],(label,'35% light + blur',i)
   small=image.resize((450,round(image.height*450/image.width)),Image.Resampling.LANCZOS)
   small=ImageEnhance.Brightness(small).enhance(.35).filter(ImageFilter.GaussianBlur(.7))
   assert await decode(pg,png_bytes(small))==expected[i],(label,'450px dim + blur',i)
 print('PASS',label,'10 QR payloads, A4 geometry, quiet zones, codes; dim + blur',flush=True)
 return stations,expected,bounds

async def main():
 server=Server(('127.0.0.1',8781),functools.partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 summary={}
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path=os.environ.get('KASIF_BROWSER'))
  ctx=await browser.new_context(viewport={'width':1100,'height':1350},device_scale_factor=1,service_workers='block')
  pg=await ctx.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  local='http://127.0.0.1:8781/'
  await pg.goto(local+'qr-kodlari.html');await pg.locator('.poster').nth(9).wait_for(state='attached')
  await check_set(pg,local,'local')
  # Screen previews must fit both phone and desktop widths.
  for width in [360,1440]:
   await pg.emulate_media(media='screen');await pg.set_viewport_size({'width':width,'height':1000});await pg.wait_for_timeout(200)
   assert await pg.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('screen overflow',width)
  await ctx.close()
  ctx=await browser.new_context(viewport={'width':1100,'height':1350},device_scale_factor=1,service_workers='block')
  async def local_public(route):
   url=urlparse(route.request.url)
   if url.netloc!='korfezaquafoto.github.io' or not url.path.startswith('/kasif/'):return await route.abort()
   relative=unquote(url.path[len('/kasif/'):]) or 'index.html'
   path=(ROOT/relative).resolve()
   if not path.is_relative_to(ROOT.resolve()) or not path.is_file():return await route.fulfill(status=404,body='not found')
   await route.fulfill(path=str(path),content_type=mimetypes.guess_type(path)[0] or 'application/octet-stream')
  await ctx.route('**/*',local_public)
  pg=await ctx.new_page();pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.goto(LIVE+'qr-kodlari.html');await pg.locator('.poster').nth(9).wait_for(state='attached')
  stations,expected,bounds=await check_set(pg,LIVE,'published')
  summary['published_base']=LIVE;summary['geometry']=bounds
  for backgrounds,suffix in [(True,'a4'),(False,'no-background')]:
   path=OUT/f'korfez-aqua-posterler-{suffix}.pdf'
   await pg.pdf(path=str(path),format='A4',prefer_css_page_size=True,print_background=backgrounds,display_header_footer=False)
   reader=PdfReader(path);assert len(reader.pages)==10,('PDF page count',suffix,len(reader.pages))
   for i,page in enumerate(reader.pages):
    assert abs(float(page.mediabox.width)-595.276)<1 and abs(float(page.mediabox.height)-841.89)<1,('PDF A4',i)
    text=page.extract_text()
    if i:assert stations[i-1]['code'] in text,('PDF code',i,text)
    assert sum(s['code'] in text for s in stations)==(0 if i==0 else 1),('PDF split poster',i)
   pages=render_pdf(path,suffix)
   if not backgrounds:assert Image.open(pages[0]).convert('RGB').getpixel((3,3))==(255,255,255),'background-off PDF still has paper fill'
   for i,page in enumerate(pages):assert await decode(pg,page.read_bytes())==expected[i],('rendered PDF QR',suffix,i)
   summary[suffix]={'pages':len(reader.pages),'rendered_qr_decodes':len(pages)}
   print('PASS PDF',suffix,'10 A4 pages; 10/10 rendered QR decoded',flush=True)
  first=Image.open(OUT/'a4-1.png') if (OUT/'a4-1.png').exists() else Image.open(OUT/'a4-01.png')
  second=Image.open(OUT/'a4-2.png') if (OUT/'a4-2.png').exists() else Image.open(OUT/'a4-02.png')
  height=1180;panels=[]
  for image in [first,second]:
   image=image.convert('RGB');image.thumbnail((850,height));panels.append(image)
  preview=Image.new('RGB',(sum(x.width for x in panels)+36,height+24),'#e9f1f6')
  offset=12
  for image in panels:preview.paste(image,(offset,12));offset+=image.width+12
  preview.save(OUT/'poster-onizleme.png')
  assert not errors,errors
  await ctx.close();await browser.close()
 server.shutdown()
 (OUT/'results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
 print('PASS: 10 posters, local/published URLs, dim/blur, 20 PDF QR decodes, background-off printing',flush=True)

if __name__=='__main__':asyncio.run(main())
