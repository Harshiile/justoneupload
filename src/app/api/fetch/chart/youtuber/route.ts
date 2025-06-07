import { getUser } from "@/app/api/utils/getUser";
import { db } from "@/db";
import { UserTable, VideoWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { eq, inArray, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // const { id: youtuberId } = getUser(req)
    const youtuberId = 'd2954789-e40b-4ac1-bc84-de6b5c227ce0'
    try {
        let subQuery = db
            .select({ id: WorkspaceTable.id })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.owner, youtuberId!))

        let contributions = await db
            .select({
                editor: UserTable.name,
                count: sql<number>`count(*)`
            })
            .from(VideoWorkspaceJoinTable)
            .groupBy(VideoWorkspaceJoinTable.editor, UserTable.name)
            .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
            .where(
                inArray(VideoWorkspaceJoinTable.workspace, subQuery)
            )

        return NextResponse.json(contributions)
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1030`)
    }
}