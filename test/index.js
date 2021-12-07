"use strict";

const expect  = require('expect.js');
const fs      = require('fs');

const html2pdf = require('..');

const infile  = __dirname + '/html_moving_rect.tar';

describe("Initial test suite", function () {

  this.timeout(60 * 1000);

  it("should work with a dummy test", async () => {

    let output_path = await html2pdf(infile, {
      "index" : "test.html"
    });
    expect(output_path).to.be.a('string');
    expect(fs.existsSync(output_path)).to.be.ok();

    fs.renameSync(output_path, output_path = `${output_path}.keep.pdf`);
    console.log("Pdf has been generated in %s", output_path);
  });



  it("should wait for DOM", async () => {

    let output_path = await html2pdf(infile, {
      "index"    : "test.html",
      waitForDom : "#spantrigger",

    });
    expect(output_path).to.be.a('string');
    expect(fs.existsSync(output_path)).to.be.ok();

    fs.renameSync(output_path, output_path = `${output_path}.keep.pdf`);
    console.log("Pdf has been generated in %s", output_path);
  });


  it("should wait for Event", async () => {

    let output_path = await html2pdf(infile, {
      "index"      : "test.html",
      waitForEvent : "PDFREADY",
    });
    expect(output_path).to.be.a('string');
    expect(fs.existsSync(output_path)).to.be.ok();

    fs.renameSync(output_path, output_path = `${output_path}.keep.pdf`);
    console.log("Pdf has been generated in %s", output_path);
  });


});
