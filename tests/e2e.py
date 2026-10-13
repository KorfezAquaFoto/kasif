"""Uçtan uca test (Playwright, Python).
Kullanım:
  1) Proje kökünde:  python3 -m http.server 8765
  2) Başka terminalde:  pip install playwright qrcode pillow && python3 tests/e2e.py
Ekran görüntüleri tests/out/ klasörüne yazılır.
"""
import os, pathlib
OUT = pathlib.Path(__file__).parent / "out"; OUT.mkdir(exist_ok=True)
Y4M = str(OUT / "qr.y4m")

def make_fake_camera(url):
    import qrcode
    from PIL import Image
    q = qrcode.make(url, box_size=8, border=4).convert("RGB")
    bg = Image.new("RGB", (640, 480), (90, 110, 130)); bg.paste(q.resize((360, 360)), (140, 60))
    Y, Cb, Cr = bg.convert("YCbCr").split()
    with open(Y4M, "wb") as f:
        f.write(b"YUV4MPEG2 W640 H480 F10:1 Ip A1:1 C420jpeg\n")
        for _ in range(20):
            f.write(b"FRAME\n" + Y.tobytes() + Cb.resize((320, 240)).tobytes() + Cr.resize((320, 240)).tobytes())

import asyncio
from playwright.async_api import async_playwright
B=os.environ.get("BASE","http://localhost:8765/")
make_fake_camera(B+"#s=PRN-3T9F")
async def main():
  async with async_playwright() as p:
    br=await p.chromium.launch(args=["--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream","--use-file-for-fake-video-capture="+Y4M])
    ctx=await br.new_context(viewport={"width":390,"height":844}, device_scale_factor=2, is_mobile=True, has_touch=True, permissions=["camera"])
    pg=await ctx.new_page()
    errs=[]; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: m.type=="error" and errs.append(m.text))
    await pg.goto(B); await pg.wait_for_timeout(1200)
    await pg.screenshot(path=str(OUT/"v2-01-welcome.png"))
    print("kapak yuksekligi:", await pg.evaluate("Math.round(document.querySelector('#passport').getBoundingClientRect().height)"))
    await pg.fill("#in-name","Ayşe Çağla"); await pg.click("#avatars button:nth-child(2)")
    await pg.click("#btn-start"); await pg.wait_for_timeout(1300)
    await pg.screenshot(path=str(OUT/"v6-opening.png"))
    await pg.wait_for_timeout(1700)
    await pg.screenshot(path=str(OUT/"v2-02-home.png"), full_page=True)
    await pg.click("#btn-scan", force=True); await pg.wait_for_timeout(3000)
    print("after cam:", await pg.evaluate("document.querySelector('.view.active').id"))
    await pg.click("#quiz-opts .opt:nth-child(1)"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=str(OUT/"v2-03-quiz.png"))
    await pg.click("#quiz-opts .opt:nth-child(2)"); await pg.wait_for_timeout(1280)
    await pg.screenshot(path=str(OUT/"v6-press.png"))
    await pg.wait_for_timeout(1600)
    await pg.screenshot(path=str(OUT/"v2-04-reward.png"))
    await pg.click("#rw-next"); await pg.wait_for_timeout(500)
    await pg.evaluate("navigator.serviceWorker.ready"); await pg.wait_for_timeout(500)
    await ctx.set_offline(True)
    await pg.goto(B+"#s=MRS-4N7C"); await pg.wait_for_timeout(1200)
    print("offline:", await pg.evaluate("document.querySelector('#quiz-q').textContent"))
    await pg.click("#quiz-opts .opt:nth-child(3)"); await pg.wait_for_timeout(1500)
    await pg.click("#rw-next"); await pg.wait_for_timeout(500)
    await pg.screenshot(path=str(OUT/"v2-05-home2.png"), full_page=True)
    await pg.click(".cell.locked >> nth=3"); await pg.wait_for_timeout(400)
    print("hedef:", await pg.evaluate("document.querySelector('.tg-hint').textContent.slice(0,30)"))
    await pg.screenshot(path=str(OUT/"v2-06-drawer.png"))
    await pg.evaluate("void (navigator.mediaDevices.getUserMedia=()=>Promise.reject(new Error('denied')))")
    for code in ["KSY-2P6L","FSL-8D3M","ORF-5G2H","KRF-7S1B","KAB-6R9T","MGL-8W4K","VTZ-9K3A"]:
      await pg.click("#btn-scan", force=True); await pg.wait_for_timeout(300)
      await pg.fill("#in-code", code); await pg.click("#manual-form button"); await pg.wait_for_timeout(400)
      ans=await pg.evaluate(f"KASIF.stations.find(s=>s.code=='{code}').quiz.answer")
      await pg.click(f"#quiz-opts .opt:nth-child({ans+1})"); await pg.wait_for_timeout(1500)
      if code=="KRF-7S1B": await pg.screenshot(path=str(OUT/"v4-eco.png"))
      if code!="VTZ-9K3A": await pg.click("#rw-next"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=str(OUT/"v2-07-final.png"))
    await pg.click("#rw-next"); await pg.wait_for_timeout(700)
    await pg.screenshot(path=str(OUT/"v8-final-press.png"))
    await pg.wait_for_timeout(2300)
    await pg.screenshot(path=str(OUT/"v2-08-cert.png"), full_page=True)
    await pg.click("#v-cert [data-back]"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=str(OUT/"v2-09-done.png"), full_page=True)
    await pg.goto(B+"#s=PRN-3T9F"); await pg.wait_for_timeout(900)
    await pg.screenshot(path=str(OUT/"v2-10-dup.png"))
    print("dup:", await pg.evaluate("document.querySelector('#modal-title').textContent"))
    await pg.click("#modal-btns button"); await pg.click("#btn-help"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=str(OUT/"v10-help.png"))
    await pg.click("#help-close"); await pg.click("#btn-menu"); await pg.wait_for_timeout(400)
    await pg.screenshot(path=str(OUT/"v2-11-menu.png"))
    img=await pg.evaluate("document.querySelector('#cert-img').naturalWidth")
    print("cert width:", img, "errors:", errs)
    await br.close()
asyncio.run(main())
