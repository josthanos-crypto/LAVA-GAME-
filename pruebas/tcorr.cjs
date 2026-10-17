// fotos de las correcciones: el Sakura al final de Fenauso, el rótulo del tanatorio con el teléfono
// y, dentro de Las Buganvillas, Calzado El Más Barato, el cartel de Areafit y el directorio
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/mapillary|404/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('http://localhost:8765/sub/index.html?t=12');
  await p.waitForFunction(() => { const b = document.getElementById('start-btn'); return b && getComputedStyle(b).display !== 'none'; }, null, { timeout: 240000 });
  await p.click('#start-btn', { timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.evaluate(() => { const g = window.__game; g.player.vel.set(0, 0); g.toggleFoot(); });
  const shot = async (name, cam, wait = 2500) => {
    await p.evaluate((cam) => { window.__game.camOverride = cam; }, cam);
    await p.waitForTimeout(wait);
    await p.screenshot({ path: name, timeout: 150000 });
  };
  const skipFade = async () => {
    for (let i = 0; i < 3; i++) {
      await p.evaluate(() => { const L = window.__game.locales; if (L.pending) L.pending.t += 0.31; });
      await p.waitForTimeout(400);
    }
  };

  // el Sakura: de frente desde la acera de enfrente y entrando por Fenauso desde Manolo Millares
  const sk = await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'sakura');
    g.onFoot.placeAt(d.spot.x + d.door.nx * 3, d.spot.z + d.door.nz * 3, Math.atan2(-d.door.nx, -d.door.nz));
    return { ...d.door, spot: d.spot };
  });
  console.log('Sakura puerta', JSON.stringify(sk));
  await p.waitForTimeout(2500);
  console.log('aviso en la acera:', await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'sakura');
    g.onFoot.placeAt(d.spot.x, d.spot.z, 0);
    return new Promise(r => setTimeout(() => r(document.getElementById('prompt').textContent), 900));
  }));
  await shot('corr_sakura_frente.png', { pos: [sk.x + sk.nx * 11 + 1.5, 2.0, sk.z + sk.nz * 11 + 3], look: [sk.x, 2.4, sk.z], fov: 62 });
  // por Fenauso hacia el norte, como un coche que entra desde Manolo Millares
  await shot('corr_sakura_calle.png', { pos: [-697.5, 2.4, 345], look: [-704, 2.0, 286], fov: 60 });
  await p.evaluate(() => window.__game.setTime(21.5));
  await p.waitForTimeout(1500);
  await shot('corr_sakura_noche.png', { pos: [sk.x + sk.nx * 11 + 1.5, 2.0, sk.z + sk.nz * 11 + 3], look: [sk.x, 2.4, sk.z], fov: 62 }, 3000);
  await p.evaluate(() => window.__game.setTime(12));

  // el tanatorio con el teléfono en el rótulo
  const tn = await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'tanatorio');
    g.onFoot.placeAt(d.spot.x + d.door.nx * 3, d.spot.z + d.door.nz * 3, 0);
    return d.door;
  });
  await p.waitForTimeout(2000);
  await shot('corr_tanatorio.png', { pos: [tn.x + tn.nx * 13, 1.8, tn.z + tn.nz * 13], look: [tn.x, 3.2, tn.z], fov: 60 }, 3000);
  await p.evaluate(() => { window.__game.camOverride = null; });

  // dentro de Las Buganvillas, con Iria (para ver el «bienvenida»)
  await p.keyboard.press('4');
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    const g = window.__game, d = g.locales.defs.find(q => q.id === 'buganvillas');
    g.onFoot.placeAt(d.spot.x + d.door.nx * 0.4, d.spot.z + d.door.nz * 0.4, Math.atan2(-d.door.nx, -d.door.nz));
  });
  await p.waitForTimeout(1500);
  await p.keyboard.press('f');
  await skipFade();
  await p.waitForTimeout(1500);
  const o = await p.evaluate(() => { const b = window.__game.locales.inside.built; return [b.ox, b.oz]; });
  await shot('corr_bug_calzado.png', { pos: [o[0] + 1.6, 1.7, o[1] - 3.6], look: [o[0] - 2.19, 2.6, o[1] - 7.45], fov: 60 });
  await shot('corr_bug_areafit.png', { pos: [o[0] + 0.6, 1.7, o[1] - 10.5], look: [o[0] + 1.1, 2.6, o[1] - 15.97], fov: 60 });
  await shot('corr_bug_directorio.png', { pos: [o[0] + 0.9, 1.5, o[1] + 8.6], look: [o[0] + 2.83, 1.35, o[1] + 8.6], fov: 50 });
  await p.evaluate(() => { window.__game.camOverride = null; });
  // Eliseo saluda y cuenta lo suyo
  await p.evaluate(() => {
    const g = window.__game, n = g.locales.inside.built.npcs.find(q => q.name === 'Eliseo');
    g.onFoot.placeAt(n.x + Math.sin(n.heading) * 1.5, n.z + Math.cos(n.heading) * 1.5, n.heading + Math.PI);
  });
  await p.waitForTimeout(1200);
  await p.keyboard.press('t');
  await p.waitForTimeout(1500);
  console.log('Eliseo dice:', await p.evaluate(() => document.querySelector('#dialog .text').textContent));
  await p.waitForTimeout(2500);
  console.log('Eliseo, ya escrito:', await p.evaluate(() => document.querySelector('#dialog .text').textContent));
  console.log(errs.slice(0, 10).join('\n') || 'sin errores');
  await b.close();
})();
