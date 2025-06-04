import { JwtGenerate } from "@/app/api/lib/jwt"
import { db } from "@/db"
import { WorkspaceTable } from "@/db/schema"
import { JOUError } from "@/lib/error"
import { eq } from "drizzle-orm"
import { fetchYoutuber } from "./approval"
import { SendMail } from ".."

export interface AuthorizeInterface {
    editorId: string
    editorMail: string
    editorName: string
    wsId: string
    wsName: string
    wsAvatar: string
    wsUserHandle: string
}

const generateAuthorizeURL = (data: AuthorizeInterface) => {
    return `${process.env.PRODUCT_URL}/authorize-editor/${JwtGenerate(data)}`
}

export const SendAuthorizeMail = async (data: AuthorizeInterface) => {
    const htmlText = AuthorizeMailTemplate(data);
    const youtuber = await fetchYoutuber(data.wsId)

    await SendMail(youtuber.email, `🚀 ${data.editorName} Is Ready to Collaborate — Grant Access Now`, htmlText)
}

const AuthorizeMailTemplate = (data: AuthorizeInterface): string => {

    return `
 <!DOCTYPE html>
<html lang='en'>

<head>
    <meta charset='UTF-8' />
    <title>Authorize Editor Access - JustOneUpload</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #000;
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .container {
            max-width: 640px;
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

        .button-wrapper {
            text-align: center;
            padding: 10px 0 30px;
        }

        .btn {
            background-color: #fff;
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
            background-color: #eaeaea;
        }

        .footer {
            padding: 16px 20px;
            font-size: 0.8rem;
            color: #666;
            border-top: 1px solid #222;
            text-align: center;
            position: relative;
        }

        .logo {
            margin-top: 20px;
        }

        .logo img {
        width:60px;
            height: 60px;
            opacity: 0.6;
        }

        .tagline {
            text-align: center;
            font-size: 1rem;
            font-weight: 600;
            color: #4ac1ff;
            margin-bottom: 10px;
            font-style: italic;
        }
    </style>
</head>

<body>
    <div class='container'>
        <!-- Header -->
        <div class='header'>
            <img src='${data.wsAvatar}' alt='Avatar' class='avatar' />
            <div class='channel-info'>
                <h2>${data.wsName}</h2>
                <p>${data.wsUserHandle}</p>
            </div>
        </div>

        <!-- Content -->
        <div class='content'>
            <div class='intro'>
                <strong>${data.editorName}</strong> (<a style='color: #4ac1ff;'
                    href='mailto:${data.editorName}'>${data.editorMail}</a>)
                has requested permission to join your workspace <strong>${data.wsName}</strong> on
                <strong>JustOneUpload</strong>
                <br /><br />
                By authorizing, you grant the editor the ability to upload and schedule videos on your channel through
                our platform, while maintaining full control over your content
                <br /><br />
                If you trust this request, please click the <strong>Authorize</strong> button below to proceed.
                Otherwise, you may safely ignore this email
            </div>

            <!-- CTA Button -->
            <div class='button-wrapper'>
                <a href=${generateAuthorizeURL(data)} class='btn'>🔓 Authorize</a>
            </div>
        </div>

        <!-- Footer -->
        <div class='footer'>
            If you did not expect this request, please disregard this message.<br />
            This authorization link will expire in 24 hours for your security
            <div class='logo'>
                <img src=${process.env.CLOUDINARY_LOGO} alt='JustOneUpload' />
            </div>
        </div>
    </div>
</body>

</html>

    `
}