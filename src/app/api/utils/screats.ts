import { google } from "googleapis";

// Drive - Service Account
export const drive = google.drive({
    version: 'v3', auth: new google.auth.GoogleAuth({
        keyFile: process.env.DRIVE_SERVICE_ACCOUNT_CREDENTIALS,
        scopes: ['https://www.googleapis.com/auth/drive']
    })
});

// OAuthClient
export const oauth2Client = new google.auth.OAuth2({
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/youtube-info'
})

