import { fetchEditor, fetchYoutuber } from "./approval.ts"
import { SendMail } from "../index.ts"
import { Duration } from 'luxon'
import { fetchWorkspaceMetadata } from "../../api/fetch/workspaces/utils/index.ts";

export const convertDuration = (duration: string) => {
    let formattedDuration = ' ';
    const dur = Duration.fromISO(duration);
    if (dur.hours > 0) formattedDuration += `${dur.hours < 10 ? '0' + dur.hours.toString() : dur.hours.toString()}:`
    if (dur.minutes > 0) formattedDuration += `${dur.minutes < 10 ? '0' + dur.minutes.toString() : dur.minutes.toString()}:`
    if (dur.seconds > 0) formattedDuration += `${dur.seconds < 10 ? '0' + dur.seconds.toString() : dur.seconds.toString()}`
    return formattedDuration
}
export const convertDate = (date: string) => {
    const dateD = new Date(Number(date))
    return `${dateD.toDateString()} - ${dateD.toLocaleTimeString()}`
}

// to - editor & youtuber name
export interface VideoNofityMail {
    thumbnail: string
    title: string
    publishedAt: string
    videoType: string
    duration: string
    id: string
    uploadingStatus: string
    editorId: string
}
interface WorkspaceMail {
    avatar: string,
    name: string,
    handle: string
}
export const SendNotifyMail = async (video: VideoNofityMail, workspaceId: string) => {
    const ws = await fetchWorkspaceMetadata(workspaceId, null)
    const workspace: WorkspaceMail = {
        avatar: ws?.avatar!,
        name: ws?.name!,
        handle: ws?.userHandle!
    }

    const editor = await fetchEditor(video.editorId)
    const youtuber = await fetchYoutuber(workspaceId)

    const htmlEditorText = NotifyMailTemplate(workspace, video, editor.name)
    const htmlYoutuberText = NotifyMailTemplate(workspace, video, youtuber.name!)

    await SendMail(youtuber.email, '🎉 Success! Your Video Is Available on YouTube', htmlYoutuberText)
    await SendMail(editor.email, '🎉 Success! Your Video Is Available on YouTube', htmlEditorText)
}
const NotifyMailTemplate = (workspace: WorkspaceMail, video: VideoNofityMail, name: String) => {
    return `
    <html lang='en'>
<head>
  <meta charset='UTF-8' />
  <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #000;
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .container {
            max-width: 60vw;
            margin: auto;
            background-color: #111;
            border: 1px solid #222;
            border-radius: 12px;
            overflow: hidden;
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
            color: #aaa;
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

        .intro {
            color: #ccc;
            font-size: 0.95rem;
            line-height: 1.6;
            margin-bottom: 20px;
        }

        .video-card {
            display: flex;
            gap: 16px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            overflow: hidden;
            padding: 16px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .video-card:hover {
            transform: scale(1.015);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .thumbnail {
            width: 160px;
            height: 90px;
            object-fit: cover;
            border-radius: 8px;
            transition: transform 0.3s ease;
        }

        .video-card:hover .thumbnail {
            transform: scale(1.05);
        }

        .video-info {
            display: flex;
            flex-direction: column;
            justify-content: center;
            color: #f0f0f0;
        }

        .video-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: #fff;
        }

        .video-meta {
            font-size: 0.9rem;
            color: #ccc;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .badge {
            background-color: #4ac1ff;
            color: #000;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: bold;
        }

        .duration {
            color: #aaa;
        }

        .button-wrapper {
            text-align: center;
            padding: 10px 0 30px;
        }

        .btn {
            background-color: #4ac1ff;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            margin: 8px;
            transition: all 0.2s ease;
        }

        .btn:hover {
            background-color: #71d5ff;
        }

        .footer {
            padding: 16px 20px;
            font-size: 0.8rem;
            color: #666;
            border-top: 1px solid #222;
            text-align: center;
        }

        .logo {
            margin-top: 20px;
        }

        .logo img {
        width:60px;
            height: 60px;
            opacity: 0.6;
        }
  </style>
</head>

<body>
  <div class='container'>
    <!-- Header -->
    <div class='header'>
      <img src='${workspace.avatar}' alt=${workspace.name} class='avatar' />
      <div class='channel-info'>
        <h2>${workspace.name}</h2>
        <p>${workspace.handle}</p>
      </div>
    </div>

    <!-- Content -->
    <div class='content'>
      <div class='intro'>
        Hello <strong>${name}</strong>,<br /><br />
        We’re pleased to inform you that the following video has been successfully uploaded to your YouTube channel via <strong>JustOneUpload</strong>.
        <br /><br />
        You can now review it live on YouTube and share it with your audience.
      </div>

      <!-- Video Card -->
      <div class="video-card">
  <img src="${video.thumbnail}" alt="${video.title}" class="thumbnail" />
  <div class="video-info">
    <div class="video-title">${video.title}</div>
    <div class="video-meta">
      <span class="badge">${video.videoType}</span>
      <span class="duration">⏱ ${convertDuration(video.duration)}</span>
    </div>
    <div class="video-meta">
      📅 Published on: ${new Date(video.publishedAt).toDateString()}
    </div>
  </div>
</div>


      </div>
      <!-- CTA Button -->
      <div class='button-wrapper'>
        <a href='https://www.youtube.com/watch?v=${video.id}' class='btn' target='_blank'>▶ Watch on YouTube</a>
      </div>

    <!-- Footer -->
    <div class='footer'>
      This message confirms a successful upload through your JustOneUpload workspace.<br />
      If you were not expecting this activity, please review your workspace permissions.
      <div class='logo'>
        <img src=${process.env.CLOUDINARY_LOGO} alt='JustOneUpload' />
      </div>
    </div>
  </div>
</body>
</html>
    `
}