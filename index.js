const VideoLinkExtractor = require('./VideoLinkExtractor');

const extractor = new VideoLinkExtractor();

(async () => {
  try {
    const youtubeUrl = 'https://youtube.com/shorts/LiyfWStYQRs?si=TPx_aYFePMT-8QvE';
    const downloadLink = await extractor.getDownloadLink(youtubeUrl);
    console.log('Download Link:', downloadLink); // Log the final download link
  } catch (error) {
    console.error('Error:', error.message); // Catch and log any errors
  }
})();
