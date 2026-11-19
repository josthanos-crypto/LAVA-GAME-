# -*- coding: utf-8 -*-
"""Relieve de verdad del campo de arriba (Version 146): genera public/map/terreno-norte.json.

Baja del servicio WCS del IGN el MDT05 (LiDAR del PNOA, CC BY 4.0) de la franja del norte que le falta a
public/map/terreno.json (de z = -3631 a z = -2701, con sus mismas columnas y su malla de 10 m), lo pasa a la malla
del juego y lo suaviza un poco (el servicio da metros enteros). Solo usa Python, sin instalar nada.

Uso, desde la carpeta del juego:   python pruebas/terreno_norte.py
"""
import base64, json, math, os, struct, sys, urllib.request

AQUI = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(AQUI, 'public', 'map', 'terreno.json')
SALIDA = os.path.join(AQUI, 'public', 'map', 'terreno-norte.json')
FILAS_NORTE, FILAS = 60, 94          # 600 m más al norte que terreno.json; 94 filas de 10 m
BBOX = (635512, 645047, 3207286, 3208516)   # x e y en UTM 28N (EPSG:4083) de la franja, con margen
URL = ('https://servicios.idee.es/wcs-inspire/mdt?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage'
       '&COVERAGEID=Elevacion4083_5&SUBSET=x(%d,%d)&SUBSET=y(%d,%d)&FORMAT=image/tiff' % BBOX)


def utm28(lon, lat):
    """longitud y latitud (grados, GRS80) -> x, y en UTM huso 28 norte"""
    a, f, k0, lon0 = 6378137.0, 1 / 298.257222101, 0.9996, math.radians(-15)
    e2 = f * (2 - f); ep2 = e2 / (1 - e2)
    la, lo = math.radians(lat), math.radians(lon)
    n = a / math.sqrt(1 - e2 * math.sin(la) ** 2)
    t, c, aa = math.tan(la) ** 2, ep2 * math.cos(la) ** 2, math.cos(la) * (lo - lon0)
    m = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * la
             - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * math.sin(2 * la)
             + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * math.sin(4 * la) - (35 * e2 ** 3 / 3072) * math.sin(6 * la))
    x = k0 * n * (aa + (1 - t + c) * aa ** 3 / 6 + (5 - 18 * t + t * t + 72 * c - 58 * ep2) * aa ** 5 / 120) + 500000
    y = k0 * (m + n * math.tan(la) * (aa * aa / 2 + (5 - t + 9 * c + 4 * c * c) * aa ** 4 / 24
                                      + (61 - 58 * t + t * t + 600 * c - 330 * ep2) * aa ** 6 / 720))
    return x, y


def leer_tiff(datos):
    """un GeoTIFF sin comprimir de enteros de 16 bits: (ancho, alto, filas, x0, y0, paso)"""
    if datos[:2] != b'II':
        raise ValueError('no es el TIFF que se esperaba')
    (ifd,) = struct.unpack('<I', datos[4:8])
    (n,) = struct.unpack('<H', datos[ifd:ifd + 2])
    tam = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 11: 4, 12: 8}
    fmt = {1: 'B', 3: 'H', 4: 'I', 12: 'd'}
    tags = {}
    for i in range(n):
        tag, tipo, cuenta = struct.unpack('<HHI', datos[ifd + 2 + i * 12: ifd + 10 + i * 12])
        campo = datos[ifd + 10 + i * 12: ifd + 14 + i * 12]
        if tipo not in fmt:
            continue
        total = tam[tipo] * cuenta
        crudo = campo[:total] if total <= 4 else datos[struct.unpack('<I', campo)[0]: struct.unpack('<I', campo)[0] + total]
        tags[tag] = struct.unpack('<%d%s' % (cuenta, fmt[tipo]), crudo)
    ancho, alto = tags[256][0], tags[257][0]
    if tags.get(259, (1,))[0] != 1 or tags[258][0] != 16:
        raise ValueError('el TIFF viene comprimido o no es de 16 bits')
    cuerpo = b''.join(datos[o:o + c] for o, c in zip(tags[273], tags[279]))
    valores = struct.unpack('<%dh' % (ancho * alto), cuerpo[:ancho * alto * 2])
    return ancho, alto, [valores[j * ancho:(j + 1) * ancho] for j in range(alto)], tags[33922][3], tags[33922][4], tags[33550][0]


def gauss(filas, s):
    r = int(s * 3) + 1
    k = [math.exp(-0.5 * (d / s) ** 2) for d in range(-r, r + 1)]
    t = sum(k); k = [v / t for v in k]
    nz, nx = len(filas), len(filas[0])
    lim = lambda v, n: 0 if v < 0 else n - 1 if v >= n else v
    a = [[sum(k[d + r] * filas[lim(j + d, nz)][i] for d in range(-r, r + 1)) for i in range(nx)] for j in range(nz)]
    return [[sum(k[d + r] * a[j][lim(i + d, nx)] for d in range(-r, r + 1)) for i in range(nx)] for j in range(nz)]


def main():
    base = json.load(open(BASE, encoding='utf-8'))
    x0, z0, celda, nx = base['x0'], base['z0'] - FILAS_NORTE * base['cell'], base['cell'], base['nx']
    print('Bajando el MDT05 del IGN...')
    ancho, alto, mdt, tx, ty, paso = leer_tiff(urllib.request.urlopen(URL, timeout=240).read())
    filas = []
    for j in range(FILAS):
        lat = 28.9625 - (z0 + j * celda) / 111320
        fila = []
        for i in range(nx):
            e, n = utm28((x0 + i * celda) / 97398 - 13.55, lat)
            fx = min(max((e - tx) / paso - 0.5, 0), ancho - 1.001); fy = min(max((ty - n) / paso - 0.5, 0), alto - 1.001)
            i0, j0 = int(fx), int(fy); u, v = fx - i0, fy - j0
            fila.append(mdt[j0][i0] * (1 - u) * (1 - v) + mdt[j0][i0 + 1] * u * (1 - v) + mdt[j0 + 1][i0] * (1 - u) * v + mdt[j0 + 1][i0 + 1] * u * v)
        filas.append(fila)
    suave = gauss(filas, 1.6)
    cm = struct.pack('<%dH' % (nx * FILAS), *[min(65535, max(0, int(round(v * 100)))) for fila in suave for v in fila])
    json.dump({'x0': x0, 'z0': z0, 'cell': celda, 'nx': nx, 'nz': FILAS, 'unidad': 'cm', 'orden': 'filas de z creciente (norte a sur)',
               'fuente': 'IGN/CNIG MDT05 (LiDAR PNOA), WCS INSPIRE Elevacion4083_5, remuestreado a 10 m y suavizado',
               'licencia': 'CC BY 4.0 © Instituto Geográfico Nacional', 'datos': 'base64 de Uint16 little-endian',
               'b64': base64.b64encode(cm).decode()}, open(SALIDA, 'w', encoding='utf-8'), ensure_ascii=False)
    print('Hecho:', SALIDA, os.path.getsize(SALIDA), 'bytes')


if __name__ == '__main__':
    sys.exit(main())
