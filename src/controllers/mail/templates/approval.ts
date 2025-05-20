import { eq } from "drizzle-orm"
import { db } from "../../../db"
import { UserTable, WorkspaceTable } from "../../../db/schema"
import { fetchWorkspaceMetadata } from "../../fetch/workspace"
import { JOUError } from "../../../lib/error"
import { JwtGenerate } from "../../../lib/jwt"
import { SendMail } from "../sendmail"

interface ApprovalInterface {
  title: string
  desc: string | null
  videoType: 'public' | 'private' | 'unlisted'
  duration: string
  isMadeForKids: boolean
  willUploadAt: Date | null
  editor: string
  fileId: string,
  workspace: string
  thumbnail: string | null
}

interface User {
  name: string | null
  email: string | null
}

export interface WorkspaceMail {
  id: string | null | undefined;
  name: string;
  avatar: string;
  userHandle: string | null;
}
export interface VideoMetaDataMail {
  title: string
  willUploadAt: Date | null
  fileId: string
}

export const SendApprovalMail = async (VideoData: ApprovalInterface) => {
  // I have wsId & editorId, need owner mail(youtuber mail), editor(name,gmail), workspace(name,avatar,userHandle)

  // Get Owner Mail
  const [editor] = await db
    .select({
      name: UserTable.name,
      email: UserTable.email
    })
    .from(UserTable)
    .where(eq(UserTable.id, VideoData.editor))
    .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1020`) })

  const [youtuber] = await db
    .select({
      name: UserTable.name,
      email: UserTable.email
    })
    .from(WorkspaceTable)
    .leftJoin(UserTable, eq(UserTable.id, WorkspaceTable.owner))
    .where(eq(WorkspaceTable.id, VideoData.workspace))
    .catch(_ => { throw new JOUError(400, `${process.env.SERVER_ERROR_MESSAGE} - 1021`) })


  const ws = await fetchWorkspaceMetadata(VideoData.workspace)

  const htmlText = ApprovalMailTemplate(VideoData, editor, ws)

  await SendMail('theharshiile@gmail.com', htmlText)
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
  return `${process.env.FRONTEND_URL}/review/${JwtGenerate(videoDetails)}`
}

const ApprovalMailTemplate = (VideoData: ApprovalInterface, editor: User, workspace: WorkspaceMail): string => {
  return `
    <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f6f9fc;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      background-color: #ffffff;
      width: 100%;
      max-width: 600px;
      margin: 30px auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background-color: #ff0000;
      color: #fff;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 20px;
    }
    .channel-avatar {
      border-radius: 50%;
      width: 60px;
      height: 60px;
    }
    .btn {
      display: inline-block;
      background-color: #28a745;
      color: #fff !important;
      padding: 12px 20px;
      text-align: center;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='header'>
      <h2>New Video Uploaded for Review</h2>
    </div>
    <div class='content'>

      <div class='section'>
        <h3>👨‍💻 Workspace Details</h3>
        <p><strong>Channel Name : </strong> ${workspace.name}</p>
        <p><strong>Handle : </strong> ${workspace.userHandle}</p>
        <img src=${workspace.avatar} alt='Channel Avatar' class='channel-avatar'>
      </div>

      <div class='section'>
        <h3>🧑 Editor Details</h3>
        <p><strong>Name : </strong>${editor.name}</p>
        <p><strong>Email : </strong> ${editor.email}</p>
      </div>

      <div class='section'>
        <h3>🧑 Video Details</h3>
        <p><strong>Name : </strong>${VideoData.title}</p>
        <p><strong>Duration : </strong>${VideoData.duration}</p>
        <p><strong>Duration : </strong>${VideoData.videoType}</p>
        <p><strong>Will Upload At : </strong>${VideoData.willUploadAt ? VideoData.willUploadAt : 'Immediate After Approval'}</p>
      </div>

      <div class='section' style='text-align: center;'>
        <a href=${generateReviewUrl(workspace, { title: VideoData.title, fileId: VideoData.fileId, willUploadAt: VideoData.willUploadAt })} class='btn'>Review Video</a>
      </div>

    </div>
    <div class='footer'>
      You are receiving this email because you're part of the workspace <strong>Harshil</strong>.
    </div>
  </div>
</body>
</html>
`
}





// editor : { name: 'Joe Carter', email: 'carterinesess@gmail.com' }
// youtuber : { name: 'Harshil', email: 'carterinesess@gmail.com' }
// channel : {
//   id: 'UCHZ0UZ7PTrabekn_r-owSZg',
//   name: 'Harshil',
//   description: '20 !',
//   avatar: 'https://yt3.ggpht.com/ddp99cPb_6PzTlZ9zrcUgBlB3hkvdRJxPyZwDeMV_MbYnMIFjVVFmih4P2N4omaXA3JaQwQ1=s800-c-k-c0x00ffffff-no-rj',
//   userHandle: '@harshile',
//   totalSubscribers: 0,
//   totalVideos: 1,
//   dateCreated: '2023-07-09T14:16:21.010993Z'
// }