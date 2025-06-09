import { db } from "@/db";
import { EditorWorkspaceJoinTable, VideoWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq, sql } from "drizzle-orm";

export async function editorChart(id: string) {
    const editorId = id;
    try {

        const subQuery = await db
            .select({
                id: EditorWorkspaceJoinTable.workspace,
                userHandle: WorkspaceTable.userHandle
            })
            .from(EditorWorkspaceJoinTable)
            .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, EditorWorkspaceJoinTable.workspace))
            .where(eq(EditorWorkspaceJoinTable.editor, editorId))

        const videoUploadedByEditor = await db
            .select({
                id: VideoWorkspaceJoinTable.workspace,
                userHandle: WorkspaceTable.userHandle,
                videoUploaded: sql<number>`count(*)`
            })
            .from(VideoWorkspaceJoinTable)
            .groupBy(
                VideoWorkspaceJoinTable.workspace,
                VideoWorkspaceJoinTable.editor,
                WorkspaceTable.userHandle
            )
            .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoWorkspaceJoinTable.workspace))
            .where(eq(VideoWorkspaceJoinTable.editor, editorId));

        if (subQuery.length != videoUploadedByEditor.length) {
            subQuery.forEach(v => {
                if (!videoUploadedByEditor.find(item => item.id == v.id)) {
                    videoUploadedByEditor.push({
                        id: v.id,
                        userHandle: v.userHandle,
                        videoUploaded: 0
                    })
                }
            })
        }
        return videoUploadedByEditor
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1031`)
    }
}