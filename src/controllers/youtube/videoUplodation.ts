import { Request, Response } from 'express'
import { JOUError } from '../../lib/error'
import { db } from "../../db"
import { VideoTable } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { uploadQueue } from '../../redis/queue'
import { drive } from '../../lib/secrets'

interface VideoScheduler {
    isApprove: boolean,
    schedule: Date | null,
    fileId: string,
    workspaceId: string
}



export const pushVideoOnScheduler = async (req: Request<{}, {}, VideoScheduler>, res: Response<APIResponse>) => {
    const { isApprove, schedule, fileId, workspaceId } = req.body

    if (isApprove == undefined || workspaceId == undefined || fileId == undefined) throw new JOUError(404, "Approval Not Found");

    if (isApprove) {
        // Video is approved, push to Scheduler
        if (schedule) {
            // if (new Date(schedule).getTime() > Date.now() * 60 * 1000) {// Uploading time should be 1 hour ahead of approval time
            // Scheudle the video
            console.log(new Date(Number(schedule)).toUTCString());
            console.log(new Date(Number(schedule)).toTimeString());

            console.log('Schedule Time : ', new Date(Number(schedule)).toLocaleTimeString());
            console.log('Now Time : ', new Date().toLocaleTimeString());
            console.log('Delay in Minutes : ', (Number(schedule) - Date.now()) / (1000 * 60));


            await uploadQueue.add('uploadVideoToYoutube', {
                workspaceId,
                fileId
            }, {
                delay: Number(schedule) - Date.now(),
                attempts: 3,
                backoff: 60 * 1000, // 1 min
                removeOnComplete: true
            })

            // Set video state as uploadPending------------------
            await db
                .update(VideoTable)
                .set({
                    status: "uploadPending"
                })
                .where(eq(VideoTable.fileId, fileId))
                .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1026`) })



            // }
            // else throw new JOUError(400, "Uploading Time Should be 1 hour ahead, You should change the uploading time")
        }
        else {
            // Immediate Upload
            await uploadQueue.add('uploadVideoToYoutube', {
                workspaceId,
                fileId
            })
        }
        res.json({
            message: !schedule ? 'Video Uploading Started' : `Video is Scheduled to upload on ${schedule.toDateString()} - ${schedule.toLocaleTimeString()}`
        })
    }
    else {
        // Video rejected, delete from D
        await db
            .delete(VideoTable)
            .where(eq(VideoTable.fileId, fileId))
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1022`) })
        res.json({
            message: "Video is rejected"
        })
    }
}