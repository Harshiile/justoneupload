import { db } from "@/db";
import { EditorWorkspaceJoinTable, UserTable, VideoWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { and, eq, inArray, sql } from "drizzle-orm";


export async function youtuberChart(id: string, url: string) {
    const youtuberId = id;
    const { searchParams } = new URL(url)
    const forChart = searchParams.get('chart')

    if (forChart == '1') {
        // How many editors are distributed among own workspaces
        try {
            let subQuery = await db
                .select({
                    id: WorkspaceTable.id,
                    userHandle: WorkspaceTable.userHandle
                })
                .from(WorkspaceTable)
                .where(
                    eq(WorkspaceTable.owner, youtuberId!)
                );

            let workspaces = subQuery.map(ws => ws.id);

            let totalEditors = await db
                .select({
                    id: EditorWorkspaceJoinTable.workspace,
                    userHandle: WorkspaceTable.userHandle,
                    editors: sql<Array<{
                        id: string,
                        name: string
                    }>>`ARRAY_AGG(
                        json_build_object(
                            'id',${UserTable.id},
                            'name',${UserTable.name}
                        )
                    )`
                })
                .from(EditorWorkspaceJoinTable)
                .groupBy(
                    EditorWorkspaceJoinTable.workspace,
                    WorkspaceTable.userHandle
                )
                .leftJoin(UserTable, eq(UserTable.id, EditorWorkspaceJoinTable.editor))
                .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, EditorWorkspaceJoinTable.workspace))
                .where(
                    and(
                        eq(EditorWorkspaceJoinTable.authorize, true),
                        inArray(EditorWorkspaceJoinTable.workspace, workspaces)
                    )
                );

            if (subQuery.length != totalEditors.length) {
                subQuery.forEach(ws => {
                    if (!totalEditors.find(item => item.id == ws.id)) {
                        totalEditors.push({
                            id: ws.id,
                            userHandle: ws.userHandle,
                            editors: []
                        })
                    }
                })
            }


            return totalEditors
        } catch (error) {
            return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1030`)
        }
    }
    else if (forChart == '2') {
        // Numbers of video uploaded by all editors in perticular workspace
        const wsId = searchParams.get('ws');
        if (!wsId) return JOUError(400, "Invalid Params");

        // All editors of workspace
        const subQuery = db
            .select({
                id: EditorWorkspaceJoinTable.editor,
                name: UserTable.name
            })
            .from(EditorWorkspaceJoinTable)
            .leftJoin(
                UserTable,
                eq(UserTable.id, EditorWorkspaceJoinTable.editor)
            )
            .where(
                and(
                    eq(EditorWorkspaceJoinTable.authorize, true),
                    eq(EditorWorkspaceJoinTable.workspace, wsId)
                )
            )
        let allEditors: Array<string> = [];
        (await subQuery).forEach(item => {
            item.id && allEditors.push(item.id)
        });

        // const editorContribution: any = []
        const editorContribution = await db
            .select({
                editorId: VideoWorkspaceJoinTable.editor,
                editorName: UserTable.name,
                videoUploaded: sql<number>`count(*)`
            })
            .from(VideoWorkspaceJoinTable)
            .groupBy(
                VideoWorkspaceJoinTable.editor,
                UserTable.name
            )
            .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
            .where(inArray(VideoWorkspaceJoinTable.editor, allEditors))


        const subData = await subQuery;
        if (subData.length != editorContribution.length) {
            subData.forEach(e => {
                if (!editorContribution.find(item => item.editorId == e.id)) {
                    editorContribution.push({
                        editorId: e.id,
                        editorName: e.name,
                        videoUploaded: 0
                    })
                }
            })
        }

        return editorContribution
    }
    else return JOUError(400, "Invalid Params")
}