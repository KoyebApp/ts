const axios = require('axios');
const cheerio = require('cheerio');

const downloadVideo = async (videoUrl) => {
  try {
    // Step 1: Construct the URL for GetInDevice with the video URL
    const getUrl = `https://getindevice.com/#url=${encodeURIComponent(videoUrl)}`;

    // Step 2: Use axios to GET the page that contains the download options (this simulates the "clicking" of the button)
    const { data: initialHtml } = await axios.get(getUrl);

    // Step 3: Parse the HTML response using cheerio
    const $ = cheerio.load(initialHtml);

    // Step 4: Check if the "Download" button exists (this simulates the next step in the flow)
    const downloadButton = $('#downloadBtn');

    if (downloadButton.length === 0) {
      console.error('Download button not found!');
      return;
    }

    console.log('Download button found, now fetching download links...');

    // Step 5: Now, scrape the page for download links (HD and SD)
    // We'll search for the anchor tags that contain the video download links
    const hdLink = $('a[href*="download.php?media="]').first().attr('href');
    const sdLink = $('a[href*="download.php?media="]').last().attr('href');

    // Step 6: Log the download links if found
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

// Example video URL (a Facebook share link in this case)
const videoUrl = 'https://www.facebook.com/share/v/1NEuZRfoKU/';
downloadVideo(videoUrl);
