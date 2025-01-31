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
   * Extracts the link from the "Get Link" button from the HTML content
   * @param {string} html - The HTML content of the download page
   * @returns {string} - The link provided by the "Get Link" button
   */
  extractGetLinkButton(html) {
    const $ = cheerio.load(html);

    // Look for the button with text "Get Link"
    const button = $('button').filter(function() {
      return $(this).text().includes('Get Link');
    });

    // If the button is found, check its associated URL
    if (button.length > 0) {
      const link = button.parent('a').attr('href');
      if (link) {
        return link; // Return the link associated with the "Get Link" button
      }
    }

    throw new Error('Get Link button not found.');
  }

  /**
   * Main function to extract the download link from the "Get Link" button
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<string>} - The final download link
   */
  async getDownloadLink(videoUrl) {
    try {
      // Step 1: Submit the video URL and get the download page HTML
      const html = await this.getDownloadPage(videoUrl);

      // Step 2: Extract the link from the "Get Link" button
      const downloadLink = this.extractGetLinkButton(html);

      return downloadLink;
    } catch (error) {
      console.error(error.message);
      throw new Error('Failed to extract the download link');
    }
  }
}

module.exports = VideoLinkExtractor;
