import { JwtGenerate } from "@/app/api/utils/jwt"
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
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <title>Authorize Editor Access - JustOneUpload</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff;">
  <div style="margin: auto; background-color: #111111; border-radius: 12px; overflow: hidden; box-shadow: 0 0 10px rgba(255,255,255,0.05); width: 100%;">

    <!-- Header -->
    <div style="display: flex; align-items: center; padding: 20px; border-bottom: 1px solid #222;">
      <img src="https://yt3.googleusercontent.com/ytc/AOPolaR3y9Pp9Yc-kLPQvgGJ0KZGhBhZnDnn0msGHjDC=s176-c-k-c0x00ffffff-no-rj" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; margin-right: 12px;" />
      <div>
        <h2 style="margin: 0; color: #eee; font-size: 1.25rem;">TechVerse Edits</h2>
        <p style="margin: 2px 0 0 0; color: #aaa; font-size: 0.9rem;">@techverseofficial</p>
      </div>
    </div>

    <!-- Content -->
    <div style="padding: 24px 20px;">
      <p style="font-size: 1rem; color: #ccc;">
        <strong>Harsh Patel</strong>
        (<a href="mailto:harsh.patel.editing@gmail.com" style="color: #4ac1ff;">harsh.patel.editing@gmail.com</a>)
        has requested permission to join your workspace <strong>TechVerse Edits</strong> on <strong>JustOneUpload</strong>.
      </p>

      <p style="font-size: 0.95rem; color: #bbb; line-height: 1.6; margin-top: 12px;">
        By authorizing, you grant the editor permission to upload and schedule videos on your behalf via our platform — you remain in full control.
        <br /><br />
        If you recognize this request, click <strong>Authorize</strong> below. Otherwise, feel free to ignore this email.
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; padding: 30px 0 20px;">
        <a href="https://justoneupload.com/authorize?ws=techverse&editor=harsh.patel.editing@gmail.com&token=abc123"
          style="background-color: #22c55e; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-decoration: none; display: inline-block;">
          🔓 Authorize
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 20px 36px; font-size: 0.8rem; color: #666; border-top: 1px solid #222; text-align: center; position: relative;">
      If you didn’t expect this request, you can safely ignore it. This link will expire in 24 hours for your security.
      <div style="position: absolute; left: 50%; transform: translateX(-50%); bottom: 8px;">
        <img src="https://res.cloudinary.com/demo/image/upload/v1717956012/jou-logo.png" alt="JustOneUpload Logo" style="width: 60px; height: 60px; opacity: 0.6;" />
      </div>
    </div>
  </div>
</body>

</html>
    `
}