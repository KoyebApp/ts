const axios = require('axios');
const cheerio = require('cheerio');

class VideoLinkExtractor {
  constructor() {
    this.baseUrl = 'https://yt.savetube.me'; // Base URL of the website
  }

  /**
   * Submits the YouTube video URL and retrieves the download page HTML
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<string>} - The HTML content of the download page
   */
  async getDownloadPage(videoUrl) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/1kejjj1`, // Endpoint for processing the video
        new URLSearchParams({ id: videoUrl }), // Submit the video URL as form data
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch download page: ${error.message}`);
    }
  }

  /**
   * Extracts the download link from the HTML content
   * @param {string} html - The HTML content of the download page
   * @returns {string} - The download link
   */
  extractDownloadLink(html) {
    const $ = cheerio.load(html);

    // Find the download button and extract the href attribute
    const downloadLink = $('a.bg-btn-accent-custom').attr('href');

    if (!downloadLink) {
      throw new Error('Download link not found in the page.');
    }

    return downloadLink;
  }

  /**
   * Main function to extract the download link
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<string>} - The download link
   */
  async getDownloadLink(videoUrl) {
    try {
      // Step 1: Submit the video URL and get the download page HTML
      const html = await this.getDownloadPage(videoUrl);

      // Step 2: Extract the download link from the HTML
      const downloadLink = this.extractDownloadLink(html);

      return downloadLink;
    } catch (error) {
      console.error(error.message);
      throw new Error('Failed to extract the download link');
    }
  }
}

module.exports = VideoLinkExtractor;
