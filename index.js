"use strict";

const http      = require('http');

const mountTar  = require('tar-serve-http');
const puppeteer = require('puppeteer');

const tmppath   = require('nyks/fs/tmppath');
const timeout   = require('nyks/async/timeout');

var HTML2PDF = async function(tar_path, options) {

  options = {
    format         : 'A4',
    index          : 'index.html',
    waitForDom     : null,
    waitForEvent   : null,
    waitForTimeout : 5000,
    ...options
  };

  let route  = mountTar(tar_path);
  let server = http.createServer(route);
  let port   = await new Promise((resolve) => {
    server.listen(() => resolve(server.address().port));
  });

  console.log('Server is ready and listening on port', port);

  let source_url  = `http://127.0.0.1:${port}/${options.index}`;
  let output_path = tmppath('pdf');

  let browser     = await puppeteer.launch({args : ['--no-sandbox', '--disable-setuid-sandbox']});

  try {
    let page        = await browser.newPage();

    page.on('error', function(err) {
      console.log('an error occured, the page might have crashed !', err);
    });

    await page.goto(source_url);

    if(options.waitForDom)
      await Promise.race([page.waitForSelector(options.waitForDom), timeout(options.waitForTimeout)]);

    if(options.waitForEvent) {
      await Promise.race([
        page.evaluate((options) => new Promise((resolve) => document.addEventListener(options.waitForEvent, resolve)), options),
        timeout(options.waitForTimeout)
      ]);
    }

    await page.pdf({
      path            : output_path,
      printBackground : true,
      format          : options.format,
      landscape       : !!(options.orientation == 'landscape')
    });
    return output_path;

  } finally {
    await browser.close();

    server.close();
    route.close();
  }

};

module.exports = HTML2PDF;
