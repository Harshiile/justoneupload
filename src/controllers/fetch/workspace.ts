import { Request, Response } from 'express'
import { db } from '../../db';
import { EditorWorkspaceJoinTable, WorkspaceTable } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { validate } from 'uuid'
import { google, youtube_v3 } from 'googleapis';
import { oauth2Client } from '../../lib/secrets';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { JOUError } from '../../lib/error';
import { JwtValidate } from '../../lib/jwt';


// Details about WorkSpace used in Joining Page
export const getWorkspaceDetails = async (req: Request, res: Response<APIResponse>) => {
    const joiningLink = req.params.joinLink
    if (!joiningLink) throw new JOUError(401, "Invalid Link");
    try {
        const linkData = JwtValidate(joiningLink);
        if (typeof (linkData) != 'string') {
            const [ws] = await db.select(
                { refreshToken: WorkspaceTable.refreshToken }
            ).from(WorkspaceTable).where(eq(WorkspaceTable.id, linkData.workspaceId))

            oauth2Client.setCredentials({
                refresh_token: ws.refreshToken
            })
            const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

            const channelRes = await youtube.channels.list({
                part: ['snippet', 'statistics'],
                mine: true
            })
            const channelData = channelRes.data.items?.[0]
            if (channelData) {
                const snippet = channelData?.snippet || {};
                const statistics = channelData?.statistics || {};
                const branding = channelData?.brandingSettings?.channel || {};
                const channelMetaData = {
                    id: channelData?.id,
                    name: snippet.title || '',
                    description: snippet.description || '',
                    avatar: snippet.thumbnails?.high?.url || '',
                    userHandle: snippet.customUrl || null,
                    totalSubscribers: parseInt(statistics.subscriberCount || '0'),
                    totalVideos: parseInt(statistics.videoCount || '0'),
                    dateCreated: snippet.publishedAt || '',
                    tags: branding.keywords ? branding.keywords.split(',').map((tag: string) => tag.trim()) : [],
                }
                res.json({
                    message: "Channel Details",
                    data: { channelMetaData }
                })
            }
            else throw new JOUError(401, "Invalid Link")


        }
        else throw new JOUError(401, "Invalid Link")
    }
    catch (err) {
        if (err instanceof Error) {
            console.log(err.message, err.name);
            if (err.name == 'TokenExpiredError') throw new JOUError(401, "Link is expires")
            else throw new JOUError(400, "Invalid Link")
        }
        else throw new JOUError(400, "Invalid Link")
    }
}

// All Workspaces of User
export const getWorkSpaces = async (req: Request<{}, {}>, res: Response<APIResponse>) => {
    const { userId, role } = req.query;

    if (!validate(userId)) throw new JOUError(404, "UserId is not valid");

    let wsRefTokens = null;

    if (typeof (userId) == 'string') {

        // Workspaces for Youtuber
        if (role == 'youtuber') {
            wsRefTokens = await db.select({
                refToken: WorkspaceTable.refreshToken
            }).from(WorkspaceTable).where(eq(WorkspaceTable.owner, userId))
        }

        // Workspaces for Editor
        else if (role == 'editor') {
            const subQuery = db.select({ workspace: EditorWorkspaceJoinTable.workspace }).from(EditorWorkspaceJoinTable).where(eq(EditorWorkspaceJoinTable.editor, userId));
            wsRefTokens = await db.select({
                refToken: WorkspaceTable.refreshToken
            }).from(WorkspaceTable).where(inArray(WorkspaceTable.id, subQuery))
        }

        else throw new JOUError(404, "Role is not valid");

        const wsFetcherPromises: GaxiosPromise<youtube_v3.Schema$ChannelListResponse>[] = []
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

        // Fetch Details About YT Channels using Ref Tokens
        wsRefTokens?.map(async (ws) => {
            oauth2Client.setCredentials({
                refresh_token: ws.refToken
            })
            wsFetcherPromises.push(youtube.channels.list({
                part: ['snippet', 'statistics'],
                mine: true
            }))
        })
        Promise.all(wsFetcherPromises)
            .then(ws => {
                const workspaces = ws.map(w => {
                    const wsData = w.data.items![0]
                    return {
                        id: wsData.id,
                        name: wsData.snippet!.title,
                        userHandle: wsData.snippet?.customUrl,
                        avatar: wsData.snippet!.thumbnails?.high?.url,
                        subscribers: wsData.statistics?.subscriberCount
                    }
                })
                res.json({
                    message: "Workspaces of Editor",
                    data: { workspaces }
                })
            })
            .catch(err => { throw new JOUError(err.status, "Failed to Fetch Workspaces") })
    }
    else throw new JOUError(404, "UserId is not valid");
}