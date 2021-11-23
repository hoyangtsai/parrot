const bodyParser = require('body-parser');
const express = require('express');
const { bottender } = require('bottender');
const path = require('path');
const { authUrl, saveToken } = require('./src/googleOauth');
const ejs = require('ejs');

const app = bottender({
  dev: process.env.NODE_ENV !== 'production',
});

const port = Number(process.env.PORT) || 5000;

// the request handler of the bottender app
const handle = app.getRequestHandler();

function getParams(req) {
  const state = req.query['liff.state'];
  if (state) {
    const array = state.split('?');
    if (array.length == 2) {
      return querystring.parse(array[1]);
    }
  }

  return req.query || {};
}

app.prepare().then(() => {
  const server = express();

  const verify = (req, _, buf) => {
    req.rawBody = buf.toString();
  };
  server.use(bodyParser.json({ verify }));
  server.use(bodyParser.urlencoded({ extended: false, verify }));

  // your custom route
  server.get('/api', (req, res) => {
    res.json({ ok: true });
  });

  server.get('/send-id', (req, res) => {
    res.json({ id: process.env.LINE_LIFF_ID });
  });

  // https://bottender.js.org/docs/channel-line-liff
  server.get('/liff', (req, res) => {
    const filename = path.join(`${__dirname}/src/liff/login.html`);
    // res.sendFile(filename);
    authUrl().then((url) => {
      ejs.renderFile(filename, { url }, {}, function (err, str) {
        res.send(str);
      });
    });
  });

  server.all('/googleRedirect', async (req, res) => {
    const filename = path.join(__dirname + `/src/pages/googleRedirect.html`);
    const code = req.query.code;
    await saveToken(code);
    ejs.renderFile(filename, {}, {}, function (err, str) {
      res.send(str);
    });
  });

  // route for webhook request
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
