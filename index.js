const VideoLinkExtractor = require('./VideoLinkExtractor'); // Import the new class

const extractor = new VideoLinkExtractor();

(async () => {
  try {
    // Use the getDownloadLink function to get the download link
    const downloadLink = await extractor.getDownloadLink(
      'https://youtube.com/shorts/LiyfWStYQRs?si=DsjuflFZ901pgJpi'
    );
    console.log('Download Link:', downloadLink); // Log the download link
  } catch (error) {
    console.error('Error:', error.message); // Catch and log any errors
  }
})();
