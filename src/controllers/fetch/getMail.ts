import { eq } from "drizzle-orm"
import { db } from "../../db"
import { UserTable, WorkspaceTable } from "../../db/schema"

export const getYoutuberMailFromWorkSpace = async (workspaceId: string) => {
    const [user] = await db
        .select({
            email: UserTable.email
        })
        .from(UserTable)
        .leftJoin(WorkspaceTable, eq(UserTable.id, WorkspaceTable.owner))
        .where(eq(WorkspaceTable.id, workspaceId));

    return user.email
}