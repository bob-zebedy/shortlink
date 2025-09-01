import page404 from "./404.html";

function getFormattedTime() {
  const now = new Date();

  const chinaTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
  );

  const year = chinaTime.getFullYear();
  const month = String(chinaTime.getMonth() + 1).padStart(2, "0");
  const day = String(chinaTime.getDate()).padStart(2, "0");
  const hours = String(chinaTime.getHours()).padStart(2, "0");
  const minutes = String(chinaTime.getMinutes()).padStart(2, "0");
  const seconds = String(chinaTime.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

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
