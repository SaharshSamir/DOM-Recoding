import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // Set to true for headless mode
  const page = await browser.newPage();

  await page.goto(
    "https://stackoverflow.com/questions/40593875/using-filesystem-in-node-js-with-async-await",
    { waitUntil: "networkidle0" }
  );

  // Inject the tracking script
  await page.addScriptTag({ url: "http://localhost:1212/record.js" });

  // Wait for the script to initialize
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log("Injected client.js");

  // Modify the DOM to trigger MutationObserver
  await page.evaluate(() => {
    document.body.innerHTML += "<p>Puppeteer Test Change</p>";
  });

  console.log("DOM modified");

  // Wait for the client script to detect changes and send patches
  await new Promise(resolve => setTimeout(resolve, 3000));
  //
  // Close the browser
  await browser.close();
})();
