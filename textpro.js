const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cookie = require("cookie");
const axios = require('axios');
const FormData = require("form-data");

// Helper function to make a GET request and return a buffer (not used in final output)
async function getBuffer(url, options) {
  try {
    options = options || {};
    const res = await axios({
      method: "get",
      url,
      headers: {
        'DNT': 1,
        'Upgrade-Insecure-Request': 1
      },
      ...options,
      responseType: 'arraybuffer'
    });
    return res.data;
  } catch (err) {
    return err;
  }
}

// Helper function to make a POST request (used for sending form data)
async function post(url, formdata = {}, cookies) {
  let encode = encodeURIComponent;
  let body = Object.keys(formdata)
    .map((key) => {
      let vals = formdata[key];
      let isArray = Array.isArray(vals);
      let keys = encode(key + (isArray ? "[]" : ""));
      if (!isArray) vals = [vals];
      let out = [];
      for (let valq of vals) out.push(keys + "=" + encode(valq));
      return out.join("&");
    })
    .join("&");

  return await fetch(`${url}?${body}`, {
    method: "GET",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "GoogleBot",
      Cookie: cookies,
    },
  });
}

// TextPro Scraper function
async function textpro(url, text) {
  if (!/^https:\/\/textpro\.me\/.+\.html$/.test(url))
    throw new Error("Invalid URL!");

  const geturl = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    },
  });

  const caritoken = await geturl.text();

  // Extract cookies from the response headers
  let hasilcookie = geturl.headers
    .get("set-cookie")
    .split(",")
    .map((v) => cookie.parse(v))
    .reduce((a, c) => {
      return { ...a, ...c };
    }, {});

  // Select the relevant cookies
  hasilcookie = {
    __cfduid: hasilcookie.__cfduid,
    PHPSESSID: hasilcookie.PHPSESSID,
  };

  // Serialize cookies for the POST request
  hasilcookie = Object.entries(hasilcookie)
    .map(([name, value]) => cookie.serialize(name, value))
    .join("; ");

  const $ = cheerio.load(caritoken);
  const token = $('input[name="token"]').attr("value");

  const form = new FormData();
  if (typeof text === "string") text = [text];
  for (let texts of text) form.append("text[]", texts);
  form.append("submit", "Go");
  form.append("token", token);
  form.append("build_server", "https://textpro.me");
  form.append("build_server_id", 1);

  // Send POST request with form data to generate image
  const geturl2 = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Cookie: hasilcookie,
      ...form.getHeaders(),
    },
    body: form.getBuffer(),
  });

  const caritoken2 = await geturl2.text();
  const token2 = /<div.*?id="form_value".+>(.*?)<\/div>/.exec(caritoken2);
  if (!token2) throw new Error("Token not found!");

  // Send a POST request to create the image and get the response
  const prosesimage = await post(
    "https://textpro.me/effect/create-image",
    JSON.parse(token2[1]),
    hasilcookie
  );

  // Log the entire API response for debugging
  const hasil = await prosesimage.json();
  console.log("API Response:", JSON.stringify(hasil, null, 2)); // Log full response for inspection

  // Extract and return the processed image URL
  if (hasil && hasil.fullsize_image) {
    const imageUrl = `https://textpro.me${hasil.fullsize_image}`;
    console.log("Processed Image URL:", imageUrl); // Log the final image URL
    return imageUrl; // Return the image URL
  } else {
    throw new Error("Failed to retrieve image URL from response.");
  }
}

// Test function to check if textpro retrieves the expected URL
async function testTextPro() {
  const testUrl = "https://textpro.me/create-online-reflected-neon-text-effect-1157.html"; // Replace with a valid URL
  const testText = ["Hello"];

  try {
    const result = await textpro(testUrl, testText);
    console.log("Processed Image URL:", result); // Log the URL to check the result

    // Ensure the result is a string and starts with the correct URL
    if (typeof result === "string" && result.startsWith("https://textpro.me")) {
      console.log("Test Passed: Image URL retrieved successfully.");
    } else {
      console.log("Test Failed: The result is not a valid image URL.");
    }
  } catch (error) {
    console.error("Test Failed: " + error.message);
  }
}

// Run the test
testTextPro();

module.exports = textpro;
