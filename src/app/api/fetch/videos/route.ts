import { db } from "@/db";
import { EditorWorkspaceJoinTable, UserTable, VideoTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "../../lib/getUser";

export async function GET(req: NextRequest) {
    const { id: userId, userType } = getUser(req)

    let subQuery;
    if (userType == 'youtuber') {
        subQuery = db
            .select({ id: WorkspaceTable.id })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.owner, userId))
    }
    else if (userType == 'editor') {
        subQuery = db
            .select({ id: EditorWorkspaceJoinTable.workspace })
            .from(EditorWorkspaceJoinTable)
            .where(eq(EditorWorkspaceJoinTable.editor, userId))
    }
    else return JOUError(404, "Invalid User Type")

    const videos = await db
        .select({
            id: VideoTable.id,
            title: VideoTable.title,
            videoType: VideoTable.videoType,
            thumbnail: VideoTable.thumbnail,
            duration: VideoTable.duration,
            fileId: VideoTable.fileId,
            status: VideoTable.status,
            willUploadAt: VideoTable.willUploadAt,
            editor: UserTable.name,
            userHandle: WorkspaceTable.userHandle
        })
        .from(VideoTable)
        .leftJoin(UserTable, eq(UserTable.id, VideoTable.editor))
        .leftJoin(WorkspaceTable, eq(WorkspaceTable.id, VideoTable.workspace))
        .where(and(
            inArray(VideoTable.workspace, subQuery),
        ))
        .catch(_ => JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1012`))

    return NextResponse.json({ videos })
}