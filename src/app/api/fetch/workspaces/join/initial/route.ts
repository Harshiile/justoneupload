import { db } from '@/db';
import { EditorWorkspaceJoinTable, UserTable } from '@/db/schema';
import { JOUError } from '@/lib/error';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { SendAuthorizeMail } from '@/app/mails/templates/authorize';
import { getUser } from '@/app/api/utils/getUser';
import { fetchWorkspaceMetadata } from '../../utils';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('ws')

    const { id: userId } = getUser(req);

    if (!workspaceId) return JOUError(400, "Invalid Params")

    try {
        const [user] = await db
            .select({
                role: UserTable.userType,
                name: UserTable.name,
                id: UserTable.id,
                email: UserTable.email
            })
            .from(UserTable)
            .where(eq(UserTable.id, userId))

        if (!user) return JOUError(404, "User not found")

        if (user.role != 'editor') return JOUError(400, "Youtuber can't joined any workspace")


        // 1. Checks if editor request is approve or not
        try {
            const [isEditorExist] = await db
                .select({ authorize: EditorWorkspaceJoinTable.authorize })
                .from(EditorWorkspaceJoinTable)
                .where((
                    eq(EditorWorkspaceJoinTable.editor, userId),
                    eq(EditorWorkspaceJoinTable.workspace, workspaceId)
                ))
            if (isEditorExist) {
                if (!isEditorExist.authorize) return JOUError(400, "Your request is not approve yet");
                else return JOUError(400, "You already in this Workspace");
            }

        } catch (error) {
            return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1028 `)
        }

        // 2. Checks if editor already in table
        await db
            .insert(EditorWorkspaceJoinTable).values({
                editor: userId,
                workspace: workspaceId,
                authorize: false
            }).catch(err => {
                if (err.code == '23505') return JOUError(400, "You already in this Workspace")
                else return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1006`)
            })


        // 3. Mail to Youtuber
        try {
            try {
                const workspacMetaData = await fetchWorkspaceMetadata(workspaceId, null)
                if (!workspacMetaData) return JOUError(400, "Workspace Params Not Found");

                // const mailInputs: AuthorizeInterface = {
                const mailInputs = {
                    wsId: workspacMetaData.id!,
                    wsName: workspacMetaData.name!,
                    wsAvatar: workspacMetaData.avatar!,
                    wsUserHandle: workspacMetaData.userHandle!,
                    editorId: user.id!,
                    editorName: user.name!,
                    editorMail: user.email!,
                }
                SendAuthorizeMail(mailInputs)

            } catch (error) {
                throw new Error()
            }
        } catch (error) { return JOUError(400, "Workspace Not Found") }

    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1005`)
    }

    return NextResponse.json({ message: "Your request will send to Youtuber" })
}