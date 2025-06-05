import { JwtGenerate } from "@/app/api/utils/jwt"
import { db } from "@/db"
import { WorkspaceTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('ws')

    if (!workspaceId) return JOUError(404, "WorkSpace Id is not valid")

    try {
        const [wsExist] = await db
            .select()
            .from(WorkspaceTable)
            .where(eq(WorkspaceTable.id, workspaceId.toString()))

        if (!wsExist) return JOUError(404, "WorkSpace Is Not Exist")

        const linkParams = JwtGenerate({
            workspaceId,
        }, '1d')

        if (!linkParams) return JOUError(400, "Link Generation Error, Please Try Again")
        return NextResponse.json({
            message: "Link Generated",
            link: `${process.env.PRODUCT_URL}/join-workspace/${linkParams}`
        })
    } catch (error) { return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1007`) }
}