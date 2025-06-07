import { getUser } from "@/app/api/utils/getUser";
import { db } from "@/db";
import { VideoWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { id: editorId } = getUser(req)
    try {
        let contributions = await db
            .select({
                workspace: WorkspaceTable.userHandle,
                count: sql<number>`count(*)`
            })
            .from(VideoWorkspaceJoinTable)
            .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoWorkspaceJoinTable.workspace))
            .groupBy(WorkspaceTable.userHandle)
            .where(eq(VideoWorkspaceJoinTable.editor, editorId!))
        return NextResponse.json(contributions)
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1030`)
    }
}