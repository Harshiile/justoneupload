import { db } from "../../../db/index.ts";
import { UserTable, WorkspaceTable } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import { fetchWorkspaceMetadata } from "../../api/fetch/workspaces/utils/index.ts";
import { getReconnectUrl } from "../../api/youtube/reconnect/utils/getReconnect.ts";
import { SendMail } from "../index.ts";
import { log } from "node:console";

export interface WorkSpace {
  userHandle: string,
  id: string,
  ownerName: string
}

export const SendReconnectMail = async (workspaceId: string) => {
  const [ws] = await db
    .select({
      email: WorkspaceTable.email,
      owenerName: UserTable.name,
      userHandle: WorkspaceTable.userHandle
    })
    .from(WorkspaceTable)
    .leftJoin(UserTable, eq(UserTable.id, WorkspaceTable.owner))
    .where(eq(WorkspaceTable.id, workspaceId));

  const htmlText = ReconnectMailTemplate(
    {
      id: workspaceId,
      userHandle: ws.userHandle,
      ownerName: ws.owenerName!
    },
    getReconnectUrl(ws.email));

  console.log('Sending Mail Reconnecting Mail .........');

  await SendMail(ws.email, '❗Workspace Inactive - Reconnect Before It’s Gone', htmlText);
}

const ReconnectMailTemplate = (workspace: WorkSpace, reconnectUrl: string) => {
  return `
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Workspace Inactive - JustOneUpload</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#fff;color:#fff;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="margin:auto;background-color:#111;border:1px solid #222;border-radius:12px;overflow:hidden;width:100%;">

      <!-- Body -->
      <div style="padding:24px 20px;" data-section="email-body">
        <div style="color:#ccc;font-size:0.95rem;line-height:1.6;margin-bottom:20px;" data-notice>
          Hello <strong data-username>${workspace.ownerName}</strong>,<br /><br />
          We noticed that your workspace <strong>${workspace.userHandle}</strong> is currently <span style="color:#ff6b6b;">inactive</span> and disconnected from your YouTube channel.<br /><br />
          This means that uploads, reviews, or scheduled activities via <strong>JustOneUpload</strong> are paused.<br /><br />
          To continue seamless uploads and workflows with your editors, please reconnect your workspace.
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;padding:10px 0 30px;" data-section="cta-button">
          <a href="${reconnectUrl}" target="_blank" style="background-color:#4ac1ff;color:#000;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block;margin:8px;" data-reconnect-link>
            🔗 Reconnect Workspace
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:16px 10px 36px;font-size:0.8rem;color:#666;border-top:1px solid #222;text-align:center;" data-section="email-footer">
        If this disconnection was unintentional or temporary, you can safely reconnect anytime using the link above.<br />
        If you no longer use JustOneUpload, you may ignore this message.<br />
        <div style="margin-top:20px;">
          <img src="${process.env.CLOUDINARY_LOGO}" alt="JustOneUpload" style="width:60px;height:60px;opacity:0.6;" data-logo />
        </div>
      </div>
    </div>
  </body>
</html>

`};