import { db } from "../../../db/index.ts"
import { UserTable, WorkspaceTable } from "../../../db/schema.ts"
import { eq } from "drizzle-orm"
import { SendMail } from "../index.ts"
import { JwtGenerate } from "../../api/utils/jwt.ts"
import { fetchWorkspaceMetadata } from "../../api/fetch/workspaces/utils/index.ts"
import { convertDuration, convertDate } from "./notify.ts"

export interface ApprovalInterface {
  title: string
  desc: string | null
  videoType: 'public' | 'private' | 'unlisted'
  duration: string
  isMadeForKids: boolean
  willUploadAt: string | null
  editor: string
  fileId: string,
  workspace: string
  thumbnail: string | null
}

interface User {
  name: string | null
  email: string
}

export interface WorkspaceMail {
  id?: string
  name?: string
  avatar?: string
  userHandle?: string
}
export interface VideoMetaDataMail {
  title: string
  willUploadAt: string | null
  fileId: string
}

export const fetchEditor = async (editorId: string) => {
  try {
    const [editor] = await db
      .select({
        name: UserTable.name,
        email: UserTable.email
      })
      .from(UserTable)
      .where(eq(UserTable.id, editorId))
    return editor
  } catch (error) { throw new Error() }
}

export const fetchYoutuber = async (workspaceId: string) => {
  try {
    const [youtuber] = await db
      .select({
        email: WorkspaceTable.email,
        name: UserTable.name
      })
      .from(WorkspaceTable)
      .leftJoin(UserTable, eq(UserTable.id, WorkspaceTable.owner))
      .where(eq(WorkspaceTable.id, workspaceId))
    return youtuber
  } catch (error) { throw new Error() }
}


export const SendApprovalMail = async (VideoData: ApprovalInterface) => {
  const editor = await fetchEditor(VideoData.editor);
  const youtuber = await fetchYoutuber(VideoData.workspace);

  const ws = await fetchWorkspaceMetadata(VideoData.workspace, null)
  if (!ws) throw new Error("Workspace not found");

  const htmlText = ApprovalMailTemplate(VideoData, editor, youtuber, ws)

  await SendMail(youtuber.email, "🎬 A New Video Awaits Your Review — Ready When You Are", htmlText)
}

export const generateReviewUrl = (workspace: WorkspaceMail, video: VideoMetaDataMail) => {
  const videoDetails = {
    channelAvatar: workspace.avatar,
    channelName: workspace.name,
    channelUserHandle: workspace.userHandle,
    channelId: workspace.id,
    title: video.title,
    fileId: video.fileId,
    willUploadAt: video.willUploadAt
  }
  return `${process.env.PRODUCT_URL}/review/${JwtGenerate(videoDetails)}`
}

const ApprovalMailTemplate = (video: ApprovalInterface, editor: User, youtuber: User, workspace: WorkspaceMail): string => {
  return `
 <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Video Review Notification</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body
    style="margin: 0; padding: 0; background-color: #ffffff; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

    <!-- MAIN Content Box -->
    <div
        style="margin: auto; background-color: #111111; border-radius: 12px; overflow: hidden; box-shadow: 0 0 10px rgba(255,255,255,0.05);  width: 100%;">

        <!-- Header -->
        <div style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #222;">
            <img src="https://i.pravatar.cc/100?img=7" alt="Avatar"
                style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;" />
            <div>
                <h2 style="margin: 0; color: #eee; font-size: 1.25rem;">TechVerse Edits</h2>
                <p style="margin: 2px 0 0 0; color: #aaa; font-size: 0.9rem;">@techverseofficial</p>
            </div>
        </div>

        <!-- Body -->
        <div style="padding: 24px 20px;">
            <p style="font-size: 1.1rem; color: #ccc;">Hey Aayush Gupta,</p>
            <p style="color: #bbb; font-size: 0.95rem; line-height: 1.6;">
                Just a heads-up — your editor <strong>Harsh Patel</strong> has uploaded a brand new video titled
                <strong>"Mastering Docker in 15 Minutes"</strong> to your workspace <strong>TechVerse Edits</strong>.
                <br /><br />
                It's neatly packaged, beautifully edited, and awaiting your final word. Whether you’re sipping your
                coffee or in between takes, now’s the perfect time to give it a watch and hit <strong>approve</strong>
                when ready.
            </p>

            <p style="color: #888; margin-top: 12px;">As always, you're in control. You can review, reschedule or
                reject.</p>

            <!-- Video Card -->
            <div
              style="display: flex; flex-wrap: wrap; background-color: #1a1a1a; border: 1px solid #333; border-radius: 10px; overflow: hidden; margin: 20px 0;">

              <!-- Thumbnail (Smaller on large screen, full on small) -->
              <div style="flex: 0 0 160px; max-width: 160px; width: 100%; background-color: #000;">
                <img src="https://i.ytimg.com/vi/3c-iBn73dDE/maxresdefault.jpg" alt="Docker thumbnail"
                  style="width: 100%; height: auto; display: block;" />
              </div>

              <!-- Video Info -->
              <div style="flex: 1 1 auto; padding: 16px; min-width: 240px;">
                <div style="font-size: 1rem; font-weight: bold; margin-bottom: 6px; color: #fff;">
                  Mastering Docker in 15 Minutes
                </div>
                <div style="font-size: 0.85rem; color: #bbb; margin-bottom: 6px;">
                  <span
                    style="display: inline-block; background-color: #8b5cf6; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; color: #fff; margin-right: 8px;">
                    Tutorial
                  </span>
                  Duration: 00:14:37
                </div>
                <div style="font-size: 0.85rem; color: #bbb;">
                  Publishing: Jun 12, 2025, 06:00 PM IST
                </div>
              </div>
            </div>


            <!-- Editor Info -->
            <div style="margin: 20px 0; text-align: center;">
                <p style="font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 6px;">Edited by</p>
                <p style="font-style: italic; font-size: 0.95rem; color: #bbb; margin: 0;">
                    Harsh Patel — <a href="mailto:harsh.patel.editing@gmail.com"
                        style="color: #3b82f6;">harsh.patel.editing@gmail.com</a>
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; padding: 24px 0;">
                <a href="https://justoneupload.com/review/techverse?fileId=docker-15min&title=Mastering%20Docker%20in%2015%20Minutes&scheduled=Jun%2012%2C%202025%2C%2006%3A00%20PM"
                    style="background-color: #22c55e; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
                    👀 Review Now
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

  `
}