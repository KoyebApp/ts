const VideoDownloader = require('./photooxy');

const downloader = new VideoDownloader();

(async () => {
  try {
    await downloader.download(
      'https://youtube.com/shorts/LiyfWStYQRs?si=DsjuflFZ901pgJpi'
  } catch (error) {
    console.error(error.message);
  }
})();
