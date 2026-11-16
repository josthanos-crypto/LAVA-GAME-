/**
 * Las marcas de coches del juego: inventadas, con nombres de aquí, y cada una con su emblema
 * (se dibuja en el morro, la zaga, el volante, el cuadro de mandos y el cartel al subirte) y su lema.
 * Los coches se parecen a los de la calle, pero ni nombres ni logotipos son de marcas reales.
 */
export const MARCAS = {
  Guanche: { lema: 'Coches de aquí, para la isla', color: '#c8102e' },
  Alisio: { lema: 'Suave como el viento del norte', color: '#1f5fa8' },
  'Malpaís': { lema: 'Por donde no hay camino', color: '#2f5a3a' },
  Majorero: { lema: 'Duro como la tierra', color: '#2b2f34' },
  Jameo: { lema: 'Todo cabe', color: '#1a6fa0' },
  'Volcanía': { lema: 'Nacido del fuego', color: '#f2c200' },
  'Atlántica': { lema: 'La fuerza del océano', color: '#16325c' },
  Papagayo: { lema: 'Sol, playa y carretera', color: '#f4f1e8' },
  Chispa: { lema: 'Eléctrico, de la isla a las estrellas', color: '#14234a' },
  Tinajo: { lema: 'Dos ruedas entre volcanes', color: '#e2571b' },
};

// cromado: degradado claro arriba a la izquierda, oscuro abajo
function chrome(ctx, cx, cy, r) {
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.45, '#b9c0c8');
  g.addColorStop(0.55, '#858d96');
  g.addColorStop(1, '#e4e8ec');
  return g;
}
const SILVER = '#e9edf1';

/**
 * Dibuja el emblema de la marca centrado en (cx, cy) con radio r, en píxeles del lienzo.
 * Formas gruesas y sencillas: tienen que leerse aunque midan pocos píxeles.
 */
