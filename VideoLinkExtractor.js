const axios = require('axios');
const cheerio = require('cheerio');

class VideoLinkExtractor {
  constructor() {
    this.baseUrl = 'https://yt.savetube.me';
  }

  /**
   * Submits the YouTube video URL to retrieve the download page HTML
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
   * Extracts the URL to the next page where the "Get Link" button is located
   * @param {string} html - The HTML content of the download page
   * @returns {string} - The URL for the next page
   */
  extractNextPageLink(html) {
    const $ = cheerio.load(html);
    // Locate the "Get Link" button (or next page link)
    const nextPageUrl = $('button:contains("Get Link")').parent('a').attr('href');

    if (!nextPageUrl) {
      throw new Error('Get Link button or link not found.');
    }

    return nextPageUrl;
  }

  /**
   * Extracts the final download link from the page where the actual video link is present
   * @param {string} html - The HTML content of the next page
   * @returns {string} - The final download link for the video
   */
  extractFinalDownloadLink(html) {
    const $ = cheerio.load(html);
    // Find the download link
    const downloadLink = $('a.bg-btn-accent-custom').attr('href');

    if (!downloadLink) {
      throw new Error('Final download link not found.');
    }

    return downloadLink;
  }

  /**
   * Main function to get the final video download link
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<string>} - The final download link for the video
   */
  async getDownloadLink(videoUrl) {
    try {
      // Step 1: Fetch the download page HTML
      const firstPageHtml = await this.getDownloadPage(videoUrl);

      // Step 2: Extract the next page link (which contains the "Get Link" button)
      const nextPageUrl = this.extractNextPageLink(firstPageHtml);

      // Step 3: Fetch the second page HTML
      const secondPageResponse = await axios.get(nextPageUrl);
      const secondPageHtml = secondPageResponse.data;

      // Step 4: Extract the final download link
      const downloadLink = this.extractFinalDownloadLink(secondPageHtml);

      return downloadLink;
    } catch (error) {
      throw new Error(`Failed to get the download link: ${error.message}`);
    }
  }
}

module.exports = VideoLinkExtractor;
