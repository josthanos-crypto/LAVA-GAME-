// Registro de jugadores: correo (obligatorio, se confirma desde el correo) + teléfono (opcional) + permiso
// de publicidad. También se entra con un código de invitación (tiempo limitado). Solo en la web de Canary
// Consulting (o con ?registro en la dirección, para probar); el servidor es juego/registro.php.
const VERSION = 'v1';
const TEXTO = 'Acepto recibir comunicaciones comerciales y publicidad de Canary Consulting (ofertas y novedades de luz, gas y energía) por correo electrónico, SMS o WhatsApp. Puedo darme de baja cuando quiera.';
const K_REGISTRO = 'lava.registro';
const K_INVITACION = 'lava.invitacion';
const K_DISPOSITIVO = 'lava.dispositivo';
const SONDEO_MS = 4000;

const params = new URLSearchParams(location.search);
// (Version 179) En el servidor de casa la entrada es libre «de momento» (lo pidió José Manuel el 26-11-2026): allí no
// está registro.php. Para volver a pedir registro en esa dirección, quitarla de esta lista.
const ENTRADA_LIBRE = ['servidor.canaryislandconsulting.es'];
const enWeb = /(^|\.)canaryislandconsulting\.es$/.test(location.hostname) && !ENTRADA_LIBRE.includes(location.hostname);
const activo = enWeb || params.has('registro');

const leer = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } };
const borrar = (k) => { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } };

