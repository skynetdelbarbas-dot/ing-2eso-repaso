// Cloudflare Worker — Proxy con failover para ingles.skynetdelbarbas.com
// - Rutas /api/* → siempre al túnel (tutor.skynetdelbarbas.com). Sin fallback, GitHub no tiene backend.
// - Rutas estáticas (GET) → túnel primero; si falla, sirve desde GitHub Pages.
// - El usuario no nota nada, misma URL, failover transparente.

const TUNNEL_BASE = 'https://tutor.skynetdelbarbas.com';
const GH_PAGES_BASE = 'https://skynetdelbarbas-dot.github.io/ing-2eso-repaso';

// Marcadores de contenido válido del sitio (para detectar bloqueo/respuesta inválida)
const SITE_MARKERS = [
  '📚 Inglés',
  'Aprende y Practica',
  'chat-widget.js',
  'English Tutor',
  'Repaso Inglés',
  'ing-2eso-repaso',
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const search = url.search;
    const isGet = request.method === 'GET';

    // ── 1) Rutas de API: solo túnel, no hay fallback ──
    if (path.startsWith('/api/')) {
      const tunnelUrl = `${TUNNEL_BASE}${path}${search}`;
      try {
        const response = await fetch(tunnelUrl, {
          method: request.method,
          headers: request.headers,
          signal: AbortSignal.timeout(8000)
        });
        return response;
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'Backend temporalmente no disponible', detail: e.message }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }
    }

    // ── 2) Contenido estático (GET): túnel con fallback a GitHub Pages ──
    const tunnelUrl = `${TUNNEL_BASE}${path}${search}`;
    const ghUrl = `${GH_PAGES_BASE}${path}${search}`;

    try {
      const response = await fetch(tunnelUrl, {
        method: request.method,
        headers: request.headers,
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          const text = await response.clone().text();
          if (SITE_MARKERS.some(marker => text.includes(marker))) {
            // No cachear HTML para que los cambios se vean al instante
            const headers = new Headers(response.headers);
            headers.set('Cache-Control', 'no-store, must-revalidate');
            return new Response(response.body, { status: response.status, headers });
          }
          throw new Error('Blocked content detected from origin');
        }
        return response; // No-HTML (JS, CSS, imágenes, etc.)
      }

      throw new Error(`Tunnel returned ${response.status}`);
    } catch (e) {
      // Fallback: GitHub Pages
      try {
        const ghResponse = await fetch(ghUrl);
        return new Response(ghResponse.body, {
          status: ghResponse.status,
          headers: ghResponse.headers
        });
      } catch (e2) {
        return new Response('Servicio temporalmente no disponible', { status: 503 });
      }
    }
  }
}
