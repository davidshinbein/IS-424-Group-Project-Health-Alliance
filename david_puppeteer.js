// import puppeteer

const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });

  // open a new tab
  const page = await browser.newPage();

  //  go to the site to be tested

  await page.goto("https://gha-uwmadison.web.app/get-involved.html");

  // fill out contact form

  // provide email and password to sign in
  await page.type("#contactName", "Puppeteer Bot");
  await page.type("#contactEmail", "puppeteer@gmail.com");
  await page.type("#contactMessage", "This is a message from Puppeteer Bot.");
  // click submit button
  await page.click("#contactSubmit");
  // need to find the correct selectors for these elements by inspecting element

  // take a screenshot
  await page.screenshot({ path: "contact-submit.png", fullPage: true });

  //   force a 1 second delay
  await new Promise((r) => setTimeout(r, 1000));
}
// call the function
go();

// run with ' node puppeteer.js ' in terminal
// cd "/Users/user/IS 424/IS-424-Group-Project-Health-Alliance"
