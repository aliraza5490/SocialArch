import * as path from "path";
import * as fs from "fs";

/**
 * Mapping of common file extensions to standard MIME types.
 */
const EXTENSION_MIME_MAP: Record<string, string> = {
  // Images
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  bmp: "image/bmp",
  tiff: "image/tiff",
  tif: "image/tiff",

  // Documents & Data
  pdf: "application/pdf",
  json: "application/json",
  xml: "text/xml",
  csv: "text/csv",
  rtf: "text/rtf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  // Text & Code
  txt: "text/plain",
  log: "text/plain",
  md: "text/markdown",
  markdown: "text/markdown",
  html: "text/html",
  htm: "text/html",
  css: "text/css",
  scss: "text/css",
  sass: "text/css",
  less: "text/css",
  js: "text/javascript",
  mjs: "text/javascript",
  cjs: "text/javascript",
  jsx: "text/plain",
  ts: "text/plain",
  tsx: "text/plain",
  py: "text/plain",
  java: "text/plain",
  c: "text/plain",
  cpp: "text/plain",
  h: "text/plain",
  hpp: "text/plain",
  cs: "text/plain",
  sh: "text/plain",
  bash: "text/plain",
  zsh: "text/plain",
  yaml: "text/plain",
  yml: "text/plain",
  env: "text/plain",
  sql: "text/plain",
  rs: "text/plain",
  go: "text/plain",
  toml: "text/plain",
  ini: "text/plain",
  conf: "text/plain",

  // Audio
  mp3: "audio/mp3",
  wav: "audio/wav",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  aiff: "audio/aiff",
  m4a: "audio/mp4",

  // Video
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  webm: "video/webm",
  wmv: "video/x-ms-wmv",
  "3gp": "video/3gpp",
};

/**
 * List of MIME types explicitly supported by Google Gemini API.
 */
const GEMINI_SUPPORTED_MIME_TYPES = new Set([
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
  // Audio
  "audio/wav",
  "audio/mp3",
  "audio/aiff",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/mp4",
  // Video
  "video/mp4",
  "video/mpeg",
  "video/mov",
  "video/quicktime",
  "video/avi",
  "video/x-msvideo",
  "video/x-flv",
  "video/mpg",
  "video/webm",
  "video/wmv",
  "video/3gpp",
  // Text & Documents
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "text/markdown",
  "text/csv",
  "text/xml",
  "text/rtf",
  "application/pdf",
  "application/json",
  "application/javascript",
  "application/x-javascript",
]);

/**
 * Checks if a given MIME type is supported natively by Google Gemini API.
 */
export function isGeminiSupportedMimeType(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  const cleanMime = mimeType.toLowerCase().trim();
  if (cleanMime === "application/octet-stream") return false;
  if (GEMINI_SUPPORTED_MIME_TYPES.has(cleanMime)) return true;
  if (
    cleanMime.startsWith("image/") ||
    cleanMime.startsWith("audio/") ||
    cleanMime.startsWith("video/") ||
    cleanMime.startsWith("text/")
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if a MIME type is a text-based format.
 */
export function isTextMimeType(mimeType?: string | null): boolean {
  if (!mimeType) return false;
  const cleanMime = mimeType.toLowerCase().trim();
  return (
    cleanMime.startsWith("text/") ||
    cleanMime === "application/json" ||
    cleanMime === "application/javascript" ||
    cleanMime === "application/x-javascript" ||
    cleanMime === "application/xml"
  );
}

/**
 * Deduce or normalize MIME type from file extension or provided MIME.
 * Ensures `application/octet-stream` is replaced with a proper inferred MIME type or `text/plain`.
 */
export function normalizeMimeType(
  filePathOrName?: string | null,
  providedMime?: string | null,
): string {
  // 1. Try provided MIME if it's specific and valid (not application/octet-stream)
  if (
    providedMime &&
    providedMime.trim() !== "" &&
    providedMime.toLowerCase() !== "application/octet-stream"
  ) {
    return providedMime.toLowerCase().trim();
  }

  // 2. Infer from file extension
  if (filePathOrName) {
    const ext = path.extname(filePathOrName).toLowerCase().replace(/^\./, "");
    if (ext && EXTENSION_MIME_MAP[ext]) {
      return EXTENSION_MIME_MAP[ext];
    }
  }

  // 3. Check if file is readable as UTF-8 text on disk
  if (filePathOrName && fs.existsSync(filePathOrName)) {
    try {
      const stats = fs.statSync(filePathOrName);
      if (stats.isFile() && stats.size > 0 && stats.size < 5 * 1024 * 1024) {
        const buffer = fs.readFileSync(filePathOrName);
        let isText = true;
        const sampleSize = Math.min(buffer.length, 1024);
        for (let i = 0; i < sampleSize; i++) {
          if (buffer[i] === 0) {
            isText = false;
            break;
          }
        }
        if (isText) {
          return "text/plain";
        }
      }
    } catch {
      // Ignore disk error
    }
  }

  // 4. Default fallback: fallback to text/plain if extension unknown to avoid 400 application/octet-stream
  return "text/plain";
}
