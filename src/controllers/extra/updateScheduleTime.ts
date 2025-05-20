import { Request, Response } from 'express'
import { JOUError } from '../../lib/error'
import { db } from '../../db';
import { VideoTable } from '../../db/schema';

export const updateScheduleTime = async (req: Request, res: Response<APIResponse>) => {
    const { id, schedule } = req.query

    if (!id || !schedule) throw new JOUError(404, "Invalid Request")

    await db
        .update(VideoTable)
        .set({ willUploadAt: new Date(`${schedule.toString()}`) })
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1024`) })

    res.json({
        message: "Schedule Updated"
    })
}