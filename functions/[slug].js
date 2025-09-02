import page404 from "./404.html";

export async function onRequestGet(context) {
  const { env, params } = context;
  const slug = params.slug;
  const originURL = await env.DB.prepare(`SELECT url FROM links WHERE slug = ?`)
    .bind(slug)
    .first();

  if (!originURL) {
    return new Response(page404, {
      status: 404,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  return Response.redirect(originURL.url, 302);
}
