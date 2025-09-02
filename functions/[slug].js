import page404 from "./404.html";
import downloadPage from "./download.html";

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

async function isDownloadableFile(url, userAgent) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": userAgent || "Mozilla/5.0 (compatible; ShortLink Bot)",
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const contentDisposition =
      response.headers.get("content-disposition") || "";

    if (contentDisposition.toLowerCase().includes("attachment")) {
      return true;
    }

    const downloadableContentTypes = [
      // 通用二进制文件
      "application/octet-stream",
      "application/binary",
      "application/x-binary",

      // 压缩文件
      "application/zip",
      "application/x-zip",
      "application/x-zip-compressed",
      "application/gzip",
      "application/x-gzip",
      "application/x-7z-compressed",
      "application/x-rar",
      "application/x-rar-compressed",
      "application/vnd.rar",
      "application/x-tar",
      "application/x-bzip",
      "application/x-bzip2",
      "application/x-xz",
      "application/x-lzma",
      "application/x-compress",
      "application/x-compressed",
      "application/x-ace-compressed",
      "application/x-arj",
      "application/x-lzh",
      "application/x-lha",
      "application/x-stuffit",
      "application/x-stuffitx",

      // 文档文件
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.ms-powerpoint",
      "application/vnd.ms-word",
      "application/vnd.oasis.opendocument.text",
      "application/vnd.oasis.opendocument.spreadsheet",
      "application/vnd.oasis.opendocument.presentation",
      "application/rtf",
      "text/rtf",
      "application/vnd.wordperfect",
      "application/x-tex",
      "application/postscript",
      "application/eps",

      // 电子书
      "application/epub+zip",
      "application/x-mobipocket-ebook",
      "application/vnd.amazon.ebook",
      "application/x-fictionbook+xml",
      "application/x-fb2+xml",

      // 可执行文件和安装包
      "application/x-msdownload",
      "application/x-msdos-program",
      "application/x-msi",
      "application/x-executable",
      "application/x-elf",
      "application/x-deb",
      "application/x-debian-package",
      "application/x-rpm",
      "application/x-redhat-package-manager",
      "application/vnd.android.package-archive",
      "application/x-apple-diskimage",
      "application/x-dmg",
      "application/x-pkg",
      "application/x-xpinstall",
      "application/x-chrome-extension",
      "application/x-opera-extension",
      "application/x-shockwave-flash",
      "application/vnd.microsoft.portable-executable",
      "application/x-ms-dos-executable",
      "application/x-winexe",
      "application/x-msaccess",

      // 视频文件
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/avi",
      "video/x-ms-wmv",
      "video/x-ms-asf",
      "video/x-flv",
      "video/webm",
      "video/ogg",
      "video/3gpp",
      "video/x-matroska",
      "video/mkv",
      "video/x-m4v",
      "video/mp2t",
      "video/vob",
      "video/divx",
      "video/xvid",

      // 音频文件
      "audio/mpeg",
      "audio/mp3",
      "audio/mp4",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/flac",
      "audio/x-flac",
      "audio/ogg",
      "audio/vorbis",
      "audio/aac",
      "audio/x-aac",
      "audio/x-m4a",
      "audio/wma",
      "audio/x-ms-wma",
      "audio/amr",
      "audio/3gpp",
      "audio/ac3",
      "audio/x-aiff",
      "audio/aiff",

      // 图像文件
      "image/tiff",
      "image/x-tiff",
      "image/x-adobe-dng",
      "image/x-canon-cr2",
      "image/x-canon-crw",
      "image/x-nikon-nef",
      "image/x-sony-arw",
      "image/x-photoshop",
      "image/vnd.adobe.photoshop",
      "image/x-xcf",
      "image/x-gimp-xcf",
      "image/x-portable-pixmap",
      "image/x-portable-graymap",
      "image/x-portable-bitmap",
      "image/x-rgb",
      "image/x-xbitmap",
      "image/x-xpixmap",
      "application/postscript",

      // CAD 和设计文件
      "application/acad",
      "application/x-autocad",
      "image/vnd.dwg",
      "image/x-dwg",
      "application/dxf",
      "application/x-dxf",
      "application/x-3ds",
      "model/x3d+xml",
      "model/obj",
      "application/sla",

      // 字体文件
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2",
      "application/font-woff",
      "application/font-woff2",
      "application/x-font-ttf",
      "application/x-font-otf",
      "application/x-font-truetype",
      "application/x-font-opentype",
      "application/vnd.ms-fontobject",
      "font/eot",

      // 数据和数据库文件
      "application/x-sqlite3",
      "application/x-msaccess",
      "application/vnd.ms-access",
      "application/x-dbf",
      "text/csv",
      "application/csv",
      "application/x-dbase",
      "application/vnd.oasis.opendocument.database",

      // 科学和工程文件
      "application/mathematica",
      "application/x-mathematica",
      "application/matlab",
      "application/x-matlab",
      "application/x-spss-sav",
      "application/x-stata-dta",
      "application/x-r-data",

      // 虚拟磁盘和镜像文件
      "application/x-iso9660-image",
      "application/x-cd-image",
      "application/x-raw-disk-image",
      "application/x-virtualbox-hdd",
      "application/x-virtualbox-vdi",
      "application/x-vmware-disk",
      "application/x-qemu-disk",

      // 游戏文件
      "application/x-nintendo-rom",
      "application/x-sega-rom",
      "application/x-gameboy-rom",
      "application/x-n64-rom",
      "application/x-psx-rom",
      "application/x-iso",

      // 备份和存档文件
      "application/x-backup",
      "application/x-ghost",
      "application/x-norton-ghost",
      "application/x-acronis-tib",

      // 编程和开发文件
      "application/x-java-archive",
      "application/java-archive",
      "application/x-war",
      "application/x-ear",
      "application/x-cocoa",
      "application/x-xcode",
      "application/vnd.android.aapt",

      // 其他专业文件格式
      "application/x-iwork-keynote-sffkey",
      "application/x-iwork-numbers-sffnumbers",
      "application/x-iwork-pages-sffpages",
      "application/vnd.ms-project",
      "application/x-msproj",
      "application/vnd.visio",
      "application/x-visio",
      "application/vnd.adobe.illustrator",
      "application/illustrator",
      "application/x-indesign",
      "application/x-pagemaker",
      "application/x-scribus",

      // 配置和数据文件
      "application/x-plist",
      "application/x-apple-plist",
      "application/x-bplist",
      "application/x-registry",
      "application/x-wine-extension-inf",
      "application/x-ms-shortcut",
      "application/x-desktop",

      // 科学数据格式
      "application/x-hdf",
      "application/x-netcdf",
      "application/fits",
      "application/x-fits",
      "chemical/x-mdl-molfile",
      "chemical/x-pdb",
      "chemical/x-xyz",

      // 加密和证书文件
      "application/x-pkcs12",
      "application/pkcs12",
      "application/x-x509-ca-cert",
      "application/x-pem-file",
      "application/pkcs8",
      "application/x-pkcs7-certificates",

      // 固件和嵌入式文件
      "application/x-firmware",
      "application/x-bios",
      "application/x-uefi",
      "application/x-hex",
      "application/x-binary-hex",

      // 旧版和传统格式
      "application/x-arc",
      "application/x-zoo",
      "application/x-lzx",
      "application/x-cabinet",
      "application/vnd.ms-cab-compressed",
      "application/x-compress",
      "application/x-cpio",
      "application/x-shar",
    ];

    return downloadableContentTypes.some((type) =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );
  } catch (error) {
    console.warn(`无法检测文件类型: ${url} `, error.message);
    return false;
  }
}

export async function onRequestGet(context) {
  const { env, params, request } = context;
  const slug = params.slug;
  const url = new URL(request.url);

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

  const clientUserAgent = request.headers.get("User-Agent");

  if (await isDownloadableFile(originURL.url, clientUserAgent)) {
    if (url.searchParams.get("force") === "true") {
      return Response.redirect(originURL.url, 302);
    }

    const downloadPageContent = downloadPage.replace(
      "__FILE_URL__",
      originURL.url
    );

    return new Response(downloadPageContent, {
      status: 200,
      headers: {
        "content-type": "text/html;charset=UTF-8",
      },
    });
  }

  return Response.redirect(originURL.url, 302);
}
