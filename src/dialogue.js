/**
 * Conversaciones con la gente de Arrecife: frases canarias según el momento
 * (hora del día, si te busca la policía, si acabas de liarla) y respuestas
 * propias de cada protagonista. Se muestran en una caja de diálogo con
 * efecto de máquina de escribir.
 */

const pick = (a) => a[Math.floor(Math.random() * a.length)];

const NAMES = ['Doña Pino', 'Yeray', 'Cande', 'Don Agustín', 'Nayra', 'Juanjo', 'Chona', 'Ayoze', 'Maribel', 'Tito', 'Yurena', 'Paco el del kiosco'];

const OPENERS = {
  day: [
    '¡Chacho! ¿Qué pasó, mi niño?',
    'Ños, qué calor hace hoy, ¿eh?',
    '¿Vas pa\'l Charco? Dicen que hoy hay pescado fresco.',
    'Muchacho, ¿tú no eres el sobrino de Pino?',
    'Si vas pa\'l Reducto llévate agua, que el sol pega.',
    '¿Has visto la guagua? Llevo media hora esperando.',
  ],
  evening: [
    'Qué atardecer más bonito, ¿verdad? Esto no lo tienen en Madrid.',
    'Me voy pa\' casa que se pone fresquito con la brisa.',
    '¿Unas cañas en la Marina? Venga, que invito yo... la próxima.',
  ],
  night: [
    'A estas horas por aquí solo andan los gatos y tú.',
    'Ten cuidado, que de noche hay cada uno por Arrecife...',
    '¿Tú también sales de la discoteca? Ños, qué jaleo.',
  ],
  wanted: [
    '¡Ese es el que sale en las noticias! ¡Fuera, fuera!',
    'Mira, yo no he visto nada, ¿eh? Nada de nada.',
    '¡Como venga la policía yo digo que no te conozco!',
  ],
};

const CLOSERS = [
  'Bueno, mi niño, que te vaya bonito.',
  'Venga, cuídate. ¡Y no corras con el coche!',
  'Saluda a tu madre de mi parte, ¿eh?',
  'Me voy, que se me quema el potaje.',
  'Ahí nos vemos, en la fiesta de San Ginés.',
];

const PLAYER_LINES = {
  noah: [
    'Tranqui, hermano, solo busco buenas olas.',
    '¿Sabes si mañana entra mar de fondo?',
    'Todo bien, todo fluye. Aloha, ¿vale?',
  ],
  michael: [
    'Solo estoy de paso. Negocios.',
    'No busco problemas. Bueno, casi nunca.',
    '¿Sabes dónde se puede comer bien por aquí?',
  ],
  jose: [
    '¡Qué pasó, mi niña! Aquí, dando un rulo.',
    'Ños, sí, un calor que no veas. ¿Y la familia?',
    'Yo soy de aquí de toda la vida, de Valterra.',
  ],
  iria: [
    '¡Buenas! Aquí, dando una vuelta por Arrecife.',
    'Yo vengo del Reducto, que hoy la playa está de lujo.',
    '¿Tú sabes dónde ponen el mejor barraquito?',
  ],
};

// si juegas con Iria, lo que te dicen va en femenino
const FEM = [
  [/¡Ese es mi niño!/g, '¡Esa es mi niña!'], [/\bmi niño\b/g, 'mi niña'], [/\bMi niño\b/g, 'Mi niña'],
  [/\bMuchacho\b/g, 'Muchacha'], [/\bel sobrino\b/g, 'la sobrina'], [/¡Ese es el que sale/g, '¡Esa es la que sale'],
  [/\bciego\b/g, 'ciega'], [/\bsospechoso\b/g, 'sospechosa'], [/\bTranquilo\b/g, 'Tranquila'],
  [/\bamigo\b/g, 'amiga'], [/\b([Bb])ienvenido\b/g, '$1ienvenida'], [/Benvenuto/g, 'Benvenuta'],
  [/\b([Hh])echo un pincel/g, '$1echa un pincel'],
];
const FEM_ME = [[/\bde cliente\b/g, 'de clienta']];
function feminine(text, player) {
  for (const [re, to] of player ? FEM_ME : FEM) text = text.replace(re, to);
  return text;
}

const PANIC = ['¡Ay mi madre!', '¡Que dispara! ¡Corran!', '¡Llama a la policía!', '¡Socorro!', '¡Fuerte loco!', '¡Ños, ños, ños!'];
const BUMPED = ['¡Mira por dónde vas!', '¡Eh, cuidado!', '¡Fuerte bobería!', '¿Estás ciego o qué?'];
const COP = ['¡Policía! ¡Alto ahí!', '¡Para el coche, ya!', '¡Manos donde las pueda ver!', '¡Central, sospechoso en fuga!'];

export function randomName() { return pick(NAMES); }
export function panicLine() { return pick(PANIC); }
export function bumpLine() { return pick(BUMPED); }
export function copLine() { return pick(COP); }

/** guion de 3 líneas: vecino → protagonista → vecino */
export function conversation({ ped, charKey, charName, hour, wanted }) {
  let pool = OPENERS.day;
  if (wanted > 0) pool = OPENERS.wanted;
  else if (hour >= 19 && hour < 21) pool = OPENERS.evening;
  else if (hour >= 21 || hour < 6) pool = OPENERS.night;
  const lines = [{ who: ped.name, text: pick(pool) }];
  if (wanted > 0) return lines; // con estrellas no se quedan a charlar
  lines.push({ who: charName, text: pick(PLAYER_LINES[charKey] || PLAYER_LINES.jose), player: true });
  lines.push({ who: ped.name, text: pick(CLOSERS) });
  return lines;
}

/** caja de diálogo inferior con texto que se escribe solo */
export class DialogBox {
  constructor(el) {
    this.el = el;
    this.whoEl = el.querySelector('.who');
    this.textEl = el.querySelector('.text');
    this.queue = [];
    this.current = null;
    this.shown = 0;
    this.hold = 0;
    this.fem = false; // el protagonista es una chica (Iria)
  }

  get busy() { return !!this.current || this.queue.length > 0; }

  play(lines, onDone) {
    this.queue = lines.slice();
    this.onDone = onDone;
    this.next();
  }

  /** frase suelta (gritos, policía) que no interrumpe una conversación larga */
  say(who, text, secs = 2.2) {
    if (this.busy) return;
    this.play([{ who, text, hold: secs }]);
  }

  next() {
    this.current = this.queue.shift() || null;
    if (this.current && this.fem) this.current = { ...this.current, text: feminine(this.current.text, this.current.player) };
    this.shown = 0;
    if (!this.current) {
      this.el.classList.remove('on');
      const cb = this.onDone;
      this.onDone = null;
      cb?.();
      return;
    }
    this.hold = this.current.hold ?? (1.4 + this.current.text.length * 0.035);
    this.whoEl.textContent = this.current.who;
    this.el.classList.toggle('player', !!this.current.player);
    this.textEl.textContent = '';
    this.el.classList.add('on');
  }

  /** T o espacio adelantan la frase */
  skip() {
    if (!this.current) return;
    if (this.shown < this.current.text.length) this.shown = this.current.text.length;
    else this.next();
  }

  update(dt) {
    if (!this.current) return;
    if (this.shown < this.current.text.length) {
      this.shown = Math.min(this.current.text.length, this.shown + dt * 45);
      this.textEl.textContent = this.current.text.slice(0, Math.floor(this.shown));
      return;
    }
    this.hold -= dt;
    if (this.hold <= 0) this.next();
  }
}
