// Cloudflare Worker: proxy /api/* ke backend (Vercel), sisanya file statis hasil build Vite
type Env = {
  ASSETS: { fetch: typeof fetch };
  BACKEND_URL: string;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const target = new URL(url.pathname + url.search, env.BACKEND_URL);
      return fetch(new Request(target, request));
    }
    return env.ASSETS.fetch(request);
  },
};
