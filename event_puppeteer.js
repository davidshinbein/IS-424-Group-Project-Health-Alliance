const puppeteer = require("puppeteer");

async function go() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });

  // open a new tab
  const page = await browser.newPage();

  // go to the calendar page
  await page.goto("https://gha-uwmadison.web.app/calendar.html");

  // wait for page to load
  await page.waitForSelector("#openAdminModal");

  // click the Admin Login button to open modal
  await page.click("#openAdminModal");

  // wait for modal to appear
  await page.waitForSelector("#email");

  // provide email and password to sign in
  await page.type("#email", "gha.uwmadison@gmail.com");
  await page.type("#password", "heAlthybAdger006");

  // click the Sign In button
  await page.click("#signInBtn");

  // wait for authentication to complete (form should become visible)
  await page.waitForSelector("#eventForm:not(.is-hidden)", { timeout: 5000 });

  // fill in event details
  await page.type("#title", "Test Event via Puppeteer");

  // Set date/time - format: YYYY-MM-DDTHH:MM
  await page.type("#startAt", "2025-12-15T18:00");

  await page.type("#location", "Memorial Union");

  await page.type(
    "#description",
    "This is a test event created automatically using Puppeteer."
  );

  // published checkbox should already be checked by default, but you can toggle it:
  // await page.click("#published");

  // submit the form
  await page.click("#eventForm button[type='submit']");

  // wait to see the success message
  await new Promise((r) => setTimeout(r, 2000));

  // close the admin modal to see the public event list
  await page.click("#closeAdminModal");

  // wait for modal to close
  await new Promise((r) => setTimeout(r, 1000));

  // scroll to the top to see the "Upcoming Events" section
  await page.evaluate(() => window.scrollTo(0, 0));

  // wait a bit longer to see the event appear in the public list
  await new Promise((r) => setTimeout(r, 2000));

  // take a screenshot showing the public event
  await page.screenshot({
    path: "event-created.jpg",
    fullPage: true,
  });

  // keep browser open for 5 seconds so you can see the event
  await new Promise((r) => setTimeout(r, 5000));

  // optionally close the browser
  // await browser.close();
}

// call the function
go();
