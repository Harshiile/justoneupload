import { db } from "@/db"
import { EditorWorkspaceJoinTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const workspaceId = searchParams.get('ws')
    const approve = searchParams.get('approve')

    if (!id || !workspaceId || !approve) return JOUError(404, "Params Not Found");

    if (approve == 'true') {
        // update DB
        await db
            .update(EditorWorkspaceJoinTable)
            .set({ authorize: true })
            .where(
                and(
                    eq(EditorWorkspaceJoinTable.workspace, workspaceId),
                    eq(EditorWorkspaceJoinTable.editor, id)
                )
            ).catch(_ => JOUError(400, "Joined Error, Please try again"))

        return NextResponse.json({ message: "Editor Joined Workspace" })
    }
    else if (approve == 'false') {
        // delete entry
        await db
            .delete(EditorWorkspaceJoinTable)
            .where(
                and(
                    eq(EditorWorkspaceJoinTable.workspace, workspaceId?.toString()!),
                    eq(EditorWorkspaceJoinTable.editor, id?.toString()!)
                )
            ).catch(_ => JOUError(400, "Joined Error, Please try again"))
        return NextResponse.json({ message: "Editor Discarded from Workspace" })
    }
    else return JOUError(400, "Invalid Request, Please try again")
}