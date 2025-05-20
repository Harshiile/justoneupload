import { JwtGenerate } from "../../../lib/jwt"
import { SendMail } from "../sendmail"

export interface AuthorizeInterface {
    editorId: string
    editorMail: string
    editorName: string
    wsId: string
    wsName: string
    wsAvatar: string
    wsUserHandle: string
}

const generateAuthorizeURL = (data: AuthorizeInterface, approve: boolean) => {
    return `${process.env.FRONTEND_URL}/authorize-editor/${JwtGenerate({
        data,
        approve
    })}`
}

export const SendAuthorizeMail = async (data: AuthorizeInterface) => {
    const htmlText = AuthorizeMailTemplate(data);

    await SendMail('theharshiile@gmail.com', htmlText)
}

export const AuthorizeMailTemplate = (data: AuthorizeInterface): string => {

    const approveUrl = generateAuthorizeURL(data, true)
    const rejectUrl = generateAuthorizeURL(data, false)

    return `
    <!DOCTYPE html>
<html>

<head>
    <meta charset='UTF-8'>
    <title>Editor Authorization Request - JustOneUpload</title>
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
            max-width: 500px;
            margin: auto;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }

        h2 {
            color: #222;
            margin-bottom: 10px;
        }

        .info {
            margin: 15px 0;
            background: #f1f1f1;
            padding: 10px;
            border-radius: 6px;
        }

        p {
            line-height: 1.4;
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
        <h2>Editor Authorization Request</h2>

        <p><strong>Workspace:</strong> ${data.wsName}</p>
        <p><strong>Requested by:</strong> ${data.editorName} (${data.editorMail})</p>

        <div class='info'>
            <p>This editor is requesting permission to upload videos to your YouTube channel via <strong>JustOneUpload</strong>.</p>
            <p>Please confirm if you trust this person and want to authorize their uploads.</p>
        </div>

        <div class='button-group'>
            <a href=${approveUrl} class='btn approve'>✅ Approve Editor</a>
            <a href=${rejectUrl} class='btn reject'>❌ Reject Editor</a>
        </div>

        <p class='footer-note'>
            If you do not recognize this request, you can safely ignore this email.<br>
            This request will expire in 24 hours.
        </p>
    </div>

</body>

</html>
    `
}