import { UserMail, VideoMail } from "./types"

export const ApprovalMailTemplate = (video: VideoMail, editor: UserMail): string => {
    return `
    <!DOCTYPE html>
<html>

<head>
    <meta charset='UTF-8'>
    <title>Video Review Request - JustOneUpload</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f7f7f7;
            padding: 20px;
            color: #333;
        }

        .card {
            background: #ffffff;
            border-radius: 10px;
            padding: 20px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #222;
            margin-bottom: 10px;
        }

        .info,
        .video-details {
            margin: 15px 0;
            background: #f1f1f1;
            padding: 12px;
            border-radius: 6px;
        }

        p {
            line-height: 1.4;
            margin: 6px 0;
        }

        .video-thumbnail {
            text-align: center;
            margin-top: 15px;
        }

        .video-thumbnail img {
            max-width: 100%;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }

        .btn {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 50px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: background 0.3s ease;
            text-align: center;
        }

        .approve {
            background-color: #28a745;
            color: white;
        }

        .approve:hover {
            background-color: #218838;
        }

        .reject {
            background-color: #dc3545;
            color: white;
        }

        .reject:hover {
            background-color: #c82333;
        }

        .button-group {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
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
        <h2>Video Review Request</h2>

        <p><strong>Workspace:</strong> ${video.wsName}</p>
        <p><strong>Uploaded by:</strong> ${editor.name} (${editor.email})</p>

        <div class='video-details'>
            <p><strong>Video Title:</strong> ${video.title}</p>
        </div>

        <div class='video-thumbnail'>
            <img src='${video.thumbnail}' alt='Video Thumbnail'>
        </div>

        <div class='info'>
            <p>The above video has been uploaded by <strong>${editor.name}</strong> for your YouTube channel using
                <strong>JustOneUpload</strong></p>
            <p>Please review and approve or reject this video for upload</p>
        </div>

        <div class='button-group'>
            <a href='{{approve_url}}' class='btn approve'>✅ Approve Video</a>
            <a href='{{reject_url}}' class='btn reject'>❌ Reject Video</a>
        </div>

        <p class='footer-note'>
            If you do not recognize this upload, you can safely ignore this email<br>
            This request will expire in 24 hours
        </p>
    </div>

</body>

</html>`
}