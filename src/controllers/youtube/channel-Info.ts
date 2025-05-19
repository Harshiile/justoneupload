import { Request, Response } from 'express'
import { google } from 'googleapis'
import { oauth2Client } from '../../lib/secrets'
import { WorkspaceTable } from '../../db/schema'
import { db } from '../../db'
import { eq } from 'drizzle-orm'
import { JOUError } from '../../lib/error'
import { fetchWorkspaceMetadata } from '../fetch/workspace'


// Authenticate & Store YT Channel in DB
export const connectYoutubeChannel = async (req: Request, res: Response<APIResponse>) => {
    const yt = google.youtube({ version: 'v3', auth: oauth2Client })
    const { code, userId } = req.query

    if (!code) throw new JOUError(400, "Code not generated after youtube signup")

    const youtubeChannel = await oauth2Client.getToken(code!.toString());

    // store refreshToken on db - Workspace Table
    if (!youtubeChannel) throw new JOUError(404, "Youtube Channel Fetching Failed")

    const refToken = youtubeChannel.tokens.refresh_token
    oauth2Client.setCredentials({
        refresh_token: refToken
    })

    const channels = await yt.channels.list({
        part: ['id', 'snippet'],
        mine: true
    })
    if (!channels) throw new JOUError(400, "Error while fetching youtube channel info")

    if (channels.data.items!.length <= 0) throw new JOUError(404, "No channel associated with given youtube account")

    const { id: channelId } = channels.data.items![0]
    const { customUrl } = channels.data.items![0].snippet!

    // Checks if ws already exists
    const existingChannel = await db
        .select()
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.id, channelId!))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1016`) })

    // DB Insert
    if (existingChannel.length > 0) throw new JOUError(409, "Workspace already exist")
    else
        db
            .insert(WorkspaceTable).values({
                id: channelId?.toString()!,
                owner: userId?.toString(),
                userHandle: customUrl?.toString(),
                refreshToken: refToken
            })
            .then(data => {
                data.rowCount! > 0 &&
                    res.json({
                        message: "Workspace Created",
                    })
            })
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1017`) })
}


// Youtube Channel Connector Link
export const youtubeConnecterLink = (req: Request, res: Response<APIResponse>) => {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly'
    ]
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    })
    res.json({
        message: "Youtube Connector URL",
        data: {
            url
        }
    })
}