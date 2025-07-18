import { JwtValidate } from "@/app/api/utils/jwt";
import { db } from "@/db";
import { VideoTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Channel, Video } from "../generate/route";
import { JwtPayload } from "jsonwebtoken";

interface VideoDetails {
  channel: Channel;
  video: Video;
}
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const link = searchParams.get("link");

  if (!link) return JOUError(404, "Link not found");

  try {
    const videoDetails = await JwtValidate<VideoDetails>(link);

    try {
      const [video] = await db
        .select({
          fileId: VideoTable.fileId,
          workspaceId: VideoTable.workspace,
        })
        .from(VideoTable)
        .where(eq(VideoTable.fileId, videoDetails.video.fileId));

      console.log(video);

      if (!video) return NextResponse.json({ error: true });
      else {
        return NextResponse.json({ error: false, videoDetails });
      }
    } catch (error) {
      console.log(error);
      return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1008`);
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name == "TokenExpiredError")
        return JOUError(401, "Link is expires");
    } else return JOUError(400, "Link is not valid");
  }
}
