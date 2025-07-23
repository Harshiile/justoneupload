import { JwtGenerate } from "@/app/api/utils/jwt";
import { NextRequest, NextResponse } from "next/server";

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  userHandle: string;
}
export interface Video {
  title: string;
  fileId: string;
  willUploadAt: string | null;
  desc: string | null;
  thumbnail: string | null;
}
export async function POST(req: NextRequest) {
  const { videoId, channelAvatar, channalUserHandle, channelName, channelId } =
    await req.json();
  return NextResponse.json({
    link: generateReviewUrl(
      {
        id: channelId,
        avatar: channelAvatar,
        userHandle: channalUserHandle,
        name: channelName,
      },
      videoId
    ),
  });
}

const generateReviewUrl = (channel: Channel, videoId: string) => {
  return `${process.env.PRODUCT_URL}/review/${JwtGenerate({
    channel,
    videoId,
  })}`;
};
