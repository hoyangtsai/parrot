const fs = require('fs-extra');
const { google } = require('googleapis');
const path = require('path');

const tokenPath = path.resolve(__dirname, 'token.json');

let oAuth2ClientCache = null;
async function getOAuth2Client() {
  if (oAuth2ClientCache == null) {
    // Load client secrets from a local file.
    const content = fs.readFileSync(
      path.resolve(__dirname, 'client_secret.json')
    );
    const credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris } = credentials.web;
    oAuth2ClientCache = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );
  }
  return oAuth2ClientCache;
}

async function getToken() {
  // Check if we have previously stored a token.
  if (fs.existsSync(tokenPath)) {
    const token = await fs.readFileSync(tokenPath);
    return JSON.parse(token).tokens;
  }
  return null;
}

async function authUrl() {
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  const client = await getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

async function saveToken(code) {
  const client = await getOAuth2Client();
  const token = await client.getToken(code);
  await fs.writeFile(tokenPath, JSON.stringify(token));
  return token;
}

async function getAuth() {
  const token = await getToken();
  const oauth2client = await getOAuth2Client();
  oauth2client.setCredentials(token);
  return oauth2client;
}

module.exports = {
  authUrl,
  saveToken,
  getToken,
  getAuth,
};
