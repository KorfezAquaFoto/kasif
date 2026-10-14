from pathlib import Path
import base64
from fontTools.ttLib import TTFont
p=Path(__file__).resolve().parent.parent/'fonts'
target=p/'dynapuff-variable.woff2'
if not target.exists():
    f=TTFont(p/'dynapuff-variable.ttf');f.flavor='woff2';f.save(target)
    print('FONT_WOFF2_BASE64:'+base64.b64encode(target.read_bytes()).decode(),flush=True)
print('FONT_BYTES:'+str(target.stat().st_size),flush=True)
