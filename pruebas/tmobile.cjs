// móvil: aviso y botón Entrar en la puerta, menú con Iria, dentro con el botón Salir
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/mapillary|404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/sub/index.html');
  await p.waitForFunction(() => { const b = document.getElementById('start-btn'); return b && getComputedStyle(b).display !== 'none'; }, null, { timeout: 240000 });
  await p.screenshot({ path: 'mv_loader_locales.png' });
  await p.click('#start-btn');
  await p.waitForTimeout(2000);
  await p.evaluate(() => { const g = window.__game; g.player.vel.set(0, 0); g.toggleFoot(); });
  await p.waitForTimeout(600);
  // menú ··· con Iria
  await p.click('#touch .tc-more');
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'mv_menu_iria.png' });
  await p.click('#touch .tc-menu [data-k="4"]');
  await p.waitForTimeout(800);
  console.log('personaje', await p.evaluate(() => window.__game.onFoot.charKey), '|', await p.evaluate(() => document.getElementById('toast').textContent));
  // a la puerta del Maccheroni
  await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'maccheroni');
    g.onFoot.placeAt(d.spot.x + d.door.nx * 0.4, d.spot.z + d.door.nz * 0.4, Math.atan2(-d.door.nx, -d.door.nz));
  });
  await p.waitForTimeout(2000);
  const st = () => p.evaluate(() => ({ prompt: document.getElementById('prompt').textContent, on: document.getElementById('prompt').classList.contains('on'), boton: document.querySelector('#touch .tc-enter').textContent, inside: window.__game.locales.inside?.id || null }));
  console.log('puerta', JSON.stringify(await st()));
  await p.screenshot({ path: 'mv_puerta.png' });
  // botón amarillo
  const btn = await p.$('#touch .tc-enter');
  const bb = await btn.boundingBox();
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2);
  for (let i = 0; i < 3; i++) { await p.evaluate(() => { const L = window.__game.locales; if (L.pending) L.pending.t += 0.31; }); await p.waitForTimeout(400); }
  await p.waitForTimeout(2500);
  console.log('dentro', JSON.stringify(await st()));
  await p.screenshot({ path: 'mv_dentro.png' });
  // hablar con Andrea con el botón Hablar
  await p.evaluate(() => {
    const g = window.__game, n = g.locales.inside.built.npcs.find(q => q.name === 'Andrea');
    g.onFoot.placeAt(n.x + 1.0, n.z - 1.0, -0.8);
  });
  await p.waitForTimeout(1500);
  const talk = await p.$('#touch .tc-talk');
  const tb = await talk.boundingBox();
  await p.touchscreen.tap(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await p.waitForTimeout(1500);
  console.log('Andrea', await p.evaluate(() => document.querySelector('#dialog .text').textContent));
  await p.screenshot({ path: 'mv_habla.png' });
  // a la puerta de dentro: el botón dice Salir
  await p.evaluate(() => { const g = window.__game, b = g.locales.inside.built; g.onFoot.placeAt(b.ox + b.exit[0], b.oz + b.exit[1] - 0.3, 0); });
  await p.waitForTimeout(1500);
  console.log('salida', JSON.stringify(await st()));
  console.log(errs.slice(0, 10).join('\n') || 'sin errores');
  await b.close();
})();
