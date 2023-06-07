"use strict";

const html2pdf = require('.');
const fs = require('fs');

class foo {

  async run(input_path, format = 'pdf', output_file = undefined, width = null, height = null, size = null) {

    let stats = fs.statSync(input_path), src;
    if(!output_file)
      output_file = `out.${format}`;

    if(size && size.indexOf('x') !== -1)
      [width, height] = size.split("x");

    if(stats.isFile()) {
      console.log("Working as file");
      src = fs.createReadStream(input_path);
    }

    if(!src)
      throw `Invalid input type`;

    console.log("Processing %s", {input_path, format, width, height});


    let body = await html2pdf(input_path, format, {
      "index" : "index.html"
    });
    fs.writeFileSync(output_file, body);
    console.log("All done");
  }

}


module.exports = foo;
