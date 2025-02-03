const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extracts the download link from SaveFrom.net
 * @param {string} videoUrl - The URL of the video to download
 * @returns {Promise<string>} - The download link
 */
async function getDownloadLink(videoUrl) {
  try {
    // Step 1: Send a POST request to SaveFrom.net with the video URL
    const response = await axios.post(
      'https://en.savefrom.net/download', // SaveFrom.net endpoint
      new URLSearchParams({ url: videoUrl }), // Submit the video URL as form data
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    // Step 2: Load the HTML response into Cheerio
    const $ = cheerio.load(response.data);

    // Step 3: Find the download link in the HTML
    const downloadLink = $('a.download-link').attr('href');
    if (!downloadLink) {
      throw new Error('Download link not found in the HTML!');
    }

    return downloadLink;
  } catch (error) {
    console.error('Error fetching download link:', error.message);
    throw error;
  }
}

/**
 * Main function to download a video
 * @param {string} videoUrl - The URL of the video to download
 */
async function downloadVideo(videoUrl) {
  try {
    // Step 1: Get the download link from SaveFrom.net
    const downloadLink = await getDownloadLink(videoUrl);
    console.log('Download Link:', downloadLink);

    // Step 2: Download the video using the download link
    const response = await axios({
      method: 'GET',
      url: downloadLink,
      responseType: 'stream',
    });

    const outputPath = 'video.mp4'; // Save the video as video.mp4
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Video downloaded successfully!');
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading video:', error.message);
  }
}

// Example usage
(async () => {
  const videoUrl = 'https://youtube.com/shorts/EmHgKJI7uaU?si=AsBMkVJwDiIveE5K'; // Replace with a valid YouTube URL
  await downloadVideo(videoUrl);
})();
