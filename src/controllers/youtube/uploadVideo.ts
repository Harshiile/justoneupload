import { Request, Response } from 'express'
import { google } from 'googleapis'
import { oauth2Client } from '../../lib/secrets'
import { db } from '../../db'
import { VideoTable, VideoWorkspaceJoinTable, WorkspaceTable } from '../../db/schema'
import { and, eq, getTableColumns } from 'drizzle-orm'
import { validate } from 'uuid'
import { JOUError } from '../../lib/error'
import { deleteOnDrive, getFileFromDrive } from '../drive'


export const uploadOnYoutube = async (req: Request<{}, {}, { workspaceId: string, videoId: string }>, res: Response<APIResponse>) => {
    const { workspaceId, videoId } = req.body
    if (!workspaceId) throw new JOUError(404, "WorkspaceId is not exist")
    if (!videoId || !validate(videoId)) throw new JOUError(400, "Video Id is not valid")

    const [video] = await db
        .select({
            ...getTableColumns(VideoTable),
            refreshToken: WorkspaceTable.refreshToken
        })
        .from(VideoTable)
        .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoTable.workspace))
        .where(and(
            eq(VideoTable.workspace, workspaceId),
            eq(VideoTable.id, videoId)
        ))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1018`) })

    if (!video) throw new JOUError(404, "No Video Found")


    // Video Uploading
    const { refreshToken } = video
    oauth2Client.setCredentials({
        refresh_token: refreshToken
    })
    const yt = google.youtube({ version: 'v3', auth: oauth2Client })

    const videoStream = await getFileFromDrive(video.fileId)

    console.log('1. Video Uploading Start ...');

    yt.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: {
                title: video.title,
                description: video.desc,
            },
            status: {
                privacyStatus: video.videoType,
                selfDeclaredMadeForKids: video.isMadeForKids
            },
        },
        media: {
            body: videoStream
        }
    })
        .then(async (resUpload) => {
            console.log('2. Video Uploading Finish ...');
            console.log('3. Video Uploaded, Id : ', resUpload.data.id);
            // Video successfull uploaded

            // 1. Thumbnail set if not null
            const uploadedVideoId = resUpload.data.id
            if (video.thumbnail) {
                console.log('4. Thumbnail Uploading Start ...');
                yt.thumbnails.set({
                    videoId: uploadedVideoId!,
                    media: {
                        body: await getFileFromDrive(video.thumbnail)
                    }
                })
                    .then(async (resThumbUpload) => {
                        console.log('5. Thumbnail Uploaded');
                        // 2. Delete entry in VideoTable & in Drive

                        // Drive deletion
                        await deleteOnDrive(video.fileId)

                        db
                            .delete(VideoTable)
                            .where(eq(VideoTable.id, videoId))
                            .then(deltedRes => {
                                if (deltedRes.rowCount! > 0) {
                                    console.log('6. Video Deleting in VideoTable ...');
                                    // 3. Add entry in VideoWorkSpaceTable
                                    db.insert(VideoWorkspaceJoinTable).values({
                                        videoId: uploadedVideoId,
                                        workspace: workspaceId,
                                        editor: video.editor
                                    })
                                        .then(_ => {
                                            console.log('7. Video Insert in VideoWorkSpaceJoinTable ...');
                                            res.json({
                                                message: "Video Uploaded",
                                                data: { videoId: uploadedVideoId }
                                            })
                                        })
                                }
                            })
                            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1019`) })
                    })
                    .catch(err => { throw new JOUError(err.status, err.message) })
            }
        })
        .catch(err => { throw new JOUError(err.status, err.message) })
}