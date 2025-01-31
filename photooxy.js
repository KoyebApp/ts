const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

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
   * Downloads the video and saves it to the specified path
   * @param {string} downloadLink - The download link of the video
   * @param {string} outputPath - The path to save the video
   */
  async downloadVideo(downloadLink, outputPath) {
    try {
      const response = await axios({
        method: 'GET',
        url: downloadLink,
        responseType: 'stream',
      });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }

  /**
   * Main function to download a video
   * @param {string} videoUrl - The YouTube video URL
   * @param {string} outputPath - The path to save the video
   */
  async download(videoUrl, outputPath) {
    try {
      // Step 1: Submit the video URL and get the download page HTML
      const html = await this.getDownloadPage(videoUrl);

      // Step 2: Extract the download link from the HTML
      const downloadLink = this.extractDownloadLink(html);

      // Step 3: Download the video using the extracted link
      await this.downloadVideo(downloadLink, outputPath);

      console.log('Video downloaded successfully!');
    } catch (error) {
      console.error(error.message);
    }
  }
}

module.exports = VideoDownloader;
