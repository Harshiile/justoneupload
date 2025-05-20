import { Request, Response } from 'express'
import { JOUError } from '../../lib/error'
import { db } from "../../db"
import { VideoTable } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { uploadQueue } from '../../redis/queue'
import uploadOnYoutube from './uploadVideo'

interface VideoScheduler {
    isApprove: boolean,
    schedule: Date | null,
    fileId: string,
    workspaceId: string
}
export const pushVideoOnScheduler = async (req: Request<{}, {}, VideoScheduler>, res: Response<APIResponse>) => {
    const { isApprove, schedule, fileId, workspaceId } = req.body

    if (isApprove == undefined || fileId == undefined) throw new JOUError(404, "Approval Not Found");

    if (isApprove) {
        // Video is approved, push to Scheduler
        if (schedule) {
            // if (new Date(schedule).getTime() > Date.now() * 60 * 1000) {// Uploading time should be 1 hour ahead of approval time
            // Scheudle the video
            console.log('Schedule Time : ', new Date(schedule).toLocaleTimeString());
            console.log('Now Time : ', new Date().toLocaleTimeString());
            console.log('Delay in Minutes : ', (new Date(schedule).getTime() - Date.now()) / (1000 * 60));

            // await uploadQueue.add('uploadVideoToYoutube', {
            //     workspaceId,
            //     fileId
            // }, {
            //     delay: new Date(schedule).getTime() - Date.now(),
            //     attempts: 3,
            //     backoff: 60 * 1000, // 1 min
            //     removeOnComplete: true
            // })
            // }
            // else throw new JOUError(400, "Uploading Time Should be 1 hour ahead, You should change the uploading time")
        }
        else {
            // Immediate Upload
            console.log('Schudle is null, immediate upload');
            await uploadOnYoutube(workspaceId, fileId)
        }
        res.json({
            message: !schedule ? 'Video upload process start immediately' : `Video is Scheduled to upload on ${new Date(schedule?.toString()!)}`
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