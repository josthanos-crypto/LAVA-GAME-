// prueba de los locales: puerta, entrar, hablar, pedir, salir; fotos de dentro y de fuera
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const mobile = process.argv[2] === 'm';
  const only = process.argv[3] || null;
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(mobile ? { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : { viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/mapillary|404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/sub/index.html?t=12');
  await p.waitForFunction(() => { const b = document.getElementById('start-btn'); return b && getComputedStyle(b).display !== 'none'; }, null, { timeout: 240000 });
  await p.click('#start-btn', { timeout: 180000 });
  await p.waitForTimeout(2500);
  const pre = mobile ? 'mv_' : 'pc_';
  // a pie
  await p.evaluate(() => { const g = window.__game; g.player.vel.set(0, 0); g.toggleFoot(); });
  await p.waitForTimeout(800);
  const ids = await p.evaluate(() => window.__game.locales.defs.map(d => d.id));
  const state = () => p.evaluate(() => {
    const g = window.__game, L = g.locales;
    return {
      inside: L.inside?.id || null, prompt: document.getElementById('prompt').textContent,
      dialog: document.getElementById('dialog').classList.contains('on') ? document.querySelector('#dialog .who').textContent + ': ' + document.querySelector('#dialog .text').textContent : '',
      toast: document.getElementById('toast').textContent, money: g.missions.money, health: Math.round(g.combat.health),
      enterBtn: document.querySelector('#touch .tc-enter')?.textContent || null,
    };
  });
  const skipFade = async () => {
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => { const L = window.__game.locales; if (L.pending) L.pending.t += 0.31; });
      await p.waitForTimeout(400);
    }
  };
  for (const id of ids) {
    if (only && id !== only) continue;
    // delante de la puerta, mirando hacia ella
    await p.evaluate((id) => {
      const g = window.__game, d = g.locales.defs.find(q => q.id === id);
      g.onFoot.placeAt(d.spot.x + d.door.nx * 0.4, d.spot.z + d.door.nz * 0.4, Math.atan2(-d.door.nx, -d.door.nz));
    }, id);
    await p.waitForTimeout(1500);
    console.log(id, 'en la puerta', JSON.stringify(await state()));
    // foto de la fachada desde la acera de enfrente
    await p.evaluate((id) => {
      const g = window.__game, d = g.locales.defs.find(q => q.id === id), D = d.door;
      const far = id === 'tanatorio' ? 17 : 11;
      g.camOverride = { pos: [D.x + D.nx * far - D.nz * 2, 2.2, D.z + D.nz * far + D.nx * 2], look: [D.x, id === 'tanatorio' ? 3.2 : 2.2, D.z], fov: 62 };
    }, id);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${pre}loc_${id}_fuera.png` });
    await p.evaluate(() => { window.__game.camOverride = null; });
    // entrar
    await p.keyboard.press('f');
    await skipFade();
    await p.waitForTimeout(1500);
    console.log(id, 'dentro', JSON.stringify(await state()));
    await p.screenshot({ path: `${pre}loc_${id}_dentro.png` });
    // vista desde arriba de todo el local (el techo no tapa desde fuera)
    await p.evaluate(() => {
      const g = window.__game, b = g.locales.inside.built;
      const xs = b.rooms.flatMap(r => [r.x0, r.x1]), zs = b.rooms.flatMap(r => [r.z0, r.z1]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cz = (Math.min(...zs) + Math.max(...zs)) / 2;
      const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs));
      g.camOverride = { pos: [cx, span * 1.25 + 4, cz + span * 0.35], look: [cx, 0, cz], fov: 55 };
    });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${pre}loc_${id}_planta.png` });
    await p.evaluate(() => { window.__game.camOverride = null; });
    // hablar con cada uno que tenga algo que contar
    const npcs = await p.evaluate(() => window.__game.locales.inside.built.npcs.filter(n => n.talk).map(n => n.name));
    for (const name of npcs) {
      await p.evaluate((name) => {
        const g = window.__game, n = g.locales.inside.built.npcs.find(q => q.name === name);
        const a = n.heading;
        g.onFoot.placeAt(n.x + Math.sin(a) * 1.5, n.z + Math.cos(a) * 1.5, a + Math.PI);
      }, name);
      await p.waitForTimeout(1200);
      const s0 = await state();
      await p.keyboard.press('t');
      await p.waitForTimeout(1500);
      const s1 = await state();
      console.log(' ', name, '| aviso:', s0.prompt, '| dice:', s1.dialog);
      if (name === npcs[0]) await p.screenshot({ path: `${pre}loc_${id}_habla.png` });
      // pasar las frases hasta que termine y aceptar lo que ofrezca
      for (let i = 0; i < 8 && (await state()).dialog; i++) { await p.keyboard.press('t'); await p.waitForTimeout(300); await p.keyboard.press('t'); await p.waitForTimeout(300); }
      await p.waitForTimeout(600);
      const s2 = await state();
      if (s2.prompt.startsWith('T')) {
        const before = await p.evaluate(() => { const g = window.__game; g.combat.health = 40; return { money: g.missions.money, look: JSON.stringify(g.onFoot.parts ? 1 : 0) }; });
        await p.keyboard.press('t');
        await p.waitForTimeout(800);
        for (let i = 0; i < 8 && (await state()).dialog; i++) { await p.keyboard.press('t'); await p.waitForTimeout(300); await p.keyboard.press('t'); await p.waitForTimeout(300); }
        await p.waitForTimeout(800);
        const s3 = await state();
        console.log('   oferta:', s2.prompt, '→ salud', s3.health, 'dinero', before.money, '→', s3.money, '| aviso:', s3.toast);
      }
    }
    // salir por la puerta
    await p.evaluate(() => {
      const g = window.__game, b = g.locales.inside.built;
      g.onFoot.placeAt(b.ox + b.exit[0], b.oz + b.exit[1] - 0.3, 0);
    });
    await p.waitForTimeout(1200);
    const sx = await state();
    await p.keyboard.press('f');
    await skipFade();
    await p.waitForTimeout(1200);
    const sy = await state();
    console.log(id, 'salida | aviso:', sx.prompt, '| botón:', sx.enterBtn, '→ fuera:', sy.inside === null);
  }
  console.log(errs.slice(0, 10).join('\n') || 'sin errores');
  await b.close();
})();
