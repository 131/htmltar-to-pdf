"use strict";

const expect  = require('expect.js');
const fs      = require('fs');

const html2pdf = require('..');


describe("Initial test suite", function () {

  this.timeout(60 * 1000);

  const source  = __dirname + '/html_moving_rect.tar';

  it("should work with a dummy test (png)", async () => {
    let output_path = source + ".png";

    let body = await html2pdf(source, "png", {
      "index" : "test.html"
    });
    fs.writeFileSync(output_path, body);

    expect(fs.existsSync(output_path)).to.be.ok();
    console.log("Pdf has been generated in %s", output_path);
  });



  it("should work with a dummy test", async () => {
    let output_path = source + ".pdf";

    let body = await html2pdf(source, "pdf", {
      "index" : "test.html"
    });
    fs.writeFileSync(output_path, body);

    expect(fs.existsSync(output_path)).to.be.ok();
    console.log("Pdf has been generated in %s", output_path);
  });



  it("should wait for DOM", async () => {
    let output_path = source + ".waitdom.pdf";

    let body = await html2pdf(source, "pdf", {
      "index"    : "test.html",
      waitForDom : "#spantrigger",
    });

    fs.writeFileSync(output_path, body);
    expect(fs.existsSync(output_path)).to.be.ok();

    console.log("Pdf has been generated in %s", output_path);
  });


  it("should wait for Event", async () => {
    let output_path = source + ".event.pdf";

    let body = await html2pdf(source, "pdf", {
      "index"      : "test.html",
      waitForEvent : "PDFREADY",
    });
    fs.writeFileSync(output_path, body);

    expect(fs.existsSync(output_path)).to.be.ok();
    console.log("Pdf has been generated in %s", output_path);
  });


  it("should test with footers", async () => {
    const source  = __dirname + '/multipage';

    let output_path = source + ".pdf";

    let body = await html2pdf(source, "pdf", {
      orientation : "portrait",
      footerFile : "footer.html",
      headerFile : "header.html",
      pageBodyAnchor   : "#container",
    });

    fs.writeFileSync(output_path, body);
    expect(fs.existsSync(output_path)).to.be.ok();

    console.log("Pdf has been generated in %s", output_path);
  });



});
