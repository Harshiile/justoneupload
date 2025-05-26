import { Request, Response } from 'express'
import { db } from '../../db';
import { EditorWorkspaceJoinTable, WorkspaceTable } from '../../db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { validate } from 'uuid'
import { google, youtube_v3 } from 'googleapis';
import { oauth2Client } from '../../lib/secrets';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { JOUError } from '../../lib/error';
import { JwtValidate } from '../../lib/jwt';

interface WorkSpaces {
    id?: string,
    disconnected?: boolean,
    userHandle?: string,
    avatar?: string,
    subscribers?: string,
    name?: string
}


export const fetchWorkspaceMetadata = async (workspaceId: string) => {
    const [ws] = await db
        .select({ refreshToken: WorkspaceTable.refreshToken })
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.id, workspaceId))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1013`) })

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
        return {
            id: channelData?.id!,
            name: snippet.title!,
            description: snippet.description!,
            avatar: snippet.thumbnails?.high?.url!,
            userHandle: snippet.customUrl!,
            totalSubscribers: parseInt(statistics.subscriberCount!),
            totalVideos: parseInt(statistics.videoCount!),
            dateCreated: snippet.publishedAt!,
        }
    }
    else throw new JOUError(400, "Invalid Link")
}


// Details about WorkSpace used in Joining Page
export const getWorkspaceDetails = async (req: Request, res: Response<APIResponse>) => {
    const joiningLink = req.params.link
    if (!joiningLink) throw new JOUError(401, "Invalid Link");

    try {
        const linkData = JwtValidate(joiningLink);
        if (typeof (linkData) != 'string') {

            const channelMetaData = await fetchWorkspaceMetadata(linkData.workspaceId).catch(_ => { throw new JOUError(400, "Invalid Link") })
            res.json({
                message: "Channel Details",
                data: { channelMetaData }
            })
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




const fetchYoutubeChannels = async (wsFromDB: Array<{
    id: string,
    refToken: string,
    disconnected: boolean,
    userHandle: string
}>, workspaces: Map<string, WorkSpaces>) => {
    const wsFetcherPromises: GaxiosPromise<youtube_v3.Schema$ChannelListResponse>[] = []
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // Fetch Details About YT Channels using Ref Tokens
    wsFromDB?.map(async (ws) => {
        workspaces.set(ws.id, {
            id: ws.id,
            userHandle: ws.userHandle,
            disconnected: ws.disconnected,
        })
        oauth2Client.setCredentials({
            refresh_token: ws.refToken
        })
        wsFetcherPromises.push(youtube.channels.list({
            part: ['snippet', 'statistics'],
            mine: true
        }))
    })

    const ws = await Promise.all(wsFetcherPromises)
        .catch(err => { console.log('error in fetching workspace : ', err); throw new JOUError(400, "Failed to Fetch Workspaces") })

    ws.map(w => {
        const wsData = w.data.items![0]
        workspaces.set(wsData.id!, {
            id: workspaces.get(wsData.id!)?.id!,
            userHandle: workspaces.get(wsData.id!)?.userHandle!,
            disconnected: workspaces.get(wsData.id!)?.disconnected!,
            name: wsData.snippet!.title!,
            avatar: wsData.snippet!.thumbnails?.high?.url!,
            subscribers: wsData.statistics?.subscriberCount!
        })
    })
    return workspaces
}





// All Workspaces of User
export const getWorkspacesOfUser = async (req: Request<{}, {}>, res: Response<APIResponse>) => {
    const { id: userId, userType } = req.user;

    if (!validate(userId)) throw new JOUError(404, "UserId is not valid");

    let workspaces = new Map<string, WorkSpaces>();

    if (typeof (userId) == 'string') {

        // Workspaces for Youtuber
        if (userType == 'youtuber') {
            const wsFromDB = await db
                .select({
                    id: WorkspaceTable.id,
                    refToken: WorkspaceTable.refreshToken,
                    disconnected: WorkspaceTable.disconnected,
                    userHandle: WorkspaceTable.userHandle
                })
                .from(WorkspaceTable)
                .where(eq(WorkspaceTable.owner, userId))
                .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1014`) })

            res.json({
                message: "Workspaces",
                data: { workspaces: Object.fromEntries(await fetchYoutubeChannels(wsFromDB, workspaces)) }
            })

        }

        // Workspaces for Editor
        else if (userType == 'editor') {
            const subQuery = db
                .select({ workspace: EditorWorkspaceJoinTable.workspace })
                .from(EditorWorkspaceJoinTable)
                .where(and(
                    eq(EditorWorkspaceJoinTable.editor, userId),
                    eq(EditorWorkspaceJoinTable.authorize, true)
                ))

            const wsFromDB = await db
                .select({
                    id: WorkspaceTable.id,
                    refToken: WorkspaceTable.refreshToken,
                    disconnected: WorkspaceTable.disconnected,
                    userHandle: WorkspaceTable.userHandle
                })
                .from(WorkspaceTable)
                .where(inArray(WorkspaceTable.id, subQuery))
                .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1015`) })

            res.json({
                message: "Workspaces",
                data: {
                    workspaces: Object.fromEntries(await fetchYoutubeChannels(wsFromDB, workspaces))
                }
            })
        }

        else throw new JOUError(404, "userType is not valid");

    }
    else throw new JOUError(404, "UserId is not valid");
}