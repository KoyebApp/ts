const { chromium } = require('playwright'); // import Playwright

const fetchDownloadLink = async (youtubeUrl) => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://yt.savetube.me/', { waitUntil: 'domcontentloaded' });

  await page.fill('input[placeholder="Paste your Youtube link here"]', youtubeUrl);
  await page.waitForTimeout(5000);

  await page.selectOption('#quality', { value: '720' });

  await page.waitForSelector('#downloadSection');

  const downloadLink = await page.evaluate(() => {
    const link = document.querySelector('a[href*="https://www.savetube.me/download/"]');
    return link ? link.href : null;
  });

  if (downloadLink) {
    console.log('Download Link:', downloadLink);
  } else {
    console.log('Download link not found.');
  }

  await browser.close();
};

// Example usage
fetchDownloadLink('https://youtube.com/shorts/MyH2i7mpss8?si=7L4T5cKa7ksafOtc');
