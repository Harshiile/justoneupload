import { JwtValidate } from "@/app/api/utils/jwt";
import { JOUError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";
import { fetchWorkspaceMetadata } from "../../../utils";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const link = searchParams.get('link')

    if (!link) return JOUError(404, "Link not found");
    try {
        const workspaceId = (await JwtValidate(link)).payload?.workspaceId;

        const workspace = await fetchWorkspaceMetadata(workspaceId as string, null);
        if (!workspace) return JOUError(400, "Workspace Params Not Valid");

        return NextResponse.json({ workspace })
    } catch (err) {
        if (err instanceof Error) {
            if (err.name == 'TokenExpiredError') return JOUError(401, "Link is expires")
        }
        else return JOUError(400, "Link is not valid")
    }
}   