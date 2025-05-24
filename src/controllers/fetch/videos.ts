import { Request, Response } from 'express'
import { db } from '../../db';
import { UserTable, VideoTable, VideoWorkspaceJoinTable, WorkspaceTable } from '../../db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { oauth2Client } from '../../lib/secrets';
import { google } from 'googleapis';
import { JOUError } from '../../lib/error';

interface VideoMetaData {
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


export const getVideosOfWorkSpace = async (req: Request, res: Response<APIResponse>) => {
    const { workspace } = req.query;
    if (!workspace) throw new JOUError(404, "Request Params Invalid")
    // Non-Uploaded Videos
    const nonUploadedVideos = await db
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
        .where(eq(VideoTable.workspace, workspace.toString()))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1009`) })



    // Uploaded Videos
    const uploadedVideos = await db
        .select({
            editor: UserTable.name,
            videoId: VideoWorkspaceJoinTable.videoId,
        })
        .from(VideoWorkspaceJoinTable)
        .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
        .where(eq(VideoWorkspaceJoinTable.workspace, workspace.toString()!))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1010`) })

    if (nonUploadedVideos.length <= 0 && uploadedVideos.length <= 0)
        res.json({
            message: "Videos from workspace",
            data: { metadata: [] }
        })

    else {
        const [ws] = await db
            .select({
                refreshToken: WorkspaceTable.refreshToken
            })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.id, workspace.toString()))
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1011`) })

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

        // Fetching Details About Videos Using IDs
        const metadata: VideoMetaData[] = nonUploadedVideos || [];
        const videosMetaDatas = videoDetails?.data?.items;
        videosMetaDatas?.forEach(video => {
            const { editor } = uploadedVideos.filter(fv => fv.videoId == video.id)[0]
            metadata.push({
                id: video.id!,
                title: video.snippet!.title!,
                publishedAt: video.snippet!.publishedAt!,
                duration: video.contentDetails!.duration!,
                channelHandle: video.snippet?.channelTitle!,
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

export const getPendingUploadingVideos = async (req: Request, res: Response<APIResponse>) => {
    const userId = req.user.id
    if (!req.query['type']) throw new JOUError(404, "Video type not found")

    const type = req.query['type'].toString()!

    if (type == 'reviewPending' || type == 'uploadPending') {

        const subQuery = db
            .select({ id: WorkspaceTable.id })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.owner, userId?.toString()!))

        const videos = await db
            .select({
                id: VideoTable.id,
                title: VideoTable.title,
                videoType: VideoTable.videoType,
                thumbnail: VideoTable.thumbnail,
                duration: VideoTable.duration,
                fileId: VideoTable.fileId,
                status: VideoTable.status,
                willUploadAt: VideoTable.willUploadAt,
                editor: UserTable.name,
                userHandle: WorkspaceTable.userHandle
            })
            .from(VideoTable)
            .leftJoin(UserTable, eq(UserTable.id, VideoTable.editor))
            .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoTable.workspace))
            .where(and(
                inArray(VideoTable.workspace, subQuery),
                eq(VideoTable.status, type)
            ))
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1012`) })

        res.json({
            message: type == 'reviewPending' ? "Pending Videos" : "Uploading Videos",
            data: { videos }
        })
    }
    else throw new JOUError(400, "Invalid Type")
}