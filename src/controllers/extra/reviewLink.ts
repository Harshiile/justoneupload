import { Request, Response } from 'express'
import { JwtGenerate, JwtValidate } from '../../lib/jwt'
import { JOUError } from '../../lib/error'
import { db } from '../../db'
import { VideoTable } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { WorkspaceMail, VideoMetaDataMail, generateReviewUrl } from '../mail/templates/approval'

export const fetchVideoInformationFromReviewLink = async (req: Request, res: Response<APIResponse>) => {
    const link = req.params.link
    if (!link) throw new JOUError(404, 'Link not found')

    try {
        const videoDetails = JwtValidate(link)
        if (typeof (videoDetails) == 'string') throw new JOUError(400, "Link is not valid");

        const [video] = await db
            .select({
                fileId: VideoTable.fileId,
                workspaceId: VideoTable.workspace
            })
            .from(VideoTable)
            .where(eq(VideoTable.fileId, videoDetails.fileId!))
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1008`) })


        if (!video) res.json({
            message: "Video already rejected or approved",
            data: {
                error: true
            }
        })
        else {
            videoDetails.fileId = video.fileId
            videoDetails.workspaceId = video.workspaceId
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

export const generateVideoReviewLink = (req: Request<{}, {}, VideoMetaDataMail & WorkspaceMail>, res: Response<APIResponse>) => {
    const { title, fileId, willUploadAt, id, avatar, userHandle, name } = req.body
    res.json({
        message: "Video Review Link",
        data: {
            link: generateReviewUrl(
                { id, name, avatar, userHandle },
                { title, fileId, willUploadAt }
            )
        }
    })
}
