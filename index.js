const VideoLinkExtractor = require('./VideoLinkExtractor');

const extractor = new VideoLinkExtractor();

(async () => {
  try {
    // Replace this URL with the actual YouTube video URL
    const youtubeUrl = 'https://youtube.com/shorts/LiyfWStYQRs?si=dFe9mUM2NvTIqgYX';
    
    // Use the getDownloadLink function to get the download link from the "Get Link" button
    const downloadLink = await extractor.getDownloadLink(youtubeUrl);
    
    console.log('Download Link:', downloadLink); // Log the final download link
  } catch (error) {
    console.error('Error:', error.message); // Catch and log any errors
  }
})();
