/**
 * Controles táctiles para jugar desde el móvil: joystick a la izquierda
 * (aparece donde pongas el pulgar) y botones a la derecha. Los botones
 * mandan las mismas teclas que el teclado, así el resto del juego no
 * necesita saber si juegas en el PC o en el móvil.
 */

export const isTouchDevice = () =>
  new URLSearchParams(location.search).has('touch') ||
  (matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0);

const RADIUS = 56; // recorrido del joystick en píxeles
const DEAD = 0.12;

function key(type, k) {
  dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true }));
}

const BUTTONS = [
  // [id, tecla, texto, mantener pulsado]
  ['fire', 'k', 'Disparar', true],
  ['brake', ' ', 'Freno', true],
  ['enter', 'f', 'Bajar', false],
  ['talk', 't', 'Hablar', false],
];
const MENU = [
  ['c', 'Cámara'], ['m', 'Ropa'], ['n', 'Hora'], ['q', 'Calidad'],
  ['p', 'Foto'], ['r', 'Recolocar'], ['v', 'Silenciar'], ['1', 'Noah'], ['2', 'Michael'], ['3', 'José'], ['4', 'Iria'],
];

export class TouchControls {
  constructor(root, input) {
    this.input = input;
    this.root = root;
    this.stick = null; // { id, ox, oy }
    root.innerHTML = `
      <div class="tc-zone"></div>
      <div class="tc-stick"><i></i></div>
      <div class="tc-btns">${BUTTONS.map(([id, , label]) => `<button type="button" class="tc-b tc-${id}" data-id="${id}">${label}</button>`).join('')}</div>
      <button type="button" class="tc-more" aria-label="Más opciones">···</button>
      <div class="tc-menu">${MENU.map(([k, l]) => `<button type="button" data-k="${k}">${l}</button>`).join('')}</div>`;
    this.zone = root.querySelector('.tc-zone');
    this.knob = root.querySelector('.tc-stick');
    this.menu = root.querySelector('.tc-menu');
    this.enterBtn = root.querySelector('.tc-enter');
    this.talkBtn = root.querySelector('.tc-talk');

    // el navegador no debe hacer zoom, desplazar ni simular clics de ratón
    root.addEventListener('touchstart', (e) => { if (e.target.closest('.tc-zone, .tc-b')) e.preventDefault(); }, { passive: false });
    root.addEventListener('contextmenu', (e) => e.preventDefault());

    this.zone.addEventListener('pointerdown', (e) => this.stickDown(e));
    addEventListener('pointermove', (e) => this.stickMove(e));
    addEventListener('pointerup', (e) => this.stickUp(e));
    addEventListener('pointercancel', (e) => this.stickUp(e));

    for (const b of root.querySelectorAll('.tc-b')) {
      const [, k, , hold] = BUTTONS.find(x => x[0] === b.dataset.id);
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.setPointerCapture?.(e.pointerId);
        b.classList.add('on');
        key('keydown', k);
        if (!hold) key('keyup', k);
        navigator.vibrate?.(hold ? 8 : 15);
      });
      const up = () => {
        if (!b.classList.contains('on')) return;
        b.classList.remove('on');
        if (hold) key('keyup', k);
      };
      b.addEventListener('pointerup', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('lostpointercapture', up);
    }
    root.querySelector('.tc-more').addEventListener('click', () => this.menu.classList.toggle('on'));
    this.menu.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      key('keydown', b.dataset.k);
      key('keyup', b.dataset.k);
      this.menu.classList.remove('on');
    });
  }

  stickDown(e) {
    if (this.stick) return;
    this.zone.setPointerCapture?.(e.pointerId);
    this.stick = { id: e.pointerId, ox: e.clientX, oy: e.clientY };
    this.knob.style.left = e.clientX + 'px';
    this.knob.style.top = e.clientY + 'px';
    this.knob.classList.add('on');
    this.knob.firstElementChild.style.transform = '';
  }

  stickMove(e) {
    const s = this.stick;
    if (!s || e.pointerId !== s.id) return;
    let dx = (e.clientX - s.ox) / RADIUS, dy = (e.clientY - s.oy) / RADIUS;
    const len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    this.knob.firstElementChild.style.transform = `translate(${dx * RADIUS}px, ${dy * RADIUS}px)`;
    const dz = (v) => (Math.abs(v) < DEAD ? 0 : (v - Math.sign(v) * DEAD) / (1 - DEAD));
    // derecha = girar a la derecha (steer negativo), arriba = acelerar
    this.input.axis.x = -dz(dx);
    this.input.axis.y = -dz(dy);
  }

  stickUp(e) {
    if (!this.stick || e.pointerId !== this.stick.id) return;
    this.stick = null;
    this.knob.classList.remove('on');
    this.input.axis.x = 0;
    this.input.axis.y = 0;
  }

  /**
   * cada fotograma: oculta lo que no toca y cambia los textos según estés en
   * coche o a pie (enterLabel: en un local, el botón amarillo dice Entrar o Salir)
   */
  update(mode, hidden, fireLabel = 'Disparar', enterLabel = null) {
    this.root.classList.toggle('off', hidden);
    if (this.fireLabel !== fireLabel) {
      this.fireLabel = fireLabel;
      this.root.querySelector('.tc-fire').textContent = fireLabel;
    }
    if (hidden && this.stick) this.stickUp({ pointerId: this.stick.id });
    const enter = enterLabel || (mode === 'car' ? 'Bajar' : 'Subir');
    if (this.enterLabel !== enter) {
      this.enterLabel = enter;
      this.enterBtn.textContent = enter;
    }
    if (this.mode === mode) return;
    this.mode = mode;
    this.talkBtn.style.display = mode === 'car' ? 'none' : '';
    this.root.classList.toggle('foot', mode !== 'car');
  }
}

/** al pulsar Conducir en el móvil: pantalla completa y horizontal si se puede */
export async function goFullscreen() {
  try {
    await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
    await screen.orientation?.lock?.('landscape');
  } catch { /* iPhone y otros no lo permiten: se juega igual */ }
}
