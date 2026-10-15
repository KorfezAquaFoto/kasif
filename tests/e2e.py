import asyncio,base64,functools,http.server,pathlib,threading
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
async def main():
 server=http.server.ThreadingHTTPServer(('127.0.0.1',8770),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 async with async_playwright() as p:
  br=await p.chromium.launch()
  pg=await br.new_page(viewport={'width':390,'height':844})
  await pg.goto('http://127.0.0.1:8770/')
  await pg.evaluate('document.fonts.ready')
  await pg.evaluate("""()=>{const now=Date.now();localStorage.setItem('okyanus-kasifi-v1',JSON.stringify({v:1,id:'2026',name:'Kaşif',avatar:'kesis',badges:Object.fromEntries(KASIF.stations.map(s=>[s.id,now])),created:now}))}""")
  await pg.reload();await pg.click('#btn-cert')
  await pg.wait_for_function('document.querySelector("#cert-img").naturalWidth===1080')
  data=await pg.locator('#cert-img').get_attribute('src')
  out=ROOT/'tests/out';out.mkdir(exist_ok=True)
  (out/'Okyanus-Kasifi-Dolu-Sertifika.png').write_bytes(base64.b64decode(data.split(',',1)[1]))
  await br.close()
 server.shutdown()
asyncio.run(main())
