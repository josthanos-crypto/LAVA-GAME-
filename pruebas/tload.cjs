const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
 const mobile = process.argv[2] === 'm';
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext(mobile ? { viewport:{width:844,height:390}, isMobile:true, hasTouch:true, deviceScaleFactor:2,
   userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' } : { viewport:{width:1280,height:720} });
 const p=await ctx.newPage();
 const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message));
 p.on('response',r=>{ if(r.status()>=400 && !r.url().includes('mapillary')) errs.push('HTTP '+r.status()+' '+r.url()); });
 await p.goto('http://localhost:8765/sub/index.html');
 await p.waitForFunction(()=>{ const b=document.getElementById('start-btn'); return b && getComputedStyle(b).display!=='none'; }, null, {timeout:180000});
 await p.waitForTimeout(800);
 const pre = mobile ? 'mv' : 'pc';
 await p.screenshot({path: pre+'_loader.png'});
 // solapes: tarjeta frente al botón y a la ayuda
 const r = await p.evaluate(()=>{
   const R=(id)=>{ const e=document.getElementById(id) || document.querySelector(id); if(!e) return null; const b=e.getBoundingClientRect(); return {top:Math.round(b.top), bottom:Math.round(b.bottom), left:Math.round(b.left), right:Math.round(b.right), vis:getComputedStyle(e).display}; };
   return { sponsor: R('sponsor'), title: R('#loader .title'), btn: R('start-btn'), controls: R('#loader .controls'), help: R('touch-help') };
 });
 console.log(JSON.stringify(r));
 await p.click('#start-btn');
 await p.waitForTimeout(2500);
 await p.screenshot({path: pre+'_hudbrand.png'});
 console.log(errs.slice(0,8).join('\n')||'sin errores');
 await b.close();})();
