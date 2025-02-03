const puppeteer = require('puppeteer');

const downloadVideo = async (videoUrl) => {
  let browser;
  try {
    // Step 1: Launch a headless browser with sandbox and other security features disabled
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser in action
      args: [
        '--no-sandbox', // Disables the sandbox
        '--disable-setuid-sandbox', // Disables the setuid sandbox
        '--disable-dev-shm-usage', // Disables shared memory usage (useful in Docker)
        '--disable-accelerated-2d-canvas', // Disables hardware acceleration
        '--disable-gpu', // Disables GPU hardware acceleration
        '--no-zygote', // Disables the use of a zygote process
      ],
    });

    const page = await browser.newPage();

    // Step 2: Construct the URL for GetInDevice with the video URL
    const getUrl = `https://getindevice.com/#url=${encodeURIComponent(videoUrl)}`;

    // Step 3: Navigate to the page and wait for it to load
    await page.goto(getUrl, { waitUntil: 'networkidle2' }); // Wait until the network is mostly idle

    // Step 4: Wait for the download button to appear (if it's dynamically loaded)
    await page.waitForSelector('#downloadBtn', { timeout: 5000 }); // Adjust timeout as needed

    // Step 5: Extract the HTML content after JavaScript has executed
    const content = await page.content();

    // Step 6: Use cheerio to parse the HTML and extract download links
    const $ = require('cheerio').load(content);
    const hdLink = $('a[href*="download.php?media="]').first().attr('href');
    const sdLink = $('a[href*="download.php?media="]').last().attr('href');

    // Step 7: Log the download links if found
    if (hdLink) {
      console.log('HD Link:', hdLink);
    } else {
      console.log('HD Link not found.');
    }

    if (sdLink) {
      console.log('SD Link:', sdLink);
    } else {
      console.log('SD Link not found.');
    }

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
