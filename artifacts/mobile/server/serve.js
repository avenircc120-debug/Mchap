/**
 * Standalone production server for Expo static builds.
 * Serves static-build/ + a custom landing page with video, buy button & legal footer.
 * Zero external dependencies — uses only Node.js built-ins.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const STATIC_ROOT   = path.resolve(__dirname, '..', 'static-build');
const TEMPLATE_PATH = path.resolve(__dirname, 'templates', 'landing-page.html');
const basePath      = (process.env.BASE_PATH || '/').replace(/\/+$/, '');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css' : 'text/css; charset=utf-8',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif' : 'image/gif',
  '.svg' : 'image/svg+xml',
  '.ico' : 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf' : 'font/ttf', '.otf': 'font/otf',
  '.map' : 'application/json',
};

function getAppName() {
  try {
    const j = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'app.json'), 'utf-8'));
    return typeof j.expo?.name === 'string' ? j.expo.name : 'App Landing Page';
  } catch { return 'App Landing Page'; }
}

function escapeHtml(v) {
  return v.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
          .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
function toScriptString(v) {
  return JSON.stringify(v)
    .replaceAll('<','\\u003c').replaceAll('>','\\u003e').replaceAll('&','\\u0026');
}

/* ── Build dynamic HTML sections from env vars ────────────────────────────── */
function buildVideoSection() {
  const videoId = process.env.MCHAP_VIDEO_ID || '';
  const adsenseId = process.env.MCHAP_ADSENSE_ID || '';
  if (!videoId) return '';
  const adsenseBlock = adsenseId
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}" crossorigin="anonymous"></script>
       <ins class="adsbygoogle" style="display:block;width:100%;height:90px" data-ad-client="${adsenseId}" data-ad-slot="auto"></ins>
       <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`
    : '';
  return `
  <div class="mchap-video">
    <iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&rel=0"
      allow="autoplay; encrypted-media; fullscreen"
      allowfullscreen
    ></iframe>
  </div>
  ${adsenseBlock}
  `;
}

function buildBuySection(baseUrl) {
  const enabled = process.env.MCHAP_SHOP_ENABLED === 'true';
  if (!enabled) return '';
  const shopUrl  = process.env.MCHAP_SHOP_URL || baseUrl;
  const btnText  = process.env.MCHAP_SHOP_BUTTON_TEXT || 'Voir la boutique';
  return `<a href="${escapeHtml(shopUrl)}" class="mchap-buy" target="_blank" rel="noopener">
    🛍 ${escapeHtml(btnText)}
  </a>`;
}

function serveLandingPage(req, res, template, appName) {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol = forwardedProto || 'https';
  const host    = req.headers['x-forwarded-host'] || req.headers['host'];
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `exps://${host}${basePath}`;

  const html = template
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_ATTRIBUTE_PLACEHOLDER/g, escapeHtml(expsUrl))
    .replace(/EXPS_URL_JSON_PLACEHOLDER/g, toScriptString(expsUrl))
    .replace(/APP_NAME_PLACEHOLDER/g, escapeHtml(appName))
    .replace(/VIDEO_SECTION_PLACEHOLDER/g, buildVideoSection())
    .replace(/BUY_SECTION_PLACEHOLDER/g, buildBuySection(baseUrl))
    .replace(/LEGAL_BASE_PLACEHOLDER/g, baseUrl);

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}

function serveManifest(platform, res) {
  const manifestPath = path.join(STATIC_ROOT, platform, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: `Manifest not found for platform: ${platform}` }));
    return;
  }
  const manifest = fs.readFileSync(manifestPath, 'utf-8');
  res.writeHead(200, {
    'content-type': 'application/json',
    'expo-protocol-version': '1',
    'expo-sfv-version': '0',
  });
  res.end(manifest);
}

