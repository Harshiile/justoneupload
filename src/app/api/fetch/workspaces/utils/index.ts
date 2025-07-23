import { oauth2Client } from "../../../utils/secrets.ts";
import { db } from "../../../../../db/index.ts";
import { WorkspaceTable } from "../../../../../db/schema.ts";
import { eq } from "drizzle-orm";
import { google } from "googleapis";

interface WorkSpace {
  id: string;
  disconnected?: boolean;
  userHandle?: string;
  avatar?: string;
  subscribers?: string;
  name?: string;
  desc?: string;
  email?: string;
  totalVideos?: string;
}

export const fetchWorkspaceMetadata = async (
  wsId: string,
  refToken: string | null
): Promise<WorkSpace | null> => {
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  let refTkn = refToken;
  if (!refTkn) {
    try {
      const [ws] = await db
        .select({ refTkn: WorkspaceTable.refreshToken })
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.id, wsId));

      refTkn = ws.refTkn;
    } catch (error) {
      throw new Error();
    }
  }
  try {
    oauth2Client.setCredentials({
      refresh_token: refTkn,
    });

    const wsData = await youtube.channels
      .list({
        part: ["snippet", "statistics"],
        mine: true,
      })
      .catch((_) => {
        throw new Error();
      });

    if (!wsData) return null;
    else {
      const channelData = wsData.data.items?.[0]!;
      return {
        id: channelData.id!,
        userHandle: channelData.snippet?.customUrl!,
        name: channelData.snippet?.title!,
        avatar: channelData.snippet?.thumbnails?.high?.url!,
        subscribers: channelData.statistics?.subscriberCount!,
        desc: channelData.snippet?.description!,
        totalVideos: channelData.statistics?.videoCount!,
        disconnected: false,
      };
    }
  } catch (error) {
    throw new Error();
  }
};
