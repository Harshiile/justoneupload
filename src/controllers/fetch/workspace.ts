import { Request, Response } from 'express'
import { db } from '../../db';
import { EditorWorkspaceJoinTable, WorkspaceTable } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { validate } from 'uuid'
import { google, youtube_v3 } from 'googleapis';
import { oauth2Client } from '../../lib/secrets';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { JOUError } from '../../lib/error';

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