import { JOUError } from "../../../lib/error.ts";
import { drive } from "../utils/screats.ts";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { getFileFromDrive } from "./utils/index.ts";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const fileId = searchParams.get("id");
  const fileType = searchParams.get("type");

  if (!fileId) return JOUError(404, "File id not found");
  if (!fileType) return JOUError(404, "File Type not found");

  let driveStream;
  let Res;
  const videoHeaders = new Headers();

  if (fileType == "image") {
    Res = NextResponse.json({});
    Res.headers.set("Content-Type", "image/*");
    driveStream = await getFileFromDrive(fileId!.toString());
  } else if (fileType == "video") {
    let Res = NextResponse.json({}, { status: 206 });
    const range = req.headers.get("range");

    if (range) {
      // If range - User can seek
      const metaRes = await drive.files.get({
        fileId: fileId!.toString(),
        fields: "size,mimeType",
      });
      const totalSize = Number(metaRes.data.size);
      const mimeType = metaRes.data.mimeType;

      const parts = range.split("bytes=")[1].split("-");

      const start = Number(parts[0]);
      const end = parts[1] ? Number(parts[1]) : totalSize - 1;
      const chunkSize = end - start + 1;

      videoHeaders.set("Content-Type", mimeType!);
      videoHeaders.set("Content-Length", chunkSize.toString());
      videoHeaders.set("Accept-Ranges", "bytes");
      videoHeaders.set("Content-Range", `bytes ${start}-${end}/ ${totalSize}`);

      driveStream = await getFileFromDrive(fileId!.toString(), range, {
        start,
        end,
      });
    } else {
      // Range header is null, means User only get video but unable to seek
      driveStream = await getFileFromDrive(fileId!.toString());
    }
  }
  if (driveStream) {
    const webStream = Readable.toWeb(driveStream as Readable);
    return new Response(webStream as unknown as BodyInit, {
      status: 206,
      headers: videoHeaders,
    });
  } else return JOUError(400, "Video Loaded Failed");
}
