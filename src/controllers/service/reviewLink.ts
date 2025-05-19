import { Request, Response } from 'express'
import { JwtGenerate, JwtValidate } from '../../lib/jwt'
import { JOUError } from '../../lib/error'
import { db } from '../../db'
import { VideoTable } from '../../db/schema'
import { eq } from 'drizzle-orm'

interface VideoDetails {
    channelName: string,
    channelAvatar: string,
    channelUserHandle: string,
    videoId: string,
    videoTitle: string
}

export const generateVideoReviewLink = async (req: Request<{}, {}, VideoDetails>, res: Response<APIResponse>) => {
    const videoDetails = req.body
    res.json({
        message: "Video Review Link",
        data: {
            link: `/review/${JwtGenerate(videoDetails)}`
        }
    })
}


export const fetchVideoInformationFromReviewLink = async (req: Request, res: Response<APIResponse>) => {
    const link = req.params.link
    if (!link) throw new JOUError(404, 'Link not found')

    try {
        const videoDetails = JwtValidate(link)
        if (typeof (videoDetails) == 'string') throw new JOUError(400, "Link is not valid");

        const [video] = await db.
            select({ fileId: VideoTable.fileId }).
            from(VideoTable).
            where(eq(VideoTable.id, videoDetails.videoId!))

        if (!video) res.json({
            message: "Video already rejected or approved",
            data: {
                error: true
            }
        })
        else {
            videoDetails.fileId = video.fileId
            res.json({
                message: "Video Details From Link",
                data: { error: false, videoDetails }
            })
        }
    } catch (err) {
        if (err instanceof Error) {
            if (err.name == 'TokenExpiredError') throw new JOUError(401, "Link is expires")
        }
        else throw new JOUError(400, "Link is not valid")
    }
}