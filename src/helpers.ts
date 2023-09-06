import { Response } from "express";
import path from "path";

export const filePath = path.join(__dirname, "sample.mp3");

export function extractRange(range: string, fileSize: number) {
  const parts = range.replace(/bytes=/, "").split("-");
  const start = parseInt(parts[0], 10);
  const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  return { start, end };
}

export function setPartialRangeHeaders(
  res: Response,
  fileSize: number,
  { start, end }: { start: number; end: number }
) {
  const chunkSize = end - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "audio/mpeg",
  });
}
