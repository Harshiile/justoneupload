import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "../../utils/secrets";
import { google } from "googleapis";
import { JOUError } from "@/lib/error";
import { db } from "@/db";
import { WorkspaceTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getUser } from "../../utils/getUser";

export async function GET(req: NextRequest) {
  // WORKSPACE_CAPICITY
  const { id: UserId } = getUser(req);
  let [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(WorkspaceTable)
    .where(eq(WorkspaceTable.owner, UserId));

  if (count >= Number(process.env.WORKSPACE_CAPICITY))
    return JOUError(401, "Workspace Limits Reached");

  const scopes = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });
  return NextResponse.json({ url });
}

export async function POST(req: NextRequest) {
  const yt = google.youtube({ version: "v3", auth: oauth2Client });
  const { id: userId } = getUser(req);
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) return JOUError(400, "Code not generated after youtube signup");
  try {
    const youtubeChannel = await oauth2Client
      .getToken(code!.toString())
      .catch((err) => {
        throw new Error();
      });
    // store refreshToken on db - Workspace Table
    if (!youtubeChannel)
      return JOUError(404, "Youtube Channel Fetching Failed");

    const refToken = youtubeChannel.tokens.refresh_token;

    oauth2Client.setCredentials({
      refresh_token: refToken,
    });

    const email = (
      await google.oauth2({ version: "v2", auth: oauth2Client }).userinfo.get()
    ).data.email;

    const channels = await yt.channels.list({
      part: ["id", "snippet"],
      mine: true,
    });
    if (!channels)
      return JOUError(400, "Error while fetching youtube channel info");

    if (channels.data.items!.length <= 0)
      return JOUError(404, "No channel associated with given youtube account");

    const { id: channelId } = channels.data.items![0];
    const { customUrl } = channels.data.items![0].snippet!;

    await db
      .insert(WorkspaceTable)
      .values({
        id: channelId!,
        owner: userId,
        userHandle: customUrl?.toString()!,
        refreshToken: refToken!,
        email: email!,
      })
      .catch(async (err: any) => {
        if (err?.cause?.code == "23505") {
          // Just renew the refresh Token
          await db
            .update(WorkspaceTable)
            .set({ refreshToken: refToken! })
            .where(eq(WorkspaceTable.id, channelId!))
            .catch((_) => {
              return JOUError(
                400,
                `${process.env.SERVER_ERROR_MESSAGE} - 1017`
              );
            });
        }
      });

    return NextResponse.json({ message: "Workspace Created" });
  } catch (error) {
    console.log(error);

    return JOUError(404, "Unauthorized Code");
  }
}
