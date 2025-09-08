// 共用工具函数

export function getFormattedTime() {
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

export function collectAccessInfo(request) {
  return {
    ip:
      request.headers.get("x-forwarded-for") ||
      request.headers.get("clientIP") ||
      request.headers.get("CF-Connecting-IP"),
    country: request.headers.get("CF-IPCountry"),
    userAgent: request.headers.get("User-Agent"),
    referer: request.headers.get("Referer"),
    forwarded: request.headers.get("X-Forwarded-For"),
  };
}
