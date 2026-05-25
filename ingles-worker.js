// Cloudflare Worker — Proxy fallback para ingles.skynetdelbarbas.com
// Si el túnel responde → sirve contenido del Mac
// Si el túnel está caído/bloqueado → sirve desde GitHub Pages
// El usuario no nota nada, misma URL

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname + url.search;
    const ghPagesUrl = `https://skynetdelbarbas-dot.github.io/ing-2eso-repaso${path}`;

    try {
      // Intentar servir desde el origen (Mac vía túnel)
      // Timeout de 4s — si el túnel está caído o bloqueado, falla rápido
      const response = await fetch(request, {
        signal: AbortSignal.timeout(4000)
      });

      // Si el túnel devuelve contenido válido (nuestras páginas tienen "2º ESO")
      if (response.ok) {
        const text = await response.clone().text();
        if (text.includes('2º ESO') || text.includes('Repaso Inglés') || text.includes('Aprende y Practica') || text.includes('📚 Inglés')) {
          return response;
        }
      }

      // Respuesta inválida o bloqueada → caer en fallback
      throw new Error('Origin unavailable or blocked');
    } catch (e) {
      // Fallback: servir desde GitHub Pages
      try {
        const ghResponse = await fetch(ghPagesUrl);
        return new Response(ghResponse.body, {
          status: ghResponse.status,
          headers: ghResponse.headers
        });
      } catch (e2) {
        return new Response('Service unavailable', { status: 503 });
      }
    }
  }
}
