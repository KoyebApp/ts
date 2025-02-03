const axios = require('axios');
  const cheerio = require('cheerio');

  async function downloadFromSaveFrom(videoUrl) {
    const response = await axios.get(`https://en.savefrom.net/download?url=${videoUrl}`);
    const $ = cheerio.load(response.data);
    const downloadLink = $('a.download-button').attr('href');
    console.log('Download Link:', downloadLink);
  }

  downloadFromSaveFrom('https://youtube.com/shorts/EmHgKJI7uaU?si=AsBMkVJwDiIveE5K');
