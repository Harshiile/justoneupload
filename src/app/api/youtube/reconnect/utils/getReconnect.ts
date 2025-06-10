import { oauth2Client } from "../../../utils/screats.ts"

export const getReconnectUrl = (workspaceEmail: string) => {
    const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
    ]

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes,
        login_hint: workspaceEmail
    })
}