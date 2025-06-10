import { db } from "../../../../db/index.ts"
import { WorkspaceTable } from "../../../../db/schema.ts"
import { JOUError } from "../../../../lib/error.ts"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { getReconnectUrl } from "./utils/getReconnect.ts"


export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('ws')

    if (!id) return JOUError(404, 'Params not found')
    try {
        const [ws] = await db
            .select({ email: WorkspaceTable.email })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.id, id))


        return NextResponse.json({ url: getReconnectUrl(ws.email) })
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1027`)
    }
}