const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const chromedriver = require('chromedriver');

// Setup ChromeDriver path
chrome.setDefaultService(new chrome.ServiceBuilder(path.resolve(chromedriver.path)).build());

// Function to fetch download link
const fetchDownloadLink = async () => {
  // Initialize Selenium WebDriver
  const driver = await new Builder().forBrowser('chrome').build();

  try {
    // Navigate to the URL
    await driver.get('https://yt.savetube.me/1kejjj1?id=360980743');
    
    // Type the YouTube URL into the input field
    await driver.findElement(By.css('input[placeholder="Paste your Youtube link here"]')).sendKeys('https://youtube.com/shorts/MyH2i7mpss8?si=7L4T5cKa7ksafOtc', Key.RETURN);

    // Wait for the page to load and process the URL
    await driver.sleep(5000); // Wait for 5 seconds for processing

    // Select 720p from the quality dropdown
    await driver.findElement(By.css('#quality')).sendKeys('720');

    // Wait for the download link to appear
    await driver.wait(until.elementLocated(By.css('a[href*="https://www.savetube.me/download/"]')), 10000);  // Wait for the link to appear

    // Fetch the download link
    const downloadLink = await driver.findElement(By.css('a[href*="https://www.savetube.me/download/"]')).getAttribute('href');
    console.log('Download Link:', downloadLink);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    // Close the driver/browser
    await driver.quit();
  }
};

// Call the function to fetch the download link
fetchDownloadLink();
