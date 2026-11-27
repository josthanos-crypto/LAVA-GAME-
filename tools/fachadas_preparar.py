"""Prepara el trabajo de las fachadas dibujadas: por cada tramo de src/barrios/compartido/fachadasCasa.js busca las
fotos de Look Around del lado de la calle que da a esas casas (los pasos que dice su comentario) y monta una hoja
con ellas, en orden de a hacia b. Deja tramos.json y las hojas en la carpeta de trabajo.

Uso: python -I tools/fachadas_preparar.py <carpeta_trabajo> [barrio]
"""
import csv
import json
import math
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / 'src/barrios/compartido/fachadasCasa.js'
DL = Path.home() / 'Downloads'
COPIA_VIEJA = DL / 'Lava Game/recursos lava game 2026-11-25 web casa fachadas'
COPIA_NUEVA = DL / 'recursos lava game 2026-11-25 web casa fachadas'
BARRIOS = {'ALTAVISTA': 'altavista', 'ARGANA ALTA': 'argana_alta', 'TITERROY': 'titerroy'}


def llano(s):
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()
    s = re.sub(r'^(calle|avenida|av\.?|paseo|plaza|pasaje|carretera|camino|urbanizacion)\s+', '', s.strip())
    return re.sub(r'[^a-z0-9]', '', s)


def xz(lat, lon):
    return ((lon + 13.55) * 97398, (28.9625 - lat) * 111320)


def leer_tramos():
    lineas = FUENTE.read_text(encoding='utf-8').splitlines()
    barrio, copia = None, 'vieja'
    tramos = []
    i = 0
    pat_c = re.compile(r"\[([\d.]+), ([\d.]+), ('#[0-9a-fA-F]{6}'|B)(?:, (\{[^}]*\}))?\]")
    while i < len(lineas):
        ln = lineas[i].strip()
        if ln.startswith('// ====='):
            for k, v in BARRIOS.items():
                if k in ln:
                    barrio = v
            if 'repaso' in ln:
                copia = 'nueva'
            i += 1
            continue
        if ln.startswith('// ') and ', acera ' in ln and i + 1 < len(lineas) and lineas[i + 1].strip().startswith('{ a:'):
            m = re.match(r'// (.+?), acera (\w+), pasos? ([\d\-, ]+)', ln)
            cab = re.match(r'\{ a: \[([-\d.]+), ([-\d.]+)\], b: \[([-\d.]+), ([-\d.]+)\]', lineas[i + 1].strip())
            cuerpo = ''
            j = i + 1
            while True:
                cuerpo += lineas[j]
                if lineas[j].rstrip().endswith('] },'):
                    break
                j += 1
            casas = []
            for cm in pat_c.finditer(cuerpo):
                casas.append({'ancho': float(cm.group(1)), 'alto': float(cm.group(2)),
                              'color': cm.group(3).strip("'") if cm.group(3) != 'B' else '#f1eee7',
                              'extra': cm.group(4) or ''})
            pasos = []
            for trozo in m.group(3).split(','):
                trozo = trozo.strip()
                if '-' in trozo:
                    p0, p1 = trozo.split('-')
                    pasos += list(range(int(p0), int(p1) + 1))
                elif trozo:
                    pasos.append(int(trozo))
            tramos.append({'linea': i + 1, 'barrio': barrio, 'copia': copia, 'calle': m.group(1), 'acera': m.group(2),
                           'pasos': pasos, 'a': [float(cab.group(1)), float(cab.group(2))],
                           'b': [float(cab.group(3)), float(cab.group(4))], 'casas': casas})
            i = j + 1
            continue
        i += 1
    return tramos


def leer_csv(carpeta, barrio):
    f = carpeta / barrio / f'{barrio}.csv'
    filas = []
    with open(f, encoding='utf-8-sig') as fh:
        for r in csv.DictReader(fh, delimiter=';'):
            if r['lado'] not in ('izq', 'der') or '_duplicados' in r['archivo']:
                continue
            x, z = xz(float(r['lat']), float(r['lon']))
            filas.append({'archivo': str(carpeta / barrio / r['archivo']), 'calle': llano(r['calle_real']),
                          'carpeta': r['archivo'].split('/')[0], 'paso': int(r['paso']), 'lado': r['lado'],
                          'x': x, 'z': z, 'rumbo': float(r['rumbo'])})
    return filas


def dist_seg(px, pz, a, b):
    vx, vz = b[0] - a[0], b[1] - a[1]
    L = vx * vx + vz * vz or 1
    t = max(0, min(1, ((px - a[0]) * vx + (pz - a[1]) * vz) / L))
    return math.hypot(px - a[0] - t * vx, pz - a[1] - t * vz), t


