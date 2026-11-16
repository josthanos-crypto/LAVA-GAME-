import { CHARACTERS, getLook, setLook, resetLook, defaultLook } from './character.js';

/**
 * Menú de personalización (tecla M): piel, peinado y color de pelo, barba,
 * gafas, gorra, camiseta, mangas, pantalón largo o corto, zapatillas y
 * altura. Los cambios se ven al momento sobre el personaje y se guardan
 * en el navegador para la próxima partida.
 */

const SKINS = [0xf1d3b8, 0xe2b896, 0xd9a47a, 0xc28a62, 0x9a6844, 0x6e4a32, 0x4a3022];
const HAIRS = [0x1e1712, 0x3a2a1c, 0x6a4a2a, 0xc9a650, 0xe8c66a, 0xb04a2a, 0x9a9a9a, 0xe8e2d8];
const CLOTHES = [0xf2f2f2, 0x1c1c1e, 0x3a5f8a, 0x1f4fa8, 0x18c5b8, 0x3e8a4f, 0xd8b030, 0xff7a45, 0xb84a36, 0x7a6a9a, 0xd88a9a, 0x8a6a4a];
const PANTS = [0x34465c, 0x1e2024, 0x4a5568, 0x6b5844, 0xc8b89a, 0xffa63d, 0x2f6b5a, 0xf2f2f2];
const SHOES = [0xf4f1ea, 0x1e1e20, 0x8a6a4a, 0xd8271c, 0x3a4a6a, 0x18c5b8];
const STYLES = [['short', 'Corto'], ['surf', 'Surfero'], ['long', 'Largo'], ['curly', 'Rizado'], ['ponytail', 'Coleta'], ['bun', 'Moño'], ['rapado', 'Rapado'], ['calvo', 'Calvo']];
const TOPS = [['tshirt', 'Camiseta'], ['tank', 'Tirantes'], ['long', 'Manga larga'], ['jacket', 'Chaqueta']];
const FOOT = [['sneaker', 'Zapatillas'], ['shoe', 'Zapatos'], ['sandal', 'Sandalias']];

const hex = (n) => '#' + n.toString(16).padStart(6, '0');
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export class Customizer {
  constructor(el, { onChange, onClose }) {
    this.el = el;
    this.onChange = onChange;
    this.onClose = onClose;
    this.key = 'noah';
    this.look = null;
    this.open = false;
    el.addEventListener('click', (e) => this.click(e));
    el.addEventListener('input', (e) => {
      if (e.target.id !== 'cz-height') return;
      // sin volver a pintar el panel, para no cortar el arrastre del control
      this.look.height = Number(e.target.value) / 100;
      setLook(this.key, this.look);
      this.onChange?.(this.look);
      el.querySelector('.cz-val').textContent = this.look.height.toFixed(2) + ' m';
    });
  }

  show(key) {
    this.key = key;
    this.look = getLook(key);
    this.open = true;
    this.render();
    this.el.classList.add('on');
  }

  hide() {
    this.open = false;
    this.el.classList.remove('on');
    this.onClose?.();
  }

  apply() {
    setLook(this.key, this.look);
    this.onChange?.(this.look);
    this.render();
  }

  swatches(field, list) {
    return `<div class="cz-sw">${list.map(c => `<button type="button" data-f="${field}" data-v="${c}" style="--c:${hex(c)}" class="${this.look[field] === c ? 'sel' : ''}" aria-label="${hex(c)}"></button>`).join('')}</div>`;
  }

  choices(field, list) {
    return list.map(([v, l]) => `<button type="button" class="cz-tg ${(this.look[field] || list[0][0]) === v ? 'sel' : ''}" data-f="${field}" data-s="${v}">${l}</button>`).join('');
  }

  toggle(field, label) {
    return `<button type="button" class="cz-tg ${this.look[field] ? 'sel' : ''}" data-t="${field}">${label}</button>`;
  }

  render() {
    const L = this.look;
    this.el.innerHTML = `
      <div class="cz-head">
        <div><div class="cz-eyebrow">Personaliza a</div><div class="cz-name">${CHARACTERS[this.key].name}</div></div>
        <button type="button" class="cz-x" data-a="close" aria-label="Cerrar">×</button>
      </div>
      <div class="cz-body">
        <section><h4>Piel</h4>${this.swatches('skin', SKINS)}</section>
        <section><h4>Peinado</h4><div class="cz-row">${this.choices('hairStyle', STYLES)}</div>
          ${this.swatches('hair', HAIRS)}</section>
        <section><h4>Complementos</h4><div class="cz-row">${this.toggle('beard', 'Barba')}${this.toggle('shades', 'Gafas de sol')}${this.toggle('cap', 'Gorra')}</div>
          ${L.cap ? this.swatches('capColor', CLOTHES) : ''}</section>
        <section><h4>Arriba</h4><div class="cz-row">${this.choices('topStyle', TOPS)}</div>
          ${this.swatches('top', CLOTHES)}<h5>${L.topStyle === 'jacket' ? 'Camiseta de dentro' : 'Mangas'}</h5>${this.swatches(L.topStyle === 'jacket' ? 'inner' : 'sleeves', CLOTHES)}</section>
        <section><h4>Pantalón</h4><div class="cz-row"><button type="button" class="cz-tg ${!L.shorts ? 'sel' : ''}" data-f="shorts" data-b="0">Largo</button><button type="button" class="cz-tg ${L.shorts ? 'sel' : ''}" data-f="shorts" data-b="1">Bermudas</button></div>
          ${this.swatches('bottom', PANTS)}</section>
        <section><h4>Calzado</h4><div class="cz-row">${this.choices('shoeStyle', FOOT)}</div>${this.swatches('shoes', SHOES)}</section>
        <section><h4>Altura <span class="cz-val">${L.height.toFixed(2)} m</span></h4>
          <input id="cz-height" type="range" min="155" max="200" value="${Math.round(L.height * 100)}"></section>
      </div>
      <div class="cz-foot">
        <button type="button" data-a="random">Aleatorio</button>
        <button type="button" data-a="reset">Original</button>
        <button type="button" class="cz-ok" data-a="close">Listo</button>
      </div>`;
  }

  click(e) {
    const b = e.target.closest('button');
    if (!b) return;
    const L = this.look;
    if (b.dataset.a === 'close') { this.hide(); return; }
    if (b.dataset.a === 'reset') { resetLook(this.key); this.look = defaultLook(this.key); this.apply(); return; }
    if (b.dataset.a === 'random') {
      Object.assign(L, {
        skin: pick(SKINS), hair: pick(HAIRS), hairStyle: pick(STYLES)[0], top: pick(CLOTHES), sleeves: pick(CLOTHES),
        topStyle: pick(TOPS)[0], shoeStyle: pick(FOOT)[0], inner: pick(CLOTHES),
        bottom: pick(PANTS), shoes: pick(SHOES), shorts: Math.random() < 0.4, shades: Math.random() < 0.4,
        beard: L.sex !== 'f' && Math.random() < 0.4, cap: Math.random() < 0.3, capColor: pick(CLOTHES),
        height: L.sex === 'f' ? 1.56 + Math.random() * 0.2 : 1.6 + Math.random() * 0.35,
      });
      this.apply();
      return;
    }
    if (b.dataset.t) { L[b.dataset.t] = !L[b.dataset.t]; this.apply(); return; }
    const f = b.dataset.f;
    if (!f) return;
    if (b.dataset.s) L[f] = b.dataset.s;
    else if (b.dataset.b) L[f] = b.dataset.b === '1';
    else L[f] = Number(b.dataset.v);
    this.apply();
  }
}
