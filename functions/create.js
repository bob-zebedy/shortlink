import { getFormattedTime, collectAccessInfo } from "./utils.js";

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
  const originURL = new URL(request.url);
  const origin = `${originURL.protocol}//${originURL.hostname}`;

  const creatorInfo = collectAccessInfo(request);

  const creatorInfoJson = JSON.stringify(creatorInfo);

  const { url, slug } = await request.json();
  if (!url) {
    return Response.json({ message: "缺少 URL" });
  }

  if (!/^https?:\/\/.{3,}/.test(url)) {
    return Response.json(
      { message: "URL 格式不正确" },
      { headers: CORS_HEADERS, status: 400 }
    );
  }

  if (slug) {
    if (slug.length < 2 || slug.length > 10) {
      return Response.json(
        { message: "slug 长度必须在 2-10 个字符之间" },
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9]+$/.test(slug)) {
      return Response.json(
        { message: "slug 只能包含大小写字母和数字" },
        { headers: CORS_HEADERS, status: 400 }
      );
    }
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
    if (targetUrl.hostname === originURL.hostname) {
      return Response.json(
        { message: "不能创建相同域名的短链接" },
        { headers: CORS_HEADERS, status: 400 }
      );
    }

    const finalSlug = slug || generateRandomString(4);

    await env.DB.prepare(
      `INSERT INTO links (url, slug, cinfo, ctime) VALUES (?, ?, ?, ?)`
    )
      .bind(url, finalSlug, creatorInfoJson, getFormattedTime())
      .run();

    return Response.json(
      { slug: finalSlug, link: `${origin}/${finalSlug}` },
      { headers: CORS_HEADERS, status: 200 }
    );
  } catch (error) {
    console.error(`创建短链接失败: ${error}`);
    return Response.json(
      { message: "内部错误" },
      { headers: CORS_HEADERS, status: 500 }
    );
  }
}
