import page404 from "./404.html";

function getFormattedTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}

export async function onRequestGet(context) {
  const { request, env, params } = context;

  const clientIP =
    request.headers.get("x-forwarded-for") || request.headers.get("clientIP");
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("Referer") || "Direct";
  const formattedDate = getFormattedTime();
  const slug = params.id;

  const urlResult = await env.DB.prepare(`SELECT url FROM links WHERE slug = ?`)
    .bind(slug)
    .first();

  if (!urlResult) {
    return new Response(page404, {
      status: 404,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO logs (url, slug, ip, referer, ua, ctime) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(urlResult.url, slug, clientIP, referer, userAgent, formattedDate)
      .run();
  } catch (error) {
    console.error("日志记录失败:", error);
  }

  return Response.redirect(urlResult.url, 302);
}