export function drawLogo(ctx, cx, cy, r, marca) {
  const m = MARCAS[marca];
  if (!m) return false;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const disc = (rad, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(0, 0, rad, 0, Math.PI * 2); ctx.fill(); };
  const oval = (rx, ry, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); };
  const poly = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r))); ctx.closePath(); ctx.fill(); };
  const stroke = (w, col, path) => { ctx.strokeStyle = col; ctx.lineWidth = w * r; ctx.beginPath(); path(); ctx.stroke(); };
  switch (marca) {
    case 'Guanche': {
      // la pintadera canaria: rombos uno dentro de otro con sus triangulitos, en blanco sobre rojo
      disc(r, chrome(ctx, 0, 0, r));
      disc(r * 0.84, m.color);
      poly([[0, -0.66], [0.66, 0], [0, 0.66], [-0.66, 0]], SILVER);
      poly([[0, -0.46], [0.46, 0], [0, 0.46], [-0.46, 0]], m.color);
      poly([[0, -0.3], [0.3, 0], [0, 0.3], [-0.3, 0]], SILVER);
      for (const [x, y] of [[0.5, -0.5], [0.5, 0.5], [-0.5, 0.5], [-0.5, -0.5]]) poly([[x, y], [x * 0.62, y], [x, y * 0.62]], SILVER);
      break;
    }
    case 'Alisio': {
      // tres soplos de viento dentro de un óvalo
      oval(r, r * 0.7, chrome(ctx, 0, 0, r));
      oval(r * 0.86, r * 0.57, m.color);
      for (const [y, a, b] of [[-0.24, -0.55, 0.5], [0.02, -0.62, 0.62], [0.28, -0.4, 0.55]]) {
        stroke(0.12, SILVER, () => {
          ctx.moveTo(a * r, y * r);
          ctx.bezierCurveTo((a + 0.35) * r, (y - 0.18) * r, (b - 0.3) * r, (y + 0.16) * r, b * r, (y - 0.04) * r);
        });
      }
      break;
    }
    case 'Malpaís': {
      // óvalo verde con el volcán y su cráter, como el paisaje de lava
      oval(r, r * 0.66, chrome(ctx, 0, 0, r));
      oval(r * 0.88, r * 0.54, m.color);
      poly([[-0.72, 0.36], [-0.3, -0.24], [-0.16, -0.36], [0.02, -0.26], [0.16, -0.38], [0.34, -0.22], [0.74, 0.36]], SILVER);
      poly([[-0.1, -0.31], [0.0, -0.18], [0.1, -0.32], [0.02, -0.24]], m.color);
      stroke(0.07, m.color, () => { ctx.moveTo(-0.6 * r, 0.24 * r); ctx.lineTo(0.6 * r, 0.24 * r); });
      break;
    }
    case 'Majorero': {
      // los cuernos de la cabra majorera, en plata sobre negro
      ctx.fillStyle = chrome(ctx, 0, 0, r);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-r, -r * 0.86, r * 2, r * 1.72, r * 0.32) : ctx.rect(-r, -r * 0.86, r * 2, r * 1.72); ctx.fill();
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-r * 0.84, -r * 0.7, r * 1.68, r * 1.4, r * 0.24) : ctx.rect(-r * 0.84, -r * 0.7, r * 1.68, r * 1.4); ctx.fill();
      for (const sx of [-1, 1]) {
        stroke(0.17, SILVER, () => {
          ctx.moveTo(sx * 0.1 * r, 0.1 * r);
          ctx.bezierCurveTo(sx * 0.1 * r, -0.5 * r, sx * 0.62 * r, -0.62 * r, sx * 0.6 * r, -0.14 * r);
          ctx.quadraticCurveTo(sx * 0.58 * r, 0.06 * r, sx * 0.4 * r, 0.04 * r);
        });
      }
      poly([[-0.16, 0.12], [0.16, 0.12], [0.08, 0.5], [-0.08, 0.5]], SILVER);
      break;
    }
    case 'Jameo': {
      // la ola que entra en la cueva: una J que se riza
      disc(r, chrome(ctx, 0, 0, r));
      disc(r * 0.84, m.color);
      stroke(0.17, SILVER, () => {
        ctx.moveTo(0.18 * r, -0.5 * r);
        ctx.lineTo(0.18 * r, 0.1 * r);
        ctx.quadraticCurveTo(0.18 * r, 0.48 * r, -0.16 * r, 0.46 * r);
        ctx.quadraticCurveTo(-0.44 * r, 0.42 * r, -0.4 * r, 0.14 * r);
      });
      stroke(0.1, SILVER, () => { ctx.moveTo(-0.5 * r, -0.28 * r); ctx.quadraticCurveTo(-0.22 * r, -0.5 * r, 0.02 * r, -0.28 * r); });
      break;
    }
    case 'Volcanía': {
      // escudo amarillo con el volcán echando lava y la bandera canaria arriba
      const shield = [[-0.8, -0.9], [0.8, -0.9], [0.8, 0.1], [0, 0.98], [-0.8, 0.1]];
      ctx.save(); ctx.scale(1.08, 1.06); poly(shield, chrome(ctx, 0, 0, r)); ctx.restore();
      poly(shield, m.color);
      poly([[-0.8, -0.9], [-0.27, -0.9], [-0.27, -0.66], [-0.8, -0.66]], '#ffffff');
      poly([[-0.27, -0.9], [0.27, -0.9], [0.27, -0.66], [-0.27, -0.66]], '#0768a9');
      poly([[0.27, -0.9], [0.8, -0.9], [0.8, -0.66], [0.27, -0.66]], '#fcd116');
      poly([[-0.62, 0.52], [-0.16, -0.18], [0.16, -0.18], [0.62, 0.52]], '#111214');
      poly([[-0.14, -0.18], [0, -0.06], [0.14, -0.18], [0.06, -0.48], [-0.06, -0.48]], '#e2360f');
      for (const [x, y, rr] of [[-0.26, -0.44, 0.07], [0.26, -0.44, 0.07], [0, -0.58, 0.06]]) { ctx.fillStyle = '#ff5a12'; ctx.beginPath(); ctx.arc(x * r, y * r, rr * r, 0, Math.PI * 2); ctx.fill(); }
      break;
    }
    case 'Atlántica': {
      // el tridente del océano en una barra cromada, rojo a un lado y azul al otro
      ctx.fillStyle = chrome(ctx, 0, 0, r);
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-r * 1.25, -r * 0.42, r * 2.5, r * 0.84, r * 0.42) : ctx.rect(-r * 1.25, -r * 0.42, r * 2.5, r * 0.84); ctx.fill();
      ctx.fillStyle = '#b3121d';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-r * 1.15, -r * 0.3, r * 1.15, r * 0.6, [r * 0.3, 0, 0, r * 0.3]) : ctx.rect(-r * 1.15, -r * 0.3, r * 1.15, r * 0.6); ctx.fill();
      ctx.fillStyle = m.color;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(0, -r * 0.3, r * 1.15, r * 0.6, [0, r * 0.3, r * 0.3, 0]) : ctx.rect(0, -r * 0.3, r * 1.15, r * 0.6); ctx.fill();
      disc(r * 0.72, chrome(ctx, 0, 0, r * 0.72));
      disc(r * 0.6, '#0e1a2e');
      stroke(0.1, SILVER, () => {
        ctx.moveTo(0, 0.48 * r); ctx.lineTo(0, -0.42 * r);
        ctx.moveTo(-0.3 * r, -0.3 * r); ctx.quadraticCurveTo(-0.3 * r, 0.02 * r, 0, 0.04 * r); ctx.quadraticCurveTo(0.3 * r, 0.02 * r, 0.3 * r, -0.3 * r);
      });
      for (const x of [-0.3, 0, 0.3]) poly([[x - 0.08, x ? -0.28 : -0.4], [x, x ? -0.44 : -0.56], [x + 0.08, x ? -0.28 : -0.4]], SILVER);
      break;
    }
    case 'Papagayo': {
      // el ala del papagayo: tres plumas de colores abiertas en abanico
      disc(r, chrome(ctx, 0, 0, r));
      disc(r * 0.84, m.color);
      const feather = (ang, col) => {
        ctx.save(); ctx.rotate(ang);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(0, 0.42 * r);
        ctx.quadraticCurveTo(0.24 * r, -0.05 * r, 0, -0.62 * r);
        ctx.quadraticCurveTo(-0.24 * r, -0.05 * r, 0, 0.42 * r);
        ctx.fill();
        ctx.restore();
      };
      feather(-0.55, '#18a058');
      feather(0.55, '#e2361a');
      feather(0, '#f5b400');
      disc(r * 0.09, '#1b1d20');
      break;
    }
    case 'Chispa': {
      // una chispa de cuatro puntas dentro de una órbita inclinada, con su satélite, sobre azul noche
      disc(r, chrome(ctx, 0, 0, r));
      disc(r * 0.84, m.color);
      ctx.save(); ctx.rotate(-0.42);
      ctx.strokeStyle = SILVER; ctx.lineWidth = 0.09 * r;
      ctx.beginPath(); ctx.ellipse(0, 0, 0.7 * r, 0.3 * r, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0.62 * r, -0.14 * r, 0.08 * r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const spark = (s, col) => poly([[0, -0.58 * s], [0.13 * s, -0.13 * s], [0.58 * s, 0], [0.13 * s, 0.13 * s], [0, 0.58 * s], [-0.13 * s, 0.13 * s], [-0.58 * s, 0], [-0.13 * s, -0.13 * s]], col);
      spark(1, '#ff6a12');
      spark(0.55, '#ffd23a');
      break;
    }
    case 'Tinajo': {
      // la montaña de fuego negra con la carretera que sube haciendo curvas, sobre naranja
      disc(r, chrome(ctx, 0, 0, r));
      disc(r * 0.84, m.color);
      poly([[-0.66, 0.46], [-0.16, -0.5], [0.16, -0.5], [0.66, 0.46]], '#141517');
      poly([[-0.16, -0.5], [0, -0.34], [0.16, -0.5]], m.color);
      stroke(0.09, SILVER, () => {
        ctx.moveTo(-0.3 * r, 0.44 * r);
        ctx.quadraticCurveTo(0.34 * r, 0.3 * r, 0.02 * r, 0.12 * r);
        ctx.quadraticCurveTo(-0.26 * r, -0.04 * r, 0.12 * r, -0.2 * r);
      });
      break;
    }
    default: break;
  }
  ctx.restore();
  return true;
}

const cache = new Map();
/** el emblema solo, en un lienzo cuadrado (volante, cuadro de mandos, cartel al subirte) */
export function logoCanvas(marca, size = 128) {
  const key = marca + ':' + size;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = size;
  drawLogo(c.getContext('2d'), size / 2, size / 2, size * 0.4, marca);
  cache.set(key, c);
  return c;
}
