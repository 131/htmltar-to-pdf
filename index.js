"use strict";

const http      = require('http');

const mountTar  = require('tar-serve-http');
const puppeteer = require('puppeteer');

const timeout   = require('nyks/async/timeout');

var HTML2PDF = async function(source_path, options = {}) {

  options = {
    format         : 'A4',
    index          : 'index.html',
    waitForDom     : null,
    waitForEvent   : null,
    waitForTimeout : 5000,

    pageBodyAnchor : null, //set to body
    footerFile     : undefined,
    headerFile     : undefined,
    ...options
  };

  let source  = mountTar(source_path, {index : options.index});

  let server = http.createServer(source);
  let port   = await new Promise((resolve) => {
    server.listen(() => resolve(server.address().port));
  });

  console.error('Server is ready and listening on port', port, options);

  let source_url  = `http://127.0.0.1:${port}/${options.index}`;

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
      /* istanbul ignore next */
      await Promise.race([
        page.evaluate((options) => new Promise((resolve) => document.addEventListener(options.waitForEvent, resolve)), options),
        timeout(options.waitForTimeout)
      ]);
    }

    let pdfOpts = {
      printBackground : true,
      format          : options.format,
      landscape       : !!(options.orientation == 'landscape'),
    };


    /*
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
    });
    */


    let processPaginator = options.footerFile !== undefined || options.headerFile !== undefined || options.pageBodyAnchor;

    if(processPaginator) {
      let footerTemplate = "", headerTemplate = "", pageBodyAnchor = "body";
      if(options.pageBodyAnchor)
        pageBodyAnchor = options.pageBodyAnchor;
      if(options.headerFile)
        headerTemplate  = String(await source.retrieve(options.headerFile));
      if(options.footerFile)
        footerTemplate  = String(await source.retrieve(options.footerFile));
      await paginator(page, {headerTemplate, footerTemplate, pageBodyAnchor});
    }

    return await page.pdf(pdfOpts);

  } finally {
    await browser.close();

    server.close();
    source.close();
  }

};

const paginator = async function(page, {headerTemplate, footerTemplate, pageBodyAnchor}) {
  const paginatorStyle = `
    #paginator,   #paginator > thead,   #paginator > thead > tr,   #paginator > thead > tr > td,   #paginator > tfoot,   #paginator > tfoot > tr,   #paginator > tfoot > tr > td,   #paginator > tbody,   #paginator > tbody > tr,   #paginator > tbody > tr > td {
      border:0;
      padding:0;
      margin:0;
      border-spacing:0;
      width:100%;
    }

    #paginator #page-header {
      position: sticky;
      width:100%;
      vertical-align: top!important;
    }
    #paginator #page-footer {
      position: sticky;
      vertical-align: top!important;
      width:100%;
    }
  `;

  await page.evaluate(({paginatorStyle, pageBodyAnchor, headerTemplate, footerTemplate}) => {

    let n = (n, attrs = {}) => {
      let e = document.createElement(n);
      for(let [k, v] of Object.entries(attrs))
        e[k] = v;

      e.feed = (a) => (e.appendChild(a), e);
      return e;
    };

    let root = n("table", {id : "paginator"});
    root.appendChild(
      n("thead").feed(
        n("tr").feed(
          n("td", {id : "page-header", innerHTML : headerTemplate})
        )
      )
    );


    root.appendChild(
      n("tfoot").feed(
        n("tr").feed(
          n("td", {id : "page-footer", innerHTML : footerTemplate})
        )
      )
    );

    let body = n("td");
    root.appendChild(
      n("tbody").feed(
        n("tr").feed(body)
      )
    );

    let style = n("style", {innerText : paginatorStyle});

    let anchor = document.querySelector(pageBodyAnchor);
    let l = anchor.childNodes.length;
    for(var i = l; i > 0; i--)
      body.appendChild(anchor.childNodes[0]);

    document.body.appendChild(style);
    anchor.appendChild(root);

    //console.log(document.body.innerHTML);
  }, {paginatorStyle, pageBodyAnchor, headerTemplate, footerTemplate});
};




module.exports = HTML2PDF;
