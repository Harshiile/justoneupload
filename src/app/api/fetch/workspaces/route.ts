import { db } from "@/db";
import { EditorWorkspaceJoinTable, WorkspaceTable } from "@/db/schema";
import { JOUError } from "@/lib/error";
import { and, eq, inArray } from "drizzle-orm";
import { google, youtube_v3 } from "googleapis";
import { GaxiosPromise } from "googleapis/build/src/apis/abusiveexperiencereport";
import { NextRequest, NextResponse } from "next/server";
import { validate } from "uuid";
import { oauth2Client } from "../../utils/secrets";
import { getUser } from "../../utils/getUser";
import { fetchWorkspaceMetadata } from "./utils";

interface WorkSpaces {
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

export async function GET(req: NextRequest) {
  // const { id: userId, userType } = req.user;
  const { id: userId, userType } = getUser(req);
  if (!validate(userId)) JOUError(404, "UserId is not valid");
  let workspaces = new Map<string, WorkSpaces>();

  // Workspaces for Youtuber
  if (userType == "youtuber") {
    let wsFromDB;
    try {
      wsFromDB = await db
        .select({
          id: WorkspaceTable.id,
          refToken: WorkspaceTable.refreshToken,
          userHandle: WorkspaceTable.userHandle,
          email: WorkspaceTable.email,
        })
        .from(WorkspaceTable)
        .where(eq(WorkspaceTable.owner, userId));
    } catch (error) {
      return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1014`);
    }

    return NextResponse.json({
      workspaces: !wsFromDB
        ? []
        : Object.fromEntries(await fetchYoutubeChannels(wsFromDB, workspaces)),
    });
  }

  // Workspaces for Editor
  else if (userType == "editor") {
    let wsFromDB;
    try {
      const subQuery = db
        .select({ workspace: EditorWorkspaceJoinTable.workspace })
        .from(EditorWorkspaceJoinTable)
        .where(
          and(
            eq(EditorWorkspaceJoinTable.editor, userId),
            eq(EditorWorkspaceJoinTable.authorize, true)
          )
        );

      wsFromDB = await db
        .select({
          id: WorkspaceTable.id,
          refToken: WorkspaceTable.refreshToken,
          userHandle: WorkspaceTable.userHandle,
          email: WorkspaceTable.email,
        })
        .from(WorkspaceTable)
        .where(inArray(WorkspaceTable.id, subQuery));
    } catch (error) {
      return JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1015`);
    }

    return NextResponse.json({
      workspaces: !wsFromDB
        ? []
        : Object.fromEntries(await fetchYoutubeChannels(wsFromDB, workspaces)),
    });
  } else return JOUError(404, "Invalid UserType");
}

const fetchYoutubeChannels = async (
  wsFromDB: Array<{
    id: string;
    refToken: string;
    userHandle: string;
    email: string;
  }>,
  workspaces: Map<string, WorkSpaces>
) => {
  const wsFetcherPromises: GaxiosPromise<youtube_v3.Schema$ChannelListResponse>[] =
    [];
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  // Fetch Details About YT Channels using Ref Tokens
  await Promise.all(
    wsFromDB.map(async (ws) => {
      workspaces.set(ws.id, {
        id: ws.id,
        userHandle: ws.userHandle,
        email: ws.email,
      });

      try {
        const wsMetaData = await fetchWorkspaceMetadata(
          ws.id,
          ws.refToken
        ).catch((err) => {
          throw new Error();
        });
        workspaces.set(ws.id, {
          id: ws.id,
          email: workspaces.get(ws.id)?.email,
          ...wsMetaData,
        });
      } catch (error) {
        // If token is invalid or revoked, mark as disconnected
        workspaces.set(ws.id, {
          id: ws.id,
          userHandle: ws.userHandle,
          email: ws.email,
          disconnected: true,
        });
      }
    })
  );
  return workspaces;
};
