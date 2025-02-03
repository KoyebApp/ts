const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const downloadVideo = async (videoUrl) => {
  let browser;
  try {
    // Step 1: Launch a headless browser
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser in action
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
      ],
    });

    const page = await browser.newPage();

    // Step 2: Construct the URL for GetInDevice with the video URL
    const getUrl = `https://getindevice.com/#url=${encodeURIComponent(videoUrl)}`;

    // Step 3: Navigate to the page and wait for it to load
    await page.goto(getUrl, { waitUntil: 'networkidle2' });

    // Step 4: Wait for the download button to appear
    await page.waitForSelector('#downloadBtn', { timeout: 5000 });

    // Step 5: Click the download button to trigger the download process
    await page.click('#downloadBtn');

    // Step 6: Wait for the download to complete (you may need to adjust this logic)
    // Puppeteer doesn't natively handle file downloads, so we'll use a workaround.
    // Listen for the "response" event to capture the download link.
    let downloadLink;
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('download.php?media=')) {
        downloadLink = url;
        console.log('Download Link Found:', downloadLink);
      }
    });

    // Wait for a few seconds to allow the download link to be captured
    await page.waitForTimeout(5000);

    if (!downloadLink) {
      console.error('Download link not found!');
      return;
    }

    // Step 7: Use axios to download the file (optional)
    const axios = require('axios');
    const response = await axios.get(downloadLink, { responseType: 'stream' });
    const filePath = path.join(__dirname, 'downloaded_video.mp4');
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('Download completed! File saved as:', filePath);
    });

    writer.on('error', (err) => {
      console.error('Error writing file:', err);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Step 8: Close the browser
    if (browser) {
      await browser.close();
    }
  }
};

// Example video URL (a Facebook share link in this case)
const videoUrl = 'https://www.facebook.com/share/v/1NEuZRfoKU/';
downloadVideo(videoUrl);
