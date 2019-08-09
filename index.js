"use strict";

const os      = require('os');
const fs      = require('fs');
const http    = require('http');

const mountTar  = require('tar-serve-http');
const tmppath   = require('nyks/fs/tmppath');

const phantomjs = require(os.platform() == 'win32' ? 'phantomjs-win-x86' : 'phantomjs');

//keep this inline (for browserify), beware nyc instrumentation might break JS inlining (function).toString()

var rasterize     = `
  var system = require('system');
  var page = require('webpage').create();

  var timeout     = 10 * 1000;
  var source_url  = system.args[1];
  var output_path = system.args[2];
  var paperFormat = system.args[3] || "A4";
  var orientation = system.args[4] || "portrait";
  var dpi         = system.args[5] || 72;

  page.onResourceError = function(resourceError) {
    console.warn("Warning", resourceError.errorString, resourceError.url);
  };

  page.paperSize = { format: paperFormat, orientation: orientation, margin: '0cm' };

  page.open(source_url, function (status) {
    if (status !== 'success') {
      console.error('Phantomjs> unable to load', source_path);
      phantom.exit(1);
    }
    window.setTimeout(phantom.exit.bind(null, 1), timeout);

    window.setTimeout(function () {
      page.dpi = dpi;
      page.render(output_path, {format: 'pdf', quality: '80'});
      phantom.exit();
    }, 200);

  });
`;

var HTML2PDF = async function(tar_path, options) {

  let opts = {
    paperFormat : 'A4',
    orientation : 'portrait',
    dpi         : 72,
    index       : 'index.html',
    ...options
  };

  var output_path = tmppath('pdf');
  var js_path     = tmppath('js');

  let route = mountTar(tar_path);
  let server = http.createServer(route);
  let port = await new Promise((resolve) => {
    server.listen(() => resolve(server.address().port));
  });
  console.log('Server is ready and listening on port', port);

  fs.writeFileSync(js_path, rasterize);

  let source_url = `http://127.0.0.1:${port}/${opts.index}`;

  var phantom_args = [js_path, source_url, output_path, opts.paperFormat, opts.orientation, opts.dpi];

  await new Promise((resolve, reject) => {
    phantomjs({args : phantom_args}, function(err, code) {
      fs.unlinkSync(js_path);
      if(err || code != 0)
        return reject(err || 'Invalid exit code');
      resolve();
    });
  });

  server.close();
  route.close();
  return output_path;
};


module.exports = HTML2PDF;

