import { Request, Response } from 'express'
import { JwtGenerate, JwtValidate } from '../../lib/jwt'
import { emit } from 'process'
import { encryptPass } from '../../lib/func/hashing'
import { oauth2Client } from '../../lib/secrets'
import { google } from 'googleapis'

export const TMP = async (req: Request<{}, {}>, res: Response<APIResponse>) => {
<<<<<<< HEAD
=======
    // Channel Data based on refreshToken


    // const yt = google.youtube({ version: 'v3', auth: oauth2Client })
    // const chennelsData = await yt.channels.list({
    //     part: ['snippet', 'contentDetails', 'statistics'],
    //     mine: true
    // })
    // const [channelItems] = chennelsData.data.items!
    // const channel = {
    //     id: channelItems
    // }
>>>>>>> fc0ab0c (fix : Video Uploading On Youtube Service Done)
    res.json({
        message: "TMP Message",
        data: {
            channel: 's'
        }
    })
}