function serveStaticFile(urlPath, res) {
  const safePath = path.normalize(urlPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(STATIC_ROOT, safePath);
  if (!filePath.startsWith(STATIC_ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404); res.end('Not Found'); return;
  }
  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': contentType });
  res.end(fs.readFileSync(filePath));
}

const landingPageTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const appName = getAppName();

const server = http.createServer((req, res) => {
  const url      = new URL(req.url || '/', `http://${req.headers.host}`);
  let pathname   = url.pathname;
  if (basePath && pathname.startsWith(basePath)) pathname = pathname.slice(basePath.length) || '/';

  if (pathname === '/' || pathname === '/manifest') {
    const platform = req.headers['expo-platform'];
    if (platform === 'ios' || platform === 'android') return serveManifest(platform, res);
    if (pathname === '/') return serveLandingPage(req, res, landingPageTemplate, appName);
  }

  /* ── Legal sub-pages (auto-generated) ─────────────────────────────────── */
  if (pathname === '/politique-de-confidentialite') {
    const name = escapeHtml(appName);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Politique de confidentialité — ${name}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;line-height:1.7;color:#222}
    h1{font-size:24px}h2{font-size:18px;margin-top:28px}a{color:#FF3C00}</style></head>
    <body><h1>Politique de confidentialité</h1>
    <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</p>
    <h2>Collecte de données</h2>
    <p>Ce site utilise Google AdSense pour afficher des publicités personnalisées. Google peut utiliser des cookies pour personnaliser les annonces selon vos visites sur ce site et d'autres sites. Vous pouvez désactiver la personnalisation en visitant les <a href="https://www.google.com/settings/ads" target="_blank">paramètres des annonces Google</a>.</p>
    <h2>Cookies</h2>
    <p>Des cookies tiers (Google AdSense, YouTube) peuvent être déposés lors de votre visite. En continuant à naviguer sur ce site, vous acceptez l'utilisation de ces cookies conformément à notre politique.</p>
    <h2>Contact</h2>
    <p>Pour toute question relative à vos données : <a href="/contact">page de contact</a>.</p>
    </body></html>`);
    return;
  }

  if (pathname === '/cgv') {
    const name = escapeHtml(appName);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>CGV — ${name}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;line-height:1.7;color:#222}
    h1{font-size:24px}h2{font-size:18px;margin-top:28px}</style></head>
    <body><h1>Conditions Générales de Vente</h1>
    <p>Dernière mise à jour : ${new Date().toLocaleDateString('fr-FR')}</p>
    <h2>Produits et services</h2>
    <p>Les produits et services proposés sur ce site sont décrits avec la plus grande exactitude possible. En cas d'erreur ou d'omission, la responsabilité du vendeur ne pourra être engagée.</p>
    <h2>Prix</h2>
    <p>Les prix sont indiqués en euros toutes taxes comprises (TTC). Le vendeur se réserve le droit de modifier les prix à tout moment.</p>
    <h2>Commandes</h2>
    <p>Toute commande implique l'acceptation des présentes CGV. Le vendeur se réserve le droit de refuser ou d'annuler toute commande pour motif légitime.</p>
    <h2>Droit de rétractation</h2>
    <p>Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours pour exercer votre droit de rétractation à compter de la réception du produit.</p>
    </body></html>`);
    return;
  }

  if (pathname === '/contact') {
    const name = escapeHtml(appName);
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Contact — ${name}</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:system-ui,sans-serif;max-width:680px;margin:40px auto;padding:0 20px;line-height:1.7;color:#222}
    h1{font-size:24px}form{display:flex;flex-direction:column;gap:12px}
    input,textarea{padding:10px;border:1px solid #ccc;border-radius:8px;font-size:14px;width:100%;box-sizing:border-box}
    textarea{min-height:120px;resize:vertical}
    button{background:#FF3C00;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;cursor:pointer}</style></head>
    <body><h1>Nous contacter</h1>
    <p>Vous pouvez nous envoyer un message via le formulaire ci-dessous.</p>
    <form action="mailto:support@mchap.app" method="get">
      <input type="text" name="subject" placeholder="Sujet" required />
      <textarea name="body" placeholder="Votre message..."></textarea>
      <button type="submit">Envoyer</button>
    </form>
    </body></html>`);
    return;
  }

  serveStaticFile(pathname, res);
});

const port = parseInt(process.env.PORT || '3000', 10);
server.listen(port, '0.0.0.0', () => {
  console.log(`Serving static Expo build on port ${port}`);
});
