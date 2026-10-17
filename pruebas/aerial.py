# recorta la foto aérea del juego y dibuja encima edificios, calles y rótulos
import json, sys
from PIL import Image, ImageDraw, ImageFont
W = __import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'public') + '/'
m = json.load(open(W + 'map/arrecife.json'))
o = m['meta']['ortho']
x0, x1, z0, z1 = map(float, sys.argv[1:5])
out = sys.argv[5]
scale = float(sys.argv[6]) if len(sys.argv) > 6 else 4
tw, th = (o['x1'] - o['x0']) / 2, (o['z1'] - o['z0']) / 2
canvas = Image.new('RGB', (int((x1 - x0) * scale), int((z1 - z0) * scale)))
for qx in range(2):
    for qy in range(2):
        im = Image.open(W + f'ortho/q{qx}{qy}.jpg')
        ox, oz = o['x0'] + tw * qx, o['z0'] + th * qy
        ppm = im.size[0] / tw
        # parte de este cuarto que cae en la ventana
        ax, bx = max(x0, ox), min(x1, ox + tw)
        az, bz = max(z0, oz), min(z1, oz + th)
        if ax >= bx or az >= bz: continue
        crop = im.crop((int((ax - ox) * ppm), int((az - oz) * ppm * im.size[1] / (th * ppm)), int((bx - ox) * ppm), int((bz - oz) * im.size[1] / th)))
        crop = crop.resize((int((bx - ax) * scale), int((bz - az) * scale)), Image.LANCZOS)
        canvas.paste(crop, (int((ax - x0) * scale), int((az - z0) * scale)))
d = ImageDraw.Draw(canvas, 'RGBA')
P = lambda x, z: ((x - x0) * scale, (z - z0) * scale)
inside = lambda pts: any(x0 - 50 < x < x1 + 50 and z0 - 50 < z < z1 + 50 for x, z in pts)
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
except Exception:
    font = ImageFont.load_default()
for i, b in enumerate(m['buildings']):
    if not inside(b['p']): continue
    d.line([P(*q) for q in b['p']], fill=(255, 220, 0, 220), width=2)
    cx = sum(q[0] for q in b['p'][:-1]) / (len(b['p']) - 1); cz = sum(q[1] for q in b['p'][:-1]) / (len(b['p']) - 1)
    if x0 < cx < x1 and z0 < cz < z1:
        d.text(P(cx, cz), f"b{i} h{b['h']}", fill=(255, 255, 0, 255), font=font)
for r in m['roads']:
    if not inside(r['p']): continue
    d.line([P(*q) for q in r['p']], fill=(0, 200, 255, 160), width=2)
    mid = r['p'][len(r['p']) // 2]
    if r.get('name') and x0 < mid[0] < x1 and z0 < mid[1] < z1:
        d.text(P(*mid), r['name'], fill=(120, 230, 255, 255), font=font)
for s in m['signs']:
    if x0 < s['x'] < x1 and z0 < s['z'] < z1:
        px, pz = P(s['x'], s['z'])
        d.ellipse((px - 5, pz - 5, px + 5, pz + 5), fill=(255, 40, 120, 255))
        d.line((px, pz, px + s['nx'] * 25, pz + s['nz'] * 25), fill=(255, 40, 120, 255), width=2)
        d.text((px + 6, pz - 16), s['name'], fill=(255, 120, 200, 255), font=font)
for a in m['areas']:
    if inside(a['p']):
        d.line([P(*q) for q in a['p']], fill=(80, 255, 80, 200), width=2)
# rejilla cada 20 m
for gx in range(int(x0 // 20 * 20), int(x1) + 1, 20):
    d.line((P(gx, z0)[0], 0, P(gx, z0)[0], 8), fill=(255, 255, 255, 255))
    d.text((P(gx, z0)[0] + 2, 8), str(gx), fill=(255, 255, 255, 255), font=font)
for gz in range(int(z0 // 20 * 20), int(z1) + 1, 20):
    d.line((0, P(x0, gz)[1], 8, P(x0, gz)[1]), fill=(255, 255, 255, 255))
    d.text((10, P(x0, gz)[1] - 7), str(gz), fill=(255, 255, 255, 255), font=font)
canvas.save(out)
print(out, canvas.size)
