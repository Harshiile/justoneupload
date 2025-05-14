import { UserMail, VideoMail } from "./types"

export const NotifyMailTemplate = (video: VideoMail, editor: UserMail, userType: number): string => {
    if (userType != 0 && userType !== 1) return ``

    if (userType == 0) // Editor
        return `
        <!DOCTYPE html>
<html>

<head>
    <meta charset='UTF-8'>
    <title>Video Upload Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f7f7f7;
            padding: 20px;
            color: #333;
        }

        .card {
            background: #fff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #222;
            margin-bottom: 15px;
        }

        p {
            line-height: 1.5;
            margin: 10px 0;
        }

        .info {
            background: #f1f1f1;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            border-radius: 6px;
            background: #54de09e0;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
        }

        .btn:hover {
            background: #54de09ba;
        }

        .footer-note {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>

<body>

    <div class='card'>
        <h2>🎉 Your video has been uploaded!</h2>

        <p>Hi <strong>{{editor_name}}</strong>,</p>

        <p>Your edited video for the workspace <strong>'{{workspace_name}}'</strong> has been successfully uploaded to
            the linked YouTube channel using <strong>JustOneUpload (JOU)</strong>.</p>

        <div class='info'>
            <p><strong>Video Title:</strong> ${video.title}</p>
            <p><strong>Workspace:</strong> ${video.wsName}</p>
        </div>

        <a href='${video.link}' class='btn'>▶️ View Video</a>

        <p class='footer-note'>
            Thank you for using JustOneUpload , Happy editing!
        </p>
    </div>

</body>

</html>`

    else return `
    <!DOCTYPE html>
<html>

<head>
    <meta charset='UTF-8'>
    <title>Editor Video Upload Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f7f7f7;
            padding: 20px;
            color: #333;
        }

        .card {
            background: #fff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #222;
            margin-bottom: 15px;
        }

        p {
            line-height: 1.5;
            margin: 10px 0;
        }

        .info {
            background: #f1f1f1;
            padding: 12px;
            border-radius: 6px;
            margin-top: 15px;
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 20px;
            border-radius: 6px;
            background: #54de09e0;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
        }

        .btn:hover {
            background: #54de09ba;
        }

        .footer-note {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
            text-align: center;
        }
    </style>
</head>

<body>

    <div class='card'>
        <h2>🎉 Editor's video uploaded to YouTube</h2>

        <p>Hi <strong>{{youtuber_name}}</strong>,</p>

        <p>The video edited by <strong>{{editor_name}}</strong> for your workspace <strong>'{{workspace_name}}'</strong>
            has been successfully uploaded to your YouTube channel using <strong>JustOneUpload (JOU)</strong>.</p>

        <div class='info'>
            <p><strong>Video Title:</strong> ${video.title}</p>
            <p><strong>Editor:</strong> ${editor.name} (${editor.email})</p>
            <p><strong>Workspace:</strong> ${video.wsName}</p>
        </div>

        <a href='${video.link}' class='btn'>▶️ View Video</a>

        <p class='footer-note'>
            You can manage uploaded videos from your YouTube dashboard.<br>
            Thanks for using JustOneUpload !
        </p>
    </div>

</body>

</html>
`
}