[![Build Status](https://travis-ci.org/131/htmltar-to-pdf.svg?branch=master)](https://travis-ci.org/131/htmltar-to-pdf)
[![Coverage Status](https://coveralls.io/repos/github/131/htmltar-to-pdf/badge.svg?branch=master)](https://coveralls.io/github/131/htmltar-to-pdf?branch=master)
[![Version](https://img.shields.io/npm/v/htmltar-to-pdf.svg)](https://www.npmjs.com/package/htmltar-to-pdf)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Code style](https://img.shields.io/badge/code%2fstyle-ivs-green.svg)](https://www.npmjs.com/package/eslint-plugin-ivs)


# Motivation

[htmltar-to-pdf](https://github.com/131/htmltar-to-pdf) is a wrapper around phantomjs that convert a HTML payload (in a tarball) as a PDF file.

Using a simple tar as input makes the whole API simple & stable.

# API/usage

```
const html2pdf = require('htmltar-to-pdf');
const infile  = '/some/path/to/a/file.tar';

let output_path = await html2pdf(infile); //will capture (index.html in tar file)


//you wont make it any simplier...
console.log("Please find a fine PDF in", output_path);
```

## Configuration parameters & defaults values

```
  let opts = {
    paperFormat : 'A4',
    orientation : 'portrait',
    dpi         : 72,
    index       : 'index.html',
  };
```

# Credits
* [131 - auhor](https://github.com/131)
* [ariya's phantomjs](https://github.com/ariya/phantomjs)