function dispositivo() {
  try {
    let d = localStorage.getItem(K_DISPOSITIVO);
    if (d && /^[a-f0-9]{32}$/.test(d)) return d;
    d = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(K_DISPOSITIVO, d);
    return d;
  } catch {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}

async function llamar(cuerpo) {
  const r = await fetch('registro.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  });
  const j = await r.json().catch(() => ({}));
  return { ...j, ok: r.ok && j.ok === true, status: r.status };
}

const CSS = `
#reg { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; padding: 16px; overflow-y: auto;
  background: rgba(8,3,2,.78); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  font-family: var(--hud-font); color: #f3e6d8; transition: opacity .5s ease; }
#reg.out { opacity: 0; pointer-events: none; }
#reg .card { width: min(440px, 100%); padding: 26px 24px; border-radius: 22px; background: linear-gradient(170deg, #2a1409, #130703);
  border: 1px solid rgba(255,150,70,.4); box-shadow: 0 24px 80px rgba(0,0,0,.6), 0 0 60px rgba(255,90,20,.18); margin: auto; }
#reg h2 { font-size: 34px; font-weight: 800; font-style: italic; text-transform: uppercase; line-height: .95;
  background: linear-gradient(180deg, #fff3c4, #ffc233 35%, #ff6a12 80%); -webkit-background-clip: text; background-clip: text; color: transparent; }
#reg p.lead { margin-top: 8px; font-size: 17px; font-weight: 500; color: #d9c8b8; line-height: 1.35; }
#reg p.lead b { color: #fff; word-break: break-all; }
#reg input[type="email"], #reg input[type="tel"], #reg input.txt { width: 100%; margin-top: 12px; font: inherit; font-size: 20px; font-weight: 600; padding: 11px 16px;
  border-radius: 14px; color: #fff; background: rgba(0,0,0,.4); border: 1px solid rgba(255,150,70,.5); outline: none; }
#reg input.txt { text-transform: uppercase; letter-spacing: 2px; text-align: center; }
#reg input:focus-visible { border-color: #ff9a1f; box-shadow: 0 0 0 3px rgba(255,154,31,.28); }
#reg label.ok { display: flex; gap: 10px; align-items: flex-start; margin-top: 14px; font-size: 15px; line-height: 1.35; font-weight: 500; cursor: pointer; }
#reg label.ok input { width: 20px; height: 20px; flex: none; margin-top: 2px; accent-color: #ff5a14; cursor: pointer; }
#reg .legal { margin-top: 12px; font-size: 12.5px; line-height: 1.4; color: #a69383; font-weight: 500; }
#reg .legal a { color: #ffb340; }
#reg .err { min-height: 20px; margin-top: 10px; font-size: 15px; font-weight: 700; color: #ff8a6b; }
#reg .err.good { color: #8be3a3; }
#reg button.go { width: 100%; margin-top: 6px; font: inherit; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; cursor: pointer;
  padding: 12px; border-radius: 999px; color: #1a0a03; border: 0; background: linear-gradient(180deg, #ffc233, #ff6a12); box-shadow: 0 8px 26px rgba(255,100,20,.45); }
#reg button.go:disabled { opacity: .55; cursor: wait; }
#reg button.sec { display: block; width: 100%; margin-top: 12px; font: inherit; font-size: 16px; font-weight: 700; cursor: pointer; padding: 8px;
  color: #ffb340; background: none; border: 0; text-decoration: underline; }
#reg .trap { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
#reg [hidden] { display: none !important; }
#reg-tiempo { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 80; padding: 5px 14px; border-radius: 999px;
  font: 700 15px var(--hud-font); letter-spacing: .5px; color: #ffe2b8; background: rgba(24,12,8,.72); border: 1px solid rgba(255,150,70,.4);
  pointer-events: none; }
`;

const PANELES = `
<div class="card" data-p="form">
  <form id="reg-form" novalidate>
    <h2>Antes de jugar</h2>
    <p class="lead">Regístrate gratis con tu correo y entras en Arrecife.</p>
    <input id="reg-correo" type="email" inputmode="email" autocomplete="email" placeholder="tu@correo.com" aria-label="Tu correo" required>
    <input id="reg-tel" type="tel" inputmode="tel" autocomplete="tel" placeholder="Teléfono (opcional)" aria-label="Tu teléfono, si quieres ponerlo">
    <div class="trap" aria-hidden="true"><input id="reg-web" type="text" tabindex="-1" autocomplete="off"></div>
    <label class="ok"><input id="reg-acepto" type="checkbox"><span id="reg-texto"></span></label>
    <p class="legal">Responsable: José Manuel Pérez Cabrera (Canary Consulting). Finalidad: crear tu registro de jugador y enviarte publicidad.
      Base legal: tu consentimiento. Conservamos tus datos hasta que te des de baja. Puedes acceder, rectificar, borrar tus datos o darte de baja
      escribiendo a <a href="mailto:info@canaryislandconsulting.es">info@canaryislandconsulting.es</a>.
      <a href="privacidad.html" target="_blank" rel="noopener">Política de privacidad</a></p>
    <div class="err" data-err role="alert"></div>
    <button class="go" type="submit">Registrarme</button>
    <button class="sec" type="button" data-ir="codigo">Tengo un código de invitación</button>
  </form>
</div>
<div class="card" data-p="espera" hidden>
  <h2>Revisa tu correo</h2>
  <p class="lead">Te hemos mandado un correo a <b id="reg-destino"></b>. Ábrelo y pulsa el botón de dentro: entras aquí solo. Mira también en spam.</p>
  <div class="err" data-err role="alert"></div>
  <button class="go" type="button" id="reg-reenviar">Reenviar el correo</button>
  <button class="sec" type="button" id="reg-otro">Usar otro correo</button>
</div>
<div class="card" data-p="codigo" hidden>
  <form id="reg-form-codigo" novalidate>
    <h2>Código de invitación</h2>
    <p class="lead">Escribe el código que te hemos mandado y juegas sin registrarte, durante el tiempo que te hayamos dado.</p>
    <input id="reg-codigo" class="txt" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="LAVA-XXXX-XXXX" aria-label="Código de invitación" maxlength="20">
    <div class="err" data-err role="alert"></div>
    <button class="go" type="submit">Entrar con el código</button>
    <button class="sec" type="button" data-ir="form">Prefiero registrarme</button>
  </form>
</div>`;

let cont = null;
let sondeo = null;
let temporizador = null;
let pildora = null;

function estilos() {
  if (document.getElementById('reg-css')) return;
  const style = document.createElement('style');
  style.id = 'reg-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function cerrar() {
  clearInterval(sondeo);
  sondeo = null;
  if (!cont) return;
  const c = cont;
  cont = null;
  c.classList.add('out');
  setTimeout(() => c.remove(), 600);
}

function mensaje(texto, bueno = false) {
  for (const e of cont.querySelectorAll('[data-err]')) {
    e.textContent = texto || '';
    e.classList.toggle('good', bueno);
  }
}

function panel(nombre, texto = '') {
  for (const p of cont.querySelectorAll('[data-p]')) p.hidden = p.dataset.p !== nombre;
  mensaje(texto);
  const foco = { form: '#reg-correo', codigo: '#reg-codigo' }[nombre];
  if (foco) cont.querySelector(foco)?.focus();
}

function empezarSondeo(ticket) {
  clearInterval(sondeo);
  const mirar = async () => {
    if (!cont) return;
    try {
      const r = await llamar({ accion: 'estado', ticket });
      if (!cont) return;
      if (r.ok && r.estado === 'listo') {
        guardar(K_REGISTRO, { version: VERSION, ok: true });
        cerrar();
      } else if (r.status === 404) {
        borrar(K_REGISTRO);
        clearInterval(sondeo);
        panel('form', r.mensaje);
      }
    } catch { /* sin conexión: se vuelve a intentar */ }
  };
  sondeo = setInterval(mirar, SONDEO_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) mirar(); });
}