def fotos_de(tramo, filas):
    nombre = llano(tramo['calle'])
    cand = [f for f in filas if f['calle'] == nombre and f['paso'] in tramo['pasos']]
    if not cand:
        return []
    # una calle puede salir en varias carpetas (cada una con sus pasos): la carpeta con los pasos más cerca del tramo
    por_carpeta = {}
    for f in cand:
        por_carpeta.setdefault(f['carpeta'], []).append(f)
    mejor = min(por_carpeta.values(), key=lambda fs: sum(dist_seg(f['x'], f['z'], tramo['a'], tramo['b'])[0] for f in fs) / len(fs))
    mx, mz = (tramo['a'][0] + tramo['b'][0]) / 2, (tramo['a'][1] + tramo['b'][1]) / 2
    elegidas = []
    for paso in sorted(set(f['paso'] for f in mejor)):
        del_paso = [f for f in mejor if f['paso'] == paso]
        # el lado cuya foto mira hacia la acera del tramo (rumbo 0 = norte = -z, 90 = este = +x)
        lado = {'norte': (0, -1), 'sur': (0, 1), 'este': (1, 0), 'oeste': (-1, 0)}.get(tramo['acera'])

        def hacia(f):
            r = math.radians(f['rumbo'])
            fx, fz = math.sin(r), -math.cos(r)
            if lado:
                return fx * lado[0] + fz * lado[1]
            d, t = dist_seg(f['x'], f['z'], tramo['a'], tramo['b'])
            px = tramo['a'][0] + (tramo['b'][0] - tramo['a'][0]) * t
            pz = tramo['a'][1] + (tramo['b'][1] - tramo['a'][1]) * t
            vx, vz = px - f['x'], pz - f['z']
            n = math.hypot(vx, vz) or 1
            return fx * vx / n + fz * vz / n
        f = max(del_paso, key=hacia)
        _, t = dist_seg(f['x'], f['z'], tramo['a'], tramo['b'])
        r = math.radians(f['rumbo'])
        derecha = (math.cos(r), math.sin(r))
        ux, uz = tramo['b'][0] - tramo['a'][0], tramo['b'][1] - tramo['a'][1]
        elegidas.append({**f, 't': round(t, 2), 'a_izq': ux * derecha[0] + uz * derecha[1] > 0})
    elegidas.sort(key=lambda f: f['t'])
    return elegidas


def hoja(fotos, destino, titulo):
    W, H = 720, 454
    cols = 2 if len(fotos) > 1 else 1
    filas = math.ceil(len(fotos) / cols)
    im = Image.new('RGB', (W * cols, H * filas + 30), 'white')
    d = ImageDraw.Draw(im)
    d.text((6, 8), titulo, fill='black')
    for i, f in enumerate(fotos):
        try:
            ft = Image.open(f['archivo']).convert('RGB').resize((W, H))
        except OSError:
            continue
        dd = ImageDraw.Draw(ft)
        dd.rectangle([0, 0, 330, 24], fill='black')
        sentido = 'a<-izq  der->b' if f['a_izq'] else 'b<-izq  der->a'
        dd.text((6, 6), f"paso {f['paso']} {f['lado']}  t={f['t']}  {sentido}", fill='yellow')
        im.paste(ft, ((i % cols) * W, 30 + (i // cols) * H))
    im.save(destino, quality=78)


def main():
    trabajo = Path(sys.argv[1])
    solo = sys.argv[2] if len(sys.argv) > 2 else None
    trabajo.mkdir(parents=True, exist_ok=True)
    tramos = leer_tramos()
    csvs = {}
    salida = []
    for n, t in enumerate(tramos):
        if solo and t['barrio'] != solo:
            continue
        carpeta = COPIA_NUEVA if t['copia'] == 'nueva' else COPIA_VIEJA
        clave = (str(carpeta), t['barrio'])
        if clave not in csvs:
            csvs[clave] = leer_csv(carpeta, t['barrio'])
        fotos = fotos_de(t, csvs[clave])
        t['id'] = f"{t['barrio']}_{n:03d}"
        t['fotos'] = [{k: f[k] for k in ('archivo', 'paso', 'lado', 't', 'a_izq')} for f in fotos]
        if fotos:
            (trabajo / t['barrio']).mkdir(exist_ok=True)
            t['hoja'] = str(trabajo / t['barrio'] / f"{t['id']}.jpg")
            hoja(fotos, t['hoja'], f"{t['id']}  {t['calle']}, acera {t['acera']}  ({len(t['casas'])} casas, de a hacia b)")
        salida.append(t)
    (trabajo / 'tramos.json').write_text(json.dumps(salida, ensure_ascii=False, indent=1), encoding='utf-8')
    sin = [t['id'] for t in salida if not t['fotos']]
    print(f'tramos {len(salida)}, con fotos {len(salida) - len(sin)}, sin fotos {len(sin)}: {sin[:15]}')


if __name__ == '__main__':
    main()
