const fs = require('fs-extra');
const { google } = require('googleapis');
const { getAuth } = require('./googleOauth');
const path = require('path');

const sheetIdPath = path.resolve(__dirname, 'sheetId.json');

async function getSheets() {
  const auth = await getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

async function getOrCreateSheetId(sheets) {
  if (!sheets) {
    return null;
  }
  // get cache
  if (fs.existsSync(sheetIdPath)) {
    const sheetId = fs.readFileSync(sheetIdPath);
    return sheetId;
  }

  // create sheet
  const sheet = await sheets.spreadsheets.create({
    resource: {
      properties: {
        title: 'google sheets bottender demo',
      },
    },
    fields: 'spreadsheetId',
  });
  const spreadsheetId = sheet.data.spreadsheetId;

  // save to cache
  await fs.writeFile(sheetIdPath, spreadsheetId);
  return spreadsheetId;
}

async function appendToSheet(row) {
  try {
    const sheets = await getSheets();
    const spreadsheetId = '' + (await getOrCreateSheetId(sheets));
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:A',
      valueInputOption: 'USER_ENTERED',
      resource: {
        majorDimension: 'ROWS',
        values: [row],
      },
    });
  } catch (error) {
    console.log('append error:');
    console.log(error);
  }
}

module.exports = {
  appendToSheet,
};
