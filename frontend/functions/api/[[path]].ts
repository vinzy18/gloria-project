// Proxy semua request /api/* ke backend di Render
export async function onRequest(context: {
  request: Request;
  env: { BACKEND_URL: string };
}) {
  const url = new URL(context.request.url);
  const target = new URL(url.pathname + url.search, context.env.BACKEND_URL);
  return fetch(new Request(target, context.request));
}