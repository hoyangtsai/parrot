
const { checkGoogleSheetLink, googleSheetsSync } = require('./actions');
const { chain } = require('bottender');

module.exports = async function App(context) {
  if (context.event.isText) {
    const textMessage = context.event.text;
    if (textMessage.startsWith('gs:')) {
      // const liffUrl = `https://liff.line.me/${process.env.LINE_LIFF_ID}`;
      // await context.sendText(liffUrl);
      return chain([checkGoogleSheetLink, googleSheetsSync]);
    } else {
      await context.sendText(`${textMessage}`);
    }
  } else {
    await context.sendText('我只會重複文字訊息');
  }
};
