const axios = require('axios');
const cheerio = require('cheerio');

const downloadVideo = async (videoUrl) => {
  try {
    // Step 1: POST the video URL to the website (GetInDevice)
    const postUrl = 'https://getindevice.com/';
    const postData = {
      url: videoUrl,  // Video URL to be posted
    };

    // Step 2: Use axios to post the video URL to GetInDevice and get the response page
    const { data: initialHtml } = await axios.post(postUrl, postData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Step 3: Parse the HTML response using cheerio to find the "Download" button and the download page URL
    const $ = cheerio.load(initialHtml);

    // Step 4: Look for the "Download" button which should contain a link to the download page
    const downloadButton = $('#downloadBtn');

    if (downloadButton.length === 0) {
      console.error('Download button not found!');
      return;
    }

    console.log('Download button found, now fetching download page...');

    // Step 5: After clicking the download button, we extract the URL for the download page from the HTML
    const downloadPageUrl = downloadButton.attr('href'); // This should be the link for the download page

    if (!downloadPageUrl) {
      console.error('Download page URL not found!');
      return;
    }

    // Step 6: Fetch the download page to extract HD and SD video links
    const { data: downloadPageHtml } = await axios.get(downloadPageUrl);
    const $downloadPage = cheerio.load(downloadPageHtml);

    // Step 7: Extract both HD and SD download links
    const hdLink = $downloadPage('a[href*="download.php?media="]').first().attr('href');  // Find HD link
    const sdLink = $downloadPage('a[href*="download.php?media="]').last().attr('href');   // Find SD link

    // Step 8: Log the download links
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
  }
};

// Example video URL (GetInDevice URL with a Facebook share link)
const videoUrl = 'https://getindevice.com/#url=https://www.facebook.com/share/v/1NEuZRfoKU/';
downloadVideo(videoUrl);