function pasarAEspera(ticket, contacto, aviso = '') {
  cont.querySelector('#reg-destino').textContent = contacto;
  panel('espera', aviso);
  empezarSondeo(ticket);
}

function montar(inicial, aviso = '', codigoPrevio = '') {
  estilos();
  cont = document.createElement('div');
  cont.id = 'reg';
  cont.innerHTML = PANELES;
  document.body.appendChild(cont);
  cont.querySelector('#reg-texto').textContent = TEXTO;
  if (codigoPrevio) cont.querySelector('#reg-codigo').value = codigoPrevio;

  // mientras se escribe, las letras no son teclas del juego
  for (const ev of ['keydown', 'keyup', 'keypress']) cont.addEventListener(ev, (e) => e.stopPropagation());

  for (const b of cont.querySelectorAll('[data-ir]')) b.addEventListener('click', () => panel(b.dataset.ir));

  const formulario = cont.querySelector('#reg-form');
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = cont.querySelector('#reg-correo').value.trim();
    const boton = formulario.querySelector('button.go');
    if (!/^\S+@\S+\.\S+$/.test(correo)) { mensaje('Escribe un correo válido'); return; }
    if (!cont.querySelector('#reg-acepto').checked) { mensaje('Tienes que aceptar la publicidad para jugar'); return; }
    mensaje('');
    boton.disabled = true;
    try {
      const r = await llamar({
        accion: 'registrar', contacto: correo, telefono: cont.querySelector('#reg-tel').value.trim(),
        acepto: true, version: VERSION, web: cont.querySelector('#reg-web').value,
      });
      if (!r.ok) { mensaje(r.mensaje || 'No hemos podido guardar tu registro. Inténtalo otra vez'); return; }
      if (r.estado === 'listo') {
        guardar(K_REGISTRO, { version: VERSION, ok: true });
        cerrar();
        return;
      }
      guardar(K_REGISTRO, { version: VERSION, pendiente: true, ticket: r.ticket, contacto: correo });
      pasarAEspera(r.ticket, correo, r.mensaje || '');
    } catch {
      mensaje('No hay conexión con el servidor. Inténtalo otra vez');
    } finally {
      boton.disabled = false;
    }
  });

  cont.querySelector('#reg-reenviar').addEventListener('click', async (e) => {
    const pendiente = leer(K_REGISTRO);
    if (!pendiente?.ticket) { panel('form'); return; }
    e.target.disabled = true;
    try {
      const r = await llamar({ accion: 'reenviar', ticket: pendiente.ticket });
      if (r.ok && r.estado === 'listo') { guardar(K_REGISTRO, { version: VERSION, ok: true }); cerrar(); return; }
      mensaje(r.ok ? 'Correo reenviado. Mira tu bandeja (y el spam)' : (r.mensaje || 'No hemos podido reenviarlo'), r.ok);
    } catch {
      mensaje('No hay conexión con el servidor. Inténtalo otra vez');
    } finally {
      e.target.disabled = false;
    }
  });

  cont.querySelector('#reg-otro').addEventListener('click', () => {
    borrar(K_REGISTRO);
    clearInterval(sondeo);
    panel('form');
  });

  const formCodigo = cont.querySelector('#reg-form-codigo');
  formCodigo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = cont.querySelector('#reg-codigo').value.trim();
    const boton = formCodigo.querySelector('button.go');
    if (!codigo) { mensaje('Escribe tu código'); return; }
    mensaje('');
    boton.disabled = true;
    try {
      const r = await llamar({ accion: 'codigo', codigo, dispositivo: dispositivo() });
      if (!r.ok) { mensaje(r.mensaje || 'No hemos podido comprobar el código. Inténtalo otra vez'); return; }
      guardar(K_INVITACION, { codigo, fin: Date.now() + r.restan * 1000 });
      cerrar();
      programarFin(r.restan * 1000);
    } catch {
      mensaje('No hay conexión con el servidor. Inténtalo otra vez');
    } finally {
      boton.disabled = false;
    }
  });

  const pendiente = leer(K_REGISTRO);
  if (inicial === 'espera' && pendiente?.ticket) pasarAEspera(pendiente.ticket, pendiente.contacto || '', aviso);
  else panel(inicial === 'espera' ? 'form' : inicial, aviso);
}

