import { db } from "@/db";
import { VideoTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const videoId = searchParams.get('id')
    const newSchedule = searchParams.get('schedule')

    if (!videoId || !newSchedule) return JOUError(404, "Invalid Params");

    await db
        .update(VideoTable)
        .set({
            willUploadAt: newSchedule
        })
        .catch(_ => JOUError(400, "Update Schedule Failed, Try Again"));

    return NextResponse.json({ message: "Scheudle Time Changed" })
}