import { Request, Response } from 'express'
import { db } from '../../db'
import { JwtGenerate, JwtValidate } from '../../lib/jwt'
import { EditorWorkspaceJoinTable, UserTable, WorkspaceTable } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { validate } from 'uuid'
import { JOUError } from '../../lib/error'
import { AuthorizeInterface, SendAuthorizeMail } from '../mail/templates/authorize'
import { fetchWorkspaceMetadata } from '../fetch/workspace'


export const initialWorkspaceJoin = async (req: Request<{ link: string }, {}, { userId: string }>, res: Response<APIResponse>) => {
    const link = req.params.link
    if (!link) throw new JOUError(400, "Link is not valid")
    let linkData;
    try {
        linkData = JwtValidate(link);
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.name == 'TokenExpiredError') throw new JOUError(401, "Link is expires")
        }
        else throw new JOUError(400, "Link is not valid")
    }

    if (linkData && typeof (linkData) != 'string') {
        // User can signup
        // const { id } = req.user
        // const id = 'bff10982-59b9-48fc-addb-e2aec515ca5f' //Youtuber
        const id = 'b8162480-15e2-4480-b087-aa1016c4bd8c' //Editor
        if (!validate(id)) { throw new JOUError(400, "User Id not valid") }

        const [user] = await db
            .select({
                role: UserTable.userType,
                name: UserTable.name,
                id: UserTable.id,
                email: UserTable.email
            })
            .from(UserTable)
            .where(eq(UserTable.id, id))
            .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1005`) })

        if (!user) throw new JOUError(404, "User not found")

        if (user.role != 'editor') throw new JOUError(400, "Youtuber can't joined any workspace")

        // 1. Checks if editor request is approve or not
        const [isEditorExist] = await db
            .select({ id: EditorWorkspaceJoinTable.workspace })
            .from(EditorWorkspaceJoinTable)
            .where(and(
                eq(EditorWorkspaceJoinTable.editor, id),
                eq(EditorWorkspaceJoinTable.authorize, false)
            ))
        if (isEditorExist) throw new JOUError(400, "Your request is not approve yet");


        // 2. Checks if editor already in table
        await db
            .insert(EditorWorkspaceJoinTable).values({
                editor: id?.toString(),
                workspace: linkData.workspaceId,
                authorize: false
            }).catch(err => {
                if (err.code == '23505') throw new JOUError(400, "You already in this Workspace")
                else throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1006`)
            })


        // 3. Mail to Youtuber
        const workspacMetaData = await fetchWorkspaceMetadata(linkData.workspaceId)
        const mailInputs: AuthorizeInterface = {
            editorId: user.id,
            editorName: user.name!,
            editorMail: user.email!,
            wsId: workspacMetaData.id!,
            wsName: workspacMetaData.name,
            wsAvatar: workspacMetaData.avatar,
            wsUserHandle: workspacMetaData.userHandle!
        }
        SendAuthorizeMail(mailInputs)

        res.json({ message: "Your request will send to Youtuber" })
    }
    else throw new JOUError(400, "Link is not valid")
}



export const generateWorkspaceJoinLink = async (req: Request, res: Response<APIResponse>) => {
    const workspaceId = req.query['ws']
    if (!workspaceId) throw new JOUError(404, "WorkSpace Id is not valid")

    const [wsExist] = await db
        .select()
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.id, workspaceId.toString()))
        .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1007`) })

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



export const finalWorkspaceJoin = async (req: Request, res: Response<APIResponse>) => {
    const { id, workspaceId, approve } = req.query
    if (approve == 'true') {
        // update DB
        await db
            .update(EditorWorkspaceJoinTable)
            .set({ authorize: true })
            .where(
                and(
                    eq(EditorWorkspaceJoinTable.workspace, workspaceId?.toString()!),
                    eq(EditorWorkspaceJoinTable.editor, id?.toString()!)
                )
            ).catch(_ => { throw new JOUError(400, "Joined Error, Please try again") })
        res.json({
            message: "Editor Joined Workspace"
        })
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
            ).catch(_ => { throw new JOUError(400, "Joined Error, Please try again") })
        res.json({
            message: "Editor is Rejected to Join Workspace"
        })
    }
    else throw new JOUError(400, "Invalid Request, Please try again")
}