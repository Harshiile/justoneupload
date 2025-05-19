import { Request, Response } from 'express'
import { JOUError } from '../../lib/error'
import { db } from "../../db"
import { VideoTable } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface VideoScheduler {
    isApprove: boolean,
    schedule: Date | null,
    fileId: string
}
export const pushVideoOnScheduler = async (req: Request<{}, {}, VideoScheduler>, res: Response<APIResponse>) => {
    const { isApprove, schedule, fileId } = req.body

    if (isApprove == undefined || fileId == undefined) throw new JOUError(404, "Approval Not Found");

    if (isApprove) {
        // Video is approved, push to Scheduler
        res.json({
            message: !schedule ? 'Video upload process start immediately' : `Video is Scheduled to upload on ${new Date(schedule?.toString()!)}`
        })
    }
    else {        // Video rejected, delete from D
        await db
            .delete(VideoTable)
            .where(eq(VideoTable.fileId, fileId))
            .then(_ =>
                res.json({
                    message: "Video is rejected"
                })
            )
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1022`) })
    }
}