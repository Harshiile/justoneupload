import { NextFunction, Request, Response } from 'express'
import { db } from '../../db';
import { UserTable, VideoTable, VideoWorkspaceJoinTable, WorkspaceTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { url } from 'inspector';
import { oauth2Client } from '../../lib/secrets';
import { google } from 'googleapis';
import { drive } from '../../lib/secrets';
import { JOUError } from '../../lib/error';

const getImageWebLink = async (fileId: string) => {
    return await drive.files.get({
        fileId,
        fields: 'webContentLink, webViewLink'
    })
}

export const getVideosFromWorkSpace = async (req: Request, res: Response<APIResponse>) => {
    const { workspace } = req.query;
    if (workspace) {

        // Not Uploaded Videos
        const nonUploadedVideos = await db.select({
            id: VideoTable.id,
            title: VideoTable.title,
            duration: VideoTable.duration,
            uploadAt: VideoTable.willUploadAt,
            thumbnail: VideoTable.thumbnail,
            videoType: VideoTable.videoType,
            status: VideoTable.status,
            editor: UserTable.name
        })
            .from(VideoTable)
            .leftJoin(UserTable, eq(UserTable.id, VideoTable.editor))
            .where(eq(VideoTable.workspace, workspace.toString()))



        // Uploaded Videos
        const uploadedVideos = await db.select({
            editor: UserTable.name,
            videoId: VideoWorkspaceJoinTable.videoId,
        })
            .from(VideoWorkspaceJoinTable)
            .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
            .where(eq(VideoWorkspaceJoinTable.workspace, workspace.toString()!))

        const [ws] = await db.select({
            refreshToken: WorkspaceTable.refreshToken
        }).from(WorkspaceTable).where(eq(WorkspaceTable.id, workspace.toString()));

        if (!ws) throw new JOUError(404, "Workspace not Exist")

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

        const metadata: VideoMetaData[] = nonUploadedVideos || [];
        const videosMetaDatas = videoDetails?.data?.items;

        videosMetaDatas?.forEach(video => {
            const { editor } = uploadedVideos.filter(fv => fv.videoId == video.id)[0]
            metadata.push({
                id: video.id!,
                title: video.snippet!.title!,
                publishedAt: video.snippet!.publishedAt!,
                duration: video.contentDetails!.duration!,
                thumbnail: video.snippet?.thumbnails!.high?.url!,
                videoType: video.status!.privacyStatus!,
                views: video.statistics!.viewCount!,
                status: 'uploaded',
                editor
            })
        })

        res.json({
            message: "Videos from workspace",
            data: {
                metadata,
            }
        })
    }

}

interface VideoMetaData {
    id: string;
    title: string;
    uploadAt?: Date | null;
    duration: string;
    publishedAt?: string | null;
    thumbnail: string | null;
    videoType: string;
    views?: string | null;
    status: string;
    editor: string | null
}