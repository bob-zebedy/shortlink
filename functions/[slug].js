import page404 from "./404.html";
import { getFormattedTime, collectAccessInfo } from "./utils.js";

export async function onRequestGet(context) {
  const { env, params, request, waitUntil } = context;
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

  waitUntil(recordAccess(env, slug, request));

  return Response.redirect(originURL.url, 302);
}

async function recordAccess(env, slug, request) {
  try {
    const accessInfo = collectAccessInfo(request);
    const accessInfoJson = JSON.stringify(accessInfo);

    await env.DB.prepare(
      `INSERT INTO logs (slug, cinfo, ctime) VALUES (?, ?, ?)`
    )
      .bind(slug, accessInfoJson, getFormattedTime())
      .run();
  } catch (error) {
    console.error(`记录访问失败: ${error}`);
  }
}
