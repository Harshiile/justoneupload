import { db } from "@/db"
import { WorkspaceTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { eq } from "drizzle-orm"
import { oauth2Client } from "../../lib/screats"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('ws')

    if (!id) return JOUError(404, 'Params not found')
    try {
        const [ws] = await db
            .select({ email: WorkspaceTable.email })
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.id, id))

        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/userinfo.email',
        ]

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: scopes,
            login_hint: ws.email
        })
        return NextResponse.json({ url })
    } catch (error) {
        return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1027`)
    }
}