function textoRestante(ms) {
  const min = Math.max(0, Math.ceil(ms / 60000));
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

function programarFin(restanMs) {
  const fin = Date.now() + restanMs;
  clearTimeout(temporizador);
  pildora?.remove();
  pildora = document.createElement('div');
  pildora.id = 'reg-tiempo';
  estilos();
  document.body.appendChild(pildora);
  const pintar = () => { pildora.textContent = `Invitado · quedan ${textoRestante(fin - Date.now())}`; };
  pintar();
  const reloj = setInterval(pintar, 20000);
  temporizador = setTimeout(() => {
    clearInterval(reloj);
    pildora.remove();
    pildora = null;
    borrar(K_INVITACION);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape' })); // pausa el juego
    if (!cont) montar('form', 'Se acabó tu tiempo de invitado. Regístrate para seguir jugando');
  }, restanMs);
}

async function arrancar() {
  if (!activo) return;
  const reg = leer(K_REGISTRO);
  if (reg?.version === VERSION && reg.ok) return;

  const inv = leer(K_INVITACION);
  if (inv?.codigo) {
    try {
      const r = await llamar({ accion: 'codigo', codigo: inv.codigo, dispositivo: dispositivo() });
      if (r.ok) { programarFin(r.restan * 1000); return; }
      borrar(K_INVITACION);
      montar('form', r.mensaje || '');
    } catch {
      // sin conexión: vale lo que quedaba apuntado en este navegador
      if (inv.fin > Date.now()) programarFin(inv.fin - Date.now());
      else { borrar(K_INVITACION); montar('form'); }
    }
    return;
  }

  const codigoEnlace = params.get('codigo');
  if (codigoEnlace) { montar('codigo', '', codigoEnlace); return; }
  if (reg?.version === VERSION && reg.pendiente) { montar('espera'); return; }
  montar('form');
}

arrancar();
