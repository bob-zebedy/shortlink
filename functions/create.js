// 生成随机字符串
function generateRandomString(length) {
  const characters =
    "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

// 格式化当前时间为中国时间
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

// CORS 头部配置
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

export async function onRequest(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...CORS_HEADERS,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  const { request, env } = context;
  const originUrl = new URL(request.url);
  const clientIP =
    request.headers.get("x-forwarded-for") || request.headers.get("clientIP");
  const userAgent = request.headers.get("user-agent");
  const origin = `${originUrl.protocol}//${originUrl.hostname}`;
  const formattedDate = getFormattedTime();

  const { url, slug } = await request.json();
  if (!url) {
    return Response.json({ message: "缺少 URL" });
  }

  // URL格式检查
  if (!/^https?:\/\/.{3,}/.test(url)) {
    return Response.json(
      { message: "URL 格式不正确" },
      { headers: CORS_HEADERS, status: 400 }
    );
  }

  // 自定义slug长度检查：2-10个字符且不以文件后缀结尾
  if (
    slug &&
    (slug.length < 2 || slug.length > 10 || /.+\.[a-zA-Z]+$/.test(slug))
  ) {
    return Response.json(
      { message: "slug 长度必须在 2-10 个字符之间, 且不能以文件后缀结尾" },
      { headers: CORS_HEADERS, status: 400 }
    );
  }

  try {
    if (slug) {
      const existingUrl = await env.DB.prepare(
        `SELECT url FROM links WHERE slug = ?`
      )
        .bind(slug)
        .first();

      if (existingUrl && existingUrl.url === url) {
        return Response.json(
          { slug, link: `${origin}/${slug}` },
          { headers: CORS_HEADERS, status: 200 }
        );
      }

      // slug已被占用
      if (existingUrl) {
        return Response.json(
          { message: "该短链接已被占用" },
          { headers: CORS_HEADERS, status: 400 }
        );
      }
    }

    const existingSlug = await env.DB.prepare(
      `SELECT slug FROM links WHERE url = ?`
    )
      .bind(url)
      .first();

    if (existingSlug && !slug) {
      return Response.json(
        { slug: existingSlug.slug, link: `${origin}/${existingSlug.slug}` },
        { headers: CORS_HEADERS, status: 200 }
      );
    }

    const targetUrl = new URL(url);
    if (targetUrl.hostname === originUrl.hostname) {
      return Response.json(
        { message: "不能创建相同域名的短链接" },
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    // 生成最终的slug
    const finalSlug = slug || generateRandomString(4);

    // 插入新记录
    await env.DB.prepare(
      `INSERT INTO links (url, slug, ip, status, ua, ctime) VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(url, finalSlug, clientIP, 1, userAgent, formattedDate)
      .run();

    return Response.json(
      { slug: finalSlug, link: `${origin}/${finalSlug}` },
      { headers: CORS_HEADERS, status: 200 }
    );
  } catch (error) {
    console.error("创建短链接失败: ", error);
    return Response.json(
      { message: "内部错误" },
      { headers: CORS_HEADERS, status: 500 }
    );
  }
}
