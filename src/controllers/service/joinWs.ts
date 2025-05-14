import { Request, Response } from 'express'
import { db } from '../../db'
import { JwtGenerate, JwtValidate } from '../../lib/jwt'
import { EditorWorkspaceJoinTable, UserTable, WorkspaceTable } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { validate } from 'uuid'
import { JOUError } from '../../lib/error'

export const joinWorkSpace = async (req: Request<{ link: string }, {}, { userId: string }>, res: Response<APIResponse>) => {
    const link = req.params.link
    if (!link) throw new JOUError(400, "Link is not valid")
    let linkData;
    try {
        linkData = JwtValidate(link);
    }
    catch (err) { throw new JOUError(401, "Link is expires") }

    if (linkData && typeof (linkData) != 'string') {
        // User can signup
        const { userId } = req.body
        if (!validate(userId)) { throw new JOUError(400, "User Id not valid") }

        const [user] = await db.select({
            role: UserTable.userType
        }).from(UserTable).where(eq(UserTable.id, userId))

        if (!user) throw new JOUError(404, "User not found")

        if (user.role != 'editor') throw new JOUError(400, "Youtuber can't joined any workspace")

        await db.insert(EditorWorkspaceJoinTable).values({
            editor: userId,
            workspace: linkData.workspaceId
        }).catch(err => { throw new JOUError(400, "You already in this Workspace") })

        res.json({ message: "Join Workspace successfully" })
    }
    else throw new JOUError(400, "Link is not valid")
}
export const wsLinkGenerate = async (req: Request, res: Response<APIResponse>) => {
    const workspaceId = req.query['ws']
    if (!workspaceId) throw new JOUError(404, "WorkSpace Id is not valid")

    const [wsExist] = await db.select().from(WorkspaceTable).where(eq(WorkspaceTable.id, workspaceId.toString()))
    console.log(wsExist);

    if (!wsExist) throw new JOUError(404, "WorkSpace Is Not Exist")

    const linkParams = JwtGenerate({
        workspaceId,
    }, '1d')

    if (!linkParams) throw new JOUError(400, "Link Generation Error, Please Try Again")
    res.json({
        message: "Link Generated",
        data: {
            link: `${process.env.FRONTEND_URL}/join/workspace/${linkParams}`
        }
    })
}