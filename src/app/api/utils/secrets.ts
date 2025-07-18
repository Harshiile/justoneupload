import { google } from "googleapis";

// Drive - Service Account
export const drive = google.drive({
  version: "v3",
  auth: new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/drive"],
    credentials: JSON.parse(process.env.JOU_DRIVE_SERVICE_ACCOUNT_CREDENTIALS!),
  }),
});

// OAuthClient
export const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  redirectUri: "http://localhost:3000/youtube-info",
});
