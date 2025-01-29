const puppeteer = require('puppeteer');

async function fetchVideoDownloadUrl(youtubeUrl) {
  let browser;
  try {
    // Launch the browser
    browser = await puppeteer.launch({ 
      headless: true,  // Set this to false if you want to see the browser GUI
      args: ['--no-sandbox', '--disable-setuid-sandbox']  // Add the necessary flags
    });

    const page = await browser.newPage();
    
    // Navigate to the page
    console.log('Navigating to the website...');
    await page.goto('https://yt.savetube.me/1kejjj1?id=361014378', { waitUntil: 'domcontentloaded' });

    // Wait for the input field to load
    console.log('Waiting for the input field...');
    await page.waitForSelector('input.search-input');
    
    // Type in the YouTube URL into the input field
    console.log(`Entering YouTube URL: ${youtubeUrl}`);
    await page.type('input.search-input', youtubeUrl);

    // Wait for the "Get Video" button to be visible and clickable
    console.log('Waiting for the "Get Video" button...');
    await page.waitForSelector('button[type="submit"]', { visible: true });
    console.log('Clicking the "Get Video" button...');
    await page.click('button[type="submit"]');

    // Check for the "Get Link" button presence and click it
    console.log('Waiting for the "Get Link" button...');
    await page.waitForSelector('button.w-[130px]'); // Adjust selector for better matching
    console.log('Clicking the "Get Link" button...');
    await page.click('button.w-[130px]');  // You can adjust this selector as needed

    // Wait for the download link to appear
    console.log('Waiting for the download link...');
    await page.waitForSelector('a[download]', { timeout: 60000 });

    // Extract the download URL from the page
    const downloadUrl = await page.evaluate(() => {
      const downloadLink = document.querySelector('a[download]');
      return downloadLink ? downloadLink.href : null;
    });

    if (downloadUrl) {
      console.log('Download URL:', downloadUrl);  // Log the download URL
    } else {
      console.log('Download link not found.');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    if (browser) {
      // Close the browser after completing the task
      await browser.close();
    }
  }
}

// Replace this with any YouTube URL you want to test
const youtubeUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
fetchVideoDownloadUrl(youtubeUrl);
