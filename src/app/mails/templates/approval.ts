import { fetchWorkspaceMetadata } from "@/app/api/fetch/workspaces/route"
import { db } from "@/db"
import { UserTable, WorkspaceTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { eq } from "drizzle-orm"
import { SendMail } from ".."
import { JwtGenerate } from "@/app/api/lib/jwt"
import { convertDuration, convertDate } from "@/app/(pages)/(layoutContainers)/dashboard/components/VideoCard"

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
  if (!ws) return JOUError(400, "Workspace not found");

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
  <title>New Video Uploaded for Review</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0b0b;
      color: #fff;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .container {
      max-width: 640px;
      margin: 40px auto;
      background-color: #111;
      border: 1px solid #222;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.05);
    }

    .header {
      display: flex;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #222;
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 12px;
    }

    .channel-info h2 {
      margin: 0;
      color: #eee;
      font-size: 1.25rem;
    }

    .channel-info p {
      margin: 2px 0 0 0;
      color: #aaa;
      font-size: 0.9rem;
    }

    .content {
      padding: 24px 20px;
    }

    .greeting {
      font-size: 1.1rem;
      margin-bottom: 10px;
      color: #ccc;
    }

    .intro {
      color: #bbb;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .video-card {
      display: flex;
      background-color: #1a1a1a;
      border: 1px solid #333;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }

    .thumbnail {
      width: 160px;
      height: 90px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .video-info {
      padding: 12px;
      flex: 1;
    }

    .video-title {
      font-size: 1rem;
      font-weight: bold;
      margin-bottom: 6px;
      color: #fff;
    }

    .video-meta {
      font-size: 0.85rem;
      color: #bbb;
      margin-bottom: 6px;
      display:flex;
      align-items:center;
    }

    .badge {
      display: inline-block;
      background-color: #444;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: bold;
      color: #fff;
      margin-right: 8px;
      text-transform: capitalize;
    }

    .editor-info {
      margin-top: 12px;
      font-size: 0.9rem;
      color: #aaa;
    }

    .button-wrapper {
      text-align: center;
      padding: 28px 0 16px;
    }

    .btn {
      background-color: #fff;
      color: #000;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: bold;
      text-decoration: none;
      display: inline-block;
      transition: all 0.2s ease;
    }

    .btn:hover {
      background-color: #eaeaea;
    }

    .footer {
      padding: 16px 20px 36px;
      font-size: 0.8rem;
      color: #666;
      border-top: 1px solid #222;
      text-align: center;
      position: relative;
    }

    .logo {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 8px;
    }
      .logo img{
      width:60px;
      height:60px;
      opacity: 0.6;
      }

    @media (max-width: 600px) {
      .video-card {
        flex-direction: column;
        align-items: center;
      }

      .thumbnail {
        width: 100%;
        height: auto;
      }

      .video-info {
        text-align: center;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src=${workspace.avatar} alt="Avatar" class="avatar" />
      <div class="channel-info">
        <h2>${workspace.name}</h2>
        <p>${workspace.userHandle}</p>
      </div>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Hey ${youtuber.name},</div>

      <div class='intro'>
                Just a heads-up — your editor <strong>${editor.name}</strong> has uploaded a brand new video titled
                <strong>"${video.title}"</strong> to your workspace <strong>${workspace.name}</strong>
                <br /><br />
                It's neatly packaged, beautifully edited, and awaiting your final word.
                Whether you’re sipping your coffee or in between takes, now’s the perfect time to give it a watch and
                hit <strong>approve</strong> when ready
                <br /><br />
                As always, you're in control. You can review, reschedule or reject
            </div>

      <!-- Video Card -->
      <div class="video-card">
        <img src="http://localhost:3000/api/drive?type=image&id=${video.thumbnail}" alt="${video.title}" class="thumbnail" />
        <div class="video-info">
          <div class="video-title">${video.title}</div>
          <div class="video-meta">
            <span class="badge">${video.videoType}</span>
            Duration : ${convertDuration(video.duration)}
          </div>
          <div class="video-meta">
            ${video.willUploadAt ? `Publishing : ${convertDate(video.willUploadAt)}` : `Publishing once you approve`}
          </div>
        </div>
      </div>

      <!-- Editor Info -->
      <div style="margin: 20px 0; text-align: center;">
        <p style="font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 6px;">Edited by</p>
        <p style="font-style: italic; font-size: 0.95rem; color: #bbb; margin: 0;">
          ${editor.name} &mdash; ${editor.email}
        </p>
      </div>

      <!-- CTA Button -->
      <div class="button-wrapper">
        <a href="${generateReviewUrl(workspace, { title: video.title, fileId: video.fileId, willUploadAt: video.willUploadAt })}" class="btn">👀 Review Now</a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      You're receiving this email because you subscribed to updates from Awesome Channel.
      <div class="logo">
       <img src=${process.env.CLOUDINARY_LOGO} alt='JustOneUpload' />
      </div>
    </div>
  </div>
</body>

</html>

  `
}