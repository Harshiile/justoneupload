import { JwtValidate } from "@/app/api/lib/jwt";
import { db } from "@/db";
import { VideoTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { Channel, Video } from "../generate/route";

interface VideoDetails {
    channel: Channel,
    video: Video
}
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const link = searchParams.get('link')

    if (!link) return JOUError(404, 'Link not found')

    try {
        const videoDetails = (await JwtValidate(link)).payload
        if (typeof (videoDetails) == 'string') return JOUError(400, " Link is not valid");
        try {
            const tmpVideo: Video = videoDetails.video as Video;
            const [video] = await db
                .select({
                    fileId: VideoTable.fileId,
                    workspaceId: VideoTable.workspace
                })
                .from(VideoTable)
                .where(eq(VideoTable.fileId, tmpVideo.fileId))

            if (!video) return NextResponse.json({ error: true })
            else {
                videoDetails.workspaceId = video.workspaceId;
                return NextResponse.json({ error: false, videoDetails })
            }
        } catch (error) { return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1008`) }

    } catch (err) {
        if (err instanceof Error) {
            if (err.name == 'TokenExpiredError') return JOUError(401, "Link is expires")
        }
        else return JOUError(400, "Link is not valid")
    }
}