import { db } from "@/db"
import { VideoTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const schedule = searchParams.get('schedule')

    if (!id || !schedule) return JOUError(404, "Invalid Request")

    await db
        .update(VideoTable)
        .set({ willUploadAt: schedule.toString() })
        .catch(_ => JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1024`))

    return NextResponse.json({ message: "Schedule Updated" })
}