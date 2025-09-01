import page403 from "./403.html";

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (pathname === "/create") {
    return next();
  }

  const allowedStaticFiles = ["/asset/js/alpine.js", "/asset/img/favicon.png"];
  if (allowedStaticFiles.includes(pathname)) {
    return next();
  }

  const pathSegments = pathname
    .split("/")
    .filter((segment) => segment.length > 0);

  if (pathSegments.length > 1) {
    return new Response(page403, {
      status: 403,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  return next();
}
