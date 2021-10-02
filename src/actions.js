const { getToken } = require('./googleOauth');
const { appendToSheet } = require('./googleSheets');

async function checkGoogleSheetLink(context, { next }) {
  const token = await getToken();
  if (token == null) {
    return askAuthCode;
  }
  return next;
}

async function askAuthCode(context) {
  const url = `https://liff.line.me/${process.env.LINE_LIFF_ID}/settings`;
  const altText = '請點擊下方連結啟用 Google Sheet 訊息同步功能';
  await context.sendFlex(altText, {
    type: 'bubble',
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          weight: 'bold',
          size: 'md',
          text: '請點擊下方連結啟用 Google Sheet 訊息同步功能',
          wrap: true,
        },
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '啟用 Google Sheets 訊息同步',
            uri: url,
          },
          margin: 'md',
        },
      ],
    },
  });
}

async function googleSheetsSync(context) {
  try {
    let appendText = context.event.text;
    appendText = appendText.replace(/^gs:/i, '');
    appendToSheet([appendText]);
  } catch (error) {
    console.log('append error:');
    console.log(error);
  }
}

module.exports = {
  checkGoogleSheetLink,
  googleSheetsSync,
};
