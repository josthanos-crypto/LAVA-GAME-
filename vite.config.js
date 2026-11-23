import { defineConfig } from 'vite';
import { writeFileSync, readFileSync, mkdirSync, createReadStream, existsSync, statSync } from 'fs';
import { resolve } from 'path';

const MAPILLARY_CACHE = resolve(__dirname, '../data/mapillary/cache');

const shotPlugin = {
  name: 'debug-shot',
  configureServer(server) {
    server.middlewares.use('/__shot', (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; return res.end(); }
      let body = '';
      req.on('data', (c) => body += c);
      req.on('end', () => {
        try {
          const m = body.match(/^data:image\/(\w+);base64,(.+)$/s);
          const name = (req.url.replace(/^\//, '') || 'shot') + '.' + (m ? m[1] : 'jpg');
          const dir = resolve(__dirname, '.shots');
          mkdirSync(dir, { recursive: true });
          writeFileSync(resolve(dir, name), Buffer.from(m ? m[2] : body, 'base64'));
          res.end('ok:' + name);
        } catch (e) { res.statusCode = 500; res.end(String(e)); }
      });
    });
    // fotos reales de calle Mapillary (CC BY-SA) sin copiar 400MB a public/
    server.middlewares.use((req, res, next) => {
      const m = (req.url || '').match(/^\/mapillary\/cache\/([0-9a-zA-Z_-]+)(?:\.jpg)?(?:\?.*)?$/);
      if (!m) return next();
      const file = resolve(MAPILLARY_CACHE, m[1] + '.jpg');
      if (!existsSync(file) || !statSync(file).isFile()) {
        res.statusCode = 404;
        return res.end('not found');
      }
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      createReadStream(file).pipe(res);
    });
  },
};

// añadidos del PC de Arrecife (public/extras, ver su LEEME.md): arrecife-mapa.js va antes que el juego porque cambia
// map/arrecife.json al cargarlo. Lo que se construye encima (src/arrecifeExtras.js) ya lo importa main.js.
const extrasArrecife = {
  name: 'extras-arrecife',
  transformIndexHtml: () => [
    { tag: 'script', attrs: { src: './extras/arrecife-norte-datos.js' }, injectTo: 'head-prepend' },
    { tag: 'script', attrs: { src: './extras/arrecife-mapa.js' }, injectTo: 'head-prepend' },
  ],
};

// demo.html: la misma página en modo demo (partida nueva, no se guarda nada, sin policía; ver src/save.js)
const demoPage = {
  name: 'demo-page',
  apply: 'build',
  writeBundle(options) {
    const dir = options.dir || resolve(__dirname, 'dist');
    const page = resolve(dir, 'index.html');
    if (!existsSync(page)) return;
    const html = readFileSync(page, 'utf8')
      .replace('<head>', '<head>\n  <script>window.LAVA_DEMO = true;</script>')
      .replace(/<title>[^<]*<\/title>/, '<title>Lava Game · Demo</title>');
    writeFileSync(resolve(dir, 'demo.html'), html);
  },
};

export default defineConfig({ plugins: [shotPlugin, extrasArrecife, demoPage] });
