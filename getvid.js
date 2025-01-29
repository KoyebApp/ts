const puppeteer = require('puppeteer');

async function fetchVideoDownloadUrl(youtubeUrl) {
  // Launch a browser instance
  const browser = await puppeteer.launch({ headless: false }); // set headless: true to run without opening the browser
  const page = await browser.newPage();

  // Navigate to the page
  await page.goto('https://yt.savetube.me/1kejjj1?id=361014378');

  // Type in the YouTube URL into the input field
  await page.type('input.search-input', youtubeUrl);

  // Click the "Get Video" button
  await page.click('button[type="submit"]');

  // Wait for the page to load after clicking
  await page.waitForSelector('a[download]'); // Wait for the download link to appear

  // Extract the download link from the page
  const downloadUrl = await page.evaluate(() => {
    const downloadLink = document.querySelector('a[download]');
    return downloadLink ? downloadLink.href : null; // Return the download URL if available
  });

  if (downloadUrl) {
    console.log('Download URL:', downloadUrl);
  } else {
    console.log('Download link not found.');
  }

  // Close the browser
  await browser.close();
}

// Test with a YouTube URL
fetchVideoDownloadUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  .then(() => {
    console.log('Video download URL fetched successfully!');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
