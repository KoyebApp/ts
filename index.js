const VideoDownloader = require('./VideoLinkExtractor');
const downloader = new VideoDownloader();

(async () => {
  try {
    await downloader.download('https://youtube.com/shorts/LiyfWStYQRs?si=DsjuflFZ901pgJpi', 'output_video.mp4');
  } catch (error) {
    console.error(error.message);
  }
})();
