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
    const { code } = req.query

    if (!code) throw new JOUError(400, "Code not generated after youtube signup")

    const youtubeChannel = await oauth2Client.getToken(code!.toString());

    // store refreshToken on db - Workspace Table
    if (!youtubeChannel) throw new JOUError(404, "Youtube Channel Fetching Failed")

    const refToken = youtubeChannel.tokens.refresh_token

    oauth2Client.setCredentials({
        refresh_token: refToken
    })

    const email = (await google.oauth2({ version: 'v2', auth: oauth2Client }).userinfo.get()).data.email

    const channels = await yt.channels.list({
        part: ['id', 'snippet'],
        mine: true
    })
    if (!channels) throw new JOUError(400, "Error while fetching youtube channel info")

    if (channels.data.items!.length <= 0) throw new JOUError(404, "No channel associated with given youtube account")

    const { id: channelId } = channels.data.items![0]
    const { customUrl } = channels.data.items![0].snippet!

    await db.insert(WorkspaceTable).values({
        id: channelId!,
        owner: req.user.id,
        userHandle: customUrl?.toString()!,
        refreshToken: refToken!,
        email: email!,
    })
        .catch(async err => {
            if (err.code == '23505') {
                // Just renew the refresh Token
                await db
                    .update(WorkspaceTable)
                    .set({ refreshToken: refToken! })
                    .where(eq(WorkspaceTable.id, channelId!))
                    .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1017`) })
            }
        })
    res.json({
        message: "Workspace Created",
    })
}


// Youtube Channel Connector Link
export const youtubeConnecterLink = (req: Request, res: Response<APIResponse>) => {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
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

// Reconnecting URL
export const youtubeReConnecterLink = async (req: Request, res: Response<APIResponse>) => {
    const { id } = req.query
    if (!id) throw new JOUError(404, 'Params not found')

    const [ws] = await db
        .select({ email: WorkspaceTable.email })
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.id, id?.toString()!))

    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
    ]
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        login_hint: ws.email
    })
    res.json({
        message: "Youtube Connector URL",
        data: {
            url
        }
    })
}