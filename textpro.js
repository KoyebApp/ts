const fetch = require("node-fetch");
const cheerio = require("cheerio");
const cookie = require("cookie");
const axios = require('axios');
const FormData = require("form-data");

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
  console.log("Page HTML retrieved");

  let hasilcookie = geturl.headers
    .get("set-cookie")
    .split(",")
    .map((v) => cookie.parse(v))
    .reduce((a, c) => {
      return { ...a, ...c };
    }, {});

  console.log("Cookies extracted:", hasilcookie);

  hasilcookie = {
    __cfduid: hasilcookie.__cfduid,
    PHPSESSID: hasilcookie.PHPSESSID,
  };

  hasilcookie = Object.entries(hasilcookie)
    .map(([name, value]) => cookie.serialize(name, value))
    .join("; ");

  const $ = cheerio.load(caritoken);
  const token = $('input[name="token"]').attr("value");

  console.log("Token extracted:", token);

  if (!token) {
    throw new Error("Token not found! Please check if the page structure has changed.");
  }

  const form = new FormData();
  if (typeof text === "string") text = [text];
  for (let texts of text) form.append("text[]", texts);
  form.append("submit", "Go");
  form.append("token", token);
  form.append("build_server", "https://textpro.me");
  form.append("build_server_id", 1);

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
  console.log("Form submitted, response received");

  const token2 = /<div.*?id="form_value".+>(.*?)<\/div>/.exec(caritoken2);
  if (!token2) throw new Error("Token not found in the response!");

  console.log("Second token extracted:", token2[1]);

  // Attempt to log the full form data that is being sent
  const formData = JSON.parse(token2[1]);
  console.log("Form data sent for image generation:", formData);

  const prosesimage = await post(
    "https://textpro.me/effect/create-image",
    formData,
    hasilcookie
  );

  const hasil = await prosesimage.json();
  console.log("API Response:", JSON.stringify(hasil, null, 2)); // Log full response for inspection

  if (hasil.success === true && hasil.fullsize_image) {
    const imageUrl = `https://textpro.me${hasil.fullsize_image}`;
    console.log("Processed Image URL:", imageUrl);
    return imageUrl;
  } else {
    const $2 = cheerio.load(caritoken2);
    const imageLink = $('#link-image').text().split(' ')[2];
    if (imageLink) {
      console.log("Processed Image URL:", imageLink);
      return imageLink;
    } else {
      throw new Error("Failed to retrieve image URL from the page.");
    }
  }
}

// Test function to check if textpro retrieves the expected URL
async function testTextPro() {
  const testUrl = "https://textpro.me/create-online-reflected-neon-text-effect-1157.html"; 
  const testText = ["Hello"];

  try {
    const result = await textpro(testUrl, testText);
    console.log("Processed Image URL:", result);

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
