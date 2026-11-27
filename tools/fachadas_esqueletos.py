"""Escribe los esqueletos de datos de las fachadas dibujadas a partir de tramos.json (fachadas_preparar.py): un archivo
por tanda de tramos en src/fachadasDibujadas/calles/<barrio>_<n>.js, con a, b, anchos y altos ya puestos y cada casa
en null, para rellenarla mirando la hoja de fotos del tramo. No pisa un archivo que ya exista.

Uso: python -I tools/fachadas_esqueletos.py <carpeta_trabajo> [tramos_por_archivo]
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / 'src/fachadasDibujadas/calles'
HECHOS = {'titerroy_264', 'titerroy_265', 'titerroy_266', 'titerroy_430', 'titerroy_431'}  # calles/lebrillo.js


def main():
    trabajo = Path(sys.argv[1])
    por = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    tramos = [t for t in json.loads((trabajo / 'tramos.json').read_text(encoding='utf-8'))
              if t['fotos'] and t['id'] not in HECHOS]
    por_barrio = {}
    for t in tramos:
        por_barrio.setdefault(t['barrio'], []).append(t)
    escritos = []
    for barrio, lista in por_barrio.items():
        for k in range(0, len(lista), por):
            tanda = lista[k:k + por]
            nombre = f'{barrio}_{k // por + 1}'
            f = DESTINO / f'{nombre}.js'
            if f.exists():
                continue
            out = [
                '/**',
                f' * Fachadas dibujadas: {barrio}, tanda {k // por + 1} ({len(tanda)} tramos de',
                ' * src/barrios/compartido/fachadasCasa.js). Cada casa se describe mirando la hoja de fotos de su tramo',
                ' * (carpeta _trabajo_fachadas); null = no se dibuja. Método: skill lava-game-fachadas.',
                ' */',
                '',
                'export default {',
                f"  nombre: '{barrio} {k // por + 1}',",
                '  aceras: [',
            ]
            for t in tanda:
                anchos = ', '.join(f"{c['ancho']:g}" for c in t['casas'])
                altos = ', '.join(f"{c['alto']:g}" for c in t['casas'])
                colores = ' '.join(c['color'] + ('/tienda' if 'tienda' in c['extra'] else '') + ('/solar' if c['alto'] == 0 else '')
                                   for c in t['casas'])
                out.append(f"    // {t['id']}: {t['calle']}, acera {t['acera']}, pasos {','.join(map(str, t['pasos']))}"
                           f" — hoja {t['barrio']}/{t['id']}.jpg — antes: {colores}")
                out.append(f"    {{ id: '{t['id']}', a: {t['a']}, b: {t['b']}, anchos: [{anchos}], altos: [{altos}], casas: [")
                for c in t['casas']:
                    out.append('      null,')
                out.append('    ] },')
            out += ['  ],', '};', '']
            f.write_text('\n'.join(out), encoding='utf-8')
            escritos.append((nombre, len(tanda)))
    print(escritos)


if __name__ == '__main__':
    main()
