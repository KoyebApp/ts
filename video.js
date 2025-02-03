const axios = require('axios');
const cheerio = require('cheerio');

class VideoDownloader {
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
      console.log(response.data); // Log the HTML content for debugging
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch download page: ${error.message}`);
    }
  }

  /**
   * Finds the "Get Link" button and extracts the next page URL
   * @param {string} html - The HTML content of the download page
   * @returns {Promise<string>} - The URL of the next page
   */
  async findGetLinkButton(html) {
    const $ = cheerio.load(html);

    // Use a flexible selector to find the "Get Link" button
    const getLinkButton = $('button').filter((i, el) => {
      return $(el).text().trim().toLowerCase().includes('get link');
    });

    if (getLinkButton.length === 0) {
      throw new Error('"Get Link" button not found!');
    }

    // Extract the form action or next page URL
    const form = getLinkButton.closest('form');
    if (form.length === 0) {
      throw new Error('Form not found for the "Get Link" button!');
    }

    const actionUrl = form.attr('action'); // Get the form action URL
    if (!actionUrl) {
      throw new Error('Form action URL not found!');
    }

    return `${this.baseUrl}${actionUrl}`;
  }

  /**
   * Fetches the next page and extracts the download URL
   * @param {string} nextPageUrl - The URL of the next page
   * @returns {Promise<string>} - The download URL
   */
  async extractDownloadUrl(nextPageUrl) {
    try {
      const response = await axios.get(nextPageUrl);
      const $ = cheerio.load(response.data);

      // Find the download link (e.g., an <a> tag with a download attribute)
      const downloadLink = $('a[download]').attr('href');
      if (!downloadLink) {
        throw new Error('Download URL not found on the next page!');
      }

      return downloadLink;
    } catch (error) {
      throw new Error(`Failed to fetch the next page: ${error.message}`);
    }
  }

  /**
   * Main function to get the download URL
   * @param {string} videoUrl - The YouTube video URL
   * @returns {Promise<string>} - The download URL
   */
  async getDownloadUrl(videoUrl) {
    try {
      // Step 1: Submit the video URL and get the download page HTML
      const html = await this.getDownloadPage(videoUrl);

      // Step 2: Find the "Get Link" button and get the next page URL
      const nextPageUrl = await this.findGetLinkButton(html);

      // Step 3: Fetch the next page and extract the download URL
      const downloadUrl = await this.extractDownloadUrl(nextPageUrl);

      console.log('Download URL:', downloadUrl); // Log the download URL
      return downloadUrl;
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}

// Example usage
(async () => {
  const downloader = new VideoDownloader();
  const videoUrl = 'https://youtube.com/shorts/EmHgKJI7uaU?si=StNzZiGqfTmmKDqL'; // Replace with a valid YouTube URL
  try {
    const downloadUrl = await downloader.getDownloadUrl(videoUrl);
    console.log('Download URL:', downloadUrl); // Use this URL as needed
  } catch (error) {
    console.error('Failed to get download URL:', error.message);
  }
})();
