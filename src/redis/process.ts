import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { JOUError } from '../lib/error';
import { db } from '../db';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { VideoTable, VideoWorkspaceJoinTable, WorkspaceTable } from '../db/schema';
import { drive, oauth2Client } from '../lib/secrets';
import { google } from 'googleapis';
import { SendNotifyMail, VideoNofityMail } from '../controllers/mail/templates/notify';


const deleteOnDrive = async (fileId: string) => {
    await drive.files.delete({ fileId }).catch(err => { throw new JOUError(err.status, "Deletion Failed") })
}

const getFileFromDrive = async (fileId: string) => {
    return drive.files.get(
        {
            fileId,
            fields: 'size',
            alt: 'media',
        },
        {
            responseType: 'stream',
        }
    )
        .then(fileRes => fileRes.data)
        .catch(_ => { throw new JOUError(404, "File not Found") })
}


const connection = new Redis({
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null
})
const printCommands = (msg: string) => console.log(`${msg} - ${new Date()}`)

const worker = new Worker('video-scheudler-queue', async job => {
    const { workspaceId, fileId } = job.data

    if (!workspaceId) throw new JOUError(404, "WorkspaceId is not exist")
    if (!fileId) throw new JOUError(400, "Video Id is not valid")

    const [video] = await db
        .select({
            ...getTableColumns(VideoTable),
            refreshToken: WorkspaceTable.refreshToken
        })
        .from(VideoTable)
        .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoTable.workspace))
        .where(and(
            eq(VideoTable.workspace, workspaceId),
            eq(VideoTable.fileId, fileId)
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

    printCommands('1. Video Uploading Start ...');

    const resUpload = await yt.videos.insert({
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
        .catch(err => { throw new JOUError(err.status, err.message) })


    printCommands('2. Video Uploading Finish ...');
    printCommands(`3. Video Uploaded, Id : ${resUpload.data.id}`);


    // 1. Thumbnail set if not null
    const uploadedVideoId = resUpload.data.id
    if (video.thumbnail) {
        printCommands('4. Thumbnail Uploading Start ...');
        await yt.thumbnails.set({
            videoId: uploadedVideoId!,
            media: {
                body: await getFileFromDrive(video.thumbnail)
            }
        })
            .catch(err => { throw new JOUError(err.status, err.message) })

        await deleteOnDrive(video.thumbnail)
        printCommands('5. Thumbnail Uploaded');
        printCommands('6. Thumbnail Deleted From Drive ...');
    }



    // Sending Mail
    const videoData = resUpload.data.snippet
    const videoMailObject: VideoNofityMail = {
        thumbnail: videoData?.thumbnails?.high?.url!,
        title: videoData?.title!,
        publishedAt: videoData?.publishedAt!,
        videoType: resUpload.data.status?.privacyStatus!,
        duration: resUpload.data.contentDetails?.duration!,
        id: resUpload.data.id!,
        uploadingStatus: resUpload.data.status?.uploadStatus!,
        editorId: video.editor
    }
    await SendNotifyMail(videoMailObject, workspaceId)

    // 2. Video Delete on Drive
    await deleteOnDrive(fileId)
    printCommands('7. Video Deleted From Drive ...');


    // 3. Video Details Delete On VideoTable
    await db
        .delete(VideoTable)
        .where(eq(VideoTable.fileId, fileId))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1019`) })
    printCommands('8. Video Deleting in VideoTable ...');


    // 4. Add entry in VideoWorkSpaceTable
    await db.insert(VideoWorkspaceJoinTable).values({
        videoId: uploadedVideoId,
        workspace: workspaceId,
        editor: video.editor
    })
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1023`) })
    printCommands('9. Video Insert in VideoWorkSpaceJoinTable ...');

}, { connection });