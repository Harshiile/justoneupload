import { oauth2Client } from "@/app/api/utils/screats";
import { db } from "@/db";
import { UserTable, VideoTable, VideoWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { CustomNextRequest } from "@/lib/customRequest";
import { JOUError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export interface VideoMetaData {
    id: string;
    title: string;
    uploadAt?: string | null;
    duration: string;
    publishedAt?: string | null;
    thumbnail: string | null;
    videoType: string;
    views?: string | null;
    channelHandle?: string;
    status: string;
    editor: string | null
}


export async function GET(req: CustomNextRequest) {
    const { searchParams } = new URL(req.url)
    const workspace = searchParams.get('ws')

    if (!workspace) return JOUError(404, "Request Params Invalid")

    // Non-Uploaded Videos
    let nonUploadedVideos;
    try {
        nonUploadedVideos = await db
            .select({
                id: VideoTable.id,
                title: VideoTable.title,
                duration: VideoTable.duration,
                willUploadAt: VideoTable.willUploadAt,
                thumbnail: VideoTable.thumbnail,
                videoType: VideoTable.videoType,
                status: VideoTable.status,
                editor: UserTable.name,
                fileId: VideoTable.fileId
            })
            .from(VideoTable)
            .leftJoin(UserTable, eq(UserTable.id, VideoTable.editor))
            .where(eq(VideoTable.workspace, workspace))
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1009`)
    }



    // Uploaded Videos
    let uploadedVideos = [];
    try {
        uploadedVideos = await db
            .select({
                editor: UserTable.name,
                videoId: VideoWorkspaceJoinTable.videoId,
            })
            .from(VideoWorkspaceJoinTable)
            .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
            .where(eq(VideoWorkspaceJoinTable.workspace, workspace))
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1010`)
    }

    console.log('Non-Uploaded Videos ------------');
    nonUploadedVideos.forEach(v => console.table(v));

    console.log('Uploaded Videos ------------');
    uploadedVideos.forEach(v => console.table(v));

    const metadata: VideoMetaData[] = nonUploadedVideos || [];

    if (uploadedVideos.length <= 0) return NextResponse.json({ metadata })
    else {
        let ws;
        try {
            ws = (await db
                .select({
                    refreshToken: WorkspaceTable.refreshToken
                })
                .from(WorkspaceTable)
                .where(eq(WorkspaceTable.id, workspace)))[0]
        } catch (error) {
            JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1011`)
        }

        if (!ws) return JOUError(404, "Workspace not Exist")

        const { refreshToken } = ws
        oauth2Client.setCredentials({
            refresh_token: refreshToken
        })
        const yt = google.youtube({ version: 'v3', auth: oauth2Client })
        const videos = uploadedVideos.map(v => v.videoId!)
        const videoDetails = await yt.videos.list({
            part: ['snippet', 'contentDetails', 'status', 'statistics'],
            id: videos
        });

        // Fetching Details About Videos Using IDs

        const videosMetaDatas = videoDetails?.data?.items;
        videosMetaDatas?.forEach(video => {
            const { editor } = uploadedVideos.filter(fv => fv.videoId == video.id)[0]
            metadata.push({
                id: video.id!,
                title: video.snippet!.title!,
                publishedAt: video.snippet!.publishedAt!,
                duration: video.contentDetails!.duration!,
                channelHandle: video.snippet?.channelTitle!,
                thumbnail: video.snippet?.thumbnails?.maxres?.url!,
                videoType: video.status!.privacyStatus!,
                views: video.statistics!.viewCount!,
                status: 'uploaded',
                editor
            })
        })
        return NextResponse.json({ metadata })
    }
}