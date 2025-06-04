import { JwtGenerate } from "@/app/api/lib/jwt"
import { NextRequest, NextResponse } from "next/server"

export interface Channel {
    id: string,
    name: string,
    avatar: string,
    userHandle: string
}
export interface Video {
    title: string,
    fileId: string,
    willUploadAt: string | null
}
export async function POST(req: NextRequest) {
    const { title, fileId, willUploadAt, id, avatar, userHandle, name } = await req.json();
    return NextResponse.json({
        link: generateReviewUrl(
            { id, name, avatar, userHandle },
            { title, fileId, willUploadAt }
        )
    })
}

export const generateReviewUrl = (channel: Channel, video: Video) => {
    return `${process.env.PRODUCT_URL}/review/${JwtGenerate({ channel, video })}`
}