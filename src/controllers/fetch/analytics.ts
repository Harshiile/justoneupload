import { Request, Response } from 'express'
import { db } from '../../db'
import { UserTable, VideoWorkspaceJoinTable } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
import { validate } from 'uuid'
import { JOUError } from '../../lib/error'

export const editorContribution = async (req: Request, res: Response<APIResponse>) => {
    const workspaceId = req.query['ws'];
    if (!workspaceId && !validate(workspaceId)) throw new JOUError(404, "Workspace Id Is Invalid")

    const editorContribution = await db.select({
        name: UserTable.name,
        editors: VideoWorkspaceJoinTable.editor,
        count: sql`count(*)`
    })
        .from(VideoWorkspaceJoinTable)
        .leftJoin(UserTable, eq(UserTable.id, VideoWorkspaceJoinTable.editor))
        .groupBy(VideoWorkspaceJoinTable.editor, UserTable.name)
        .where(eq(VideoWorkspaceJoinTable.workspace, workspaceId?.toString()!))

    res.json({
        message: "Editor Contribution in WorkSpace",
        data: {
            editorContribution
        }
    })
}