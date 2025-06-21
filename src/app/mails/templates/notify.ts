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
    editorId: string
}

export interface WorkSpace {
    name: string,
    userHandle: string,
    avatar: string
}

export const SendNotifyMail = async (video: VideoNofityMail, workspaceId: string) => {
    const ws = await fetchWorkspaceMetadata(workspaceId, null)
    const workspace: WorkSpace = {
        avatar: ws?.avatar!,
        name: ws?.name!,
        userHandle: ws?.userHandle!
    }

    const editor = await fetchEditor(video.editorId)
    const youtuber = await fetchYoutuber(workspaceId)

    const htmlEditorText = NotifyMailTemplate(workspace, video, editor.name)
    const htmlYoutuberText = NotifyMailTemplate(workspace, video, youtuber.name!)

    await SendMail(youtuber.email, '🎉 Success! Your Video Is Available on YouTube', htmlYoutuberText)
    await SendMail(editor.email, '🎉 Success! Your Video Is Available on YouTube', htmlEditorText)
}
const NotifyMailTemplate = (workspace: WorkSpace, video: VideoNofityMail, name: string) => {
    return `
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Upload Confirmation - JustOneUpload</title>
    </head>
    <body style="margin:0;padding:0;background-color:#fff;color:#fff;font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="margin:auto;background-color:#111;border:1px solid #222;border-radius:12px;overflow:hidden;width:100%;">
        
        <!-- Header -->
        <div style="display:flex;align-items:center;padding:20px;border-bottom:1px solid #222;">
          <img src="${workspace.avatar}" alt="${workspace.name}" style="width:48px;height:48px;border-radius:50%;margin-right:12px;" />
          <div>
            <h2 style="margin:0;color:#eee;font-size:1.25rem;">${workspace.name}</h2>
            <p style="margin:2px 0 0 0;color:#aaa;font-size:0.9rem;">${workspace.userHandle}</p>
          </div>
        </div>
  
        <!-- Body -->
        <div style="padding:24px 20px;">
          <div style="color:#ccc;font-size:0.95rem;line-height:1.6;margin-bottom:20px;">
            Hello <strong>${name}</strong>,<br /><br />
            We’re pleased to inform you that the following video has been successfully uploaded to your YouTube channel via <strong>JustOneUpload</strong>.<br /><br />
            You can now review it live on YouTube and share it with your audience.
          </div>
  
          <!-- Video Card -->
          <div style="display: flex; background-color: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 12px; margin-bottom: 20px; gap: 16px; align-items: center; flex-wrap: wrap;">
            <img src="${video.thumbnail}" alt="${video.title}" style="width: 160px; height: 90px; object-fit: cover; border-radius: 8px; flex-shrink: 0;" />
            <div style="flex: 1; min-width: 180px; padding-left:1rem;">
              <div style="font-size: 1.05rem; font-weight: 600; color: #fff; margin-bottom: 4px;">
                ${video.title}
              </div>
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 0.85rem; color: #ccc; margin-bottom: 6px;">
                <span style="background-color: #4ac1ff; color: #000; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: bold; line-height: 1; text-transform: capitalize;">
                  ${video.videoType}
                </span>
                <span style="color: #aaa; margin:0 0 0 10px;"> ${convertDuration(video.duration)}</span>
              </div>
              <div style="font-size: 0.85rem; color: #aaa;">
                Published on : ${new Date(video.publishedAt).toDateString()}
              </div>
            </div>
          </div>
  
          <!-- CTA Button -->
          <div style="text-align:center;padding:10px 0 30px;">
            <a href="https://www.youtube.com/watch?v=${video.id}" target="_blank" style="background-color:#4ac1ff;color:#000;padding:12px 24px;border-radius:8px;font-weight:bold;text-decoration:none;display:inline-block;margin:8px;">
              ▶ Watch on YouTube
            </a>
          </div>
        </div>
  
        <!-- Footer -->
        <div style="padding:16px 10px 36px;font-size:0.8rem;color:#666;border-top:1px solid #222;text-align:center;">
          If this disconnection was unintentional or temporary, you can safely reconnect anytime using the link above.<br />
          If you no longer use JustOneUpload, you may ignore this message.<br />
          <div style="margin-top:20px;">
            <img src="${process.env.CLOUDINARY_LOGO}" alt="JustOneUpload" style="width:60px;height:60px;opacity:0.6;" />
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
};
