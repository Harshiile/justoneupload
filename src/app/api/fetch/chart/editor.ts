import { db } from "@/db";
import { EditorWorkspaceJoinTable, VideoWorkspaceJoinTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq, sql } from "drizzle-orm";

export async function editorChart(id: string) {
    const editorId = id;
    try {

        const subQuery = await db
            .select({
                workspace: EditorWorkspaceJoinTable.workspace
            })
            .from(EditorWorkspaceJoinTable)
            .where(eq(EditorWorkspaceJoinTable.editor, editorId))

        const videoUploadedByEditor = await db
            .select({
                workspace: VideoWorkspaceJoinTable.workspace,
                videoUploaded: sql<number>`count(*)`
            })
            .from(VideoWorkspaceJoinTable)
            .groupBy(
                VideoWorkspaceJoinTable.workspace,
                VideoWorkspaceJoinTable.editor
            )
            .where(eq(VideoWorkspaceJoinTable.editor, editorId));

        if (subQuery.length != videoUploadedByEditor.length) {
            subQuery.forEach(v => {
                if (!videoUploadedByEditor.find(item => item.workspace == v.workspace)) {
                    videoUploadedByEditor.push({
                        workspace: v.workspace,
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