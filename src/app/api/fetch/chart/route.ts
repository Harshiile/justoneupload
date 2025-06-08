import { NextRequest, NextResponse } from "next/server"
import { getUser } from "../../utils/getUser"
import { JOUError } from "@/lib/error";
import { editorChart } from "./editor";
import { youtuberChart } from "./youtuber";

export async function GET(req: NextRequest) {
    const { id, userType } = getUser(req);
    if (userType == 'editor') {

        return NextResponse.json(await editorChart(id))
    }
    else if (userType == 'youtuber') {
        return NextResponse.json(await youtuberChart(id, req.url))
    }
    else return JOUError(400, "Invalid Params")
}