const axios = require('axios');
   const cheerio = require('cheerio');

   const downloadVideo = async (videoUrl) => {
     try {
       const getUrl = `https://getindevice.com/#url=${encodeURIComponent(videoUrl)}`;

       // Add headers to mimic a browser request
       const headers = {
         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
         'Referer': 'https://getindevice.com/'
       };

       const { data: initialHtml } = await axios.get(getUrl, { headers });

       const $ = cheerio.load(initialHtml);
       const downloadButton = $('#downloadBtn');

       if (downloadButton.length === 0) {
         console.error('Download button not found!');
         return;
       }

       console.log('Download button found, now attempting to extract download links...');

       const hdLink = $('a[href*="download.php?media="]').first().attr('href');
       const sdLink = $('a[href*="download.php?media="]').last().attr('href');

       if (hdLink) {
         console.log('HD Link:', hdLink);
       } else {
         console.log('HD Link not found.');
       }

       if (sdLink) {
         console.log('SD Link:', sdLink);
       } else {
         console.log('SD Link not found.');
       }

     } catch (error) {
       console.error('Error:', error.message);
     }
   };

   const videoUrl = 'https://www.facebook.com/share/v/1NEuZRfoKU/';
   downloadVideo(videoUrl);
