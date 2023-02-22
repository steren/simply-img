import http from 'http';
import fs from 'fs';
import path from 'path';
import { runInNewContext } from 'vm';

const readFile = fs.promises.readFile;

async function serveIndex(req, res) {
  console.log(`request headers received by "${req.url}":`);
  console.log(JSON.stringify(req.headers, null, 2));

  const data = await readFile('index.html');
  res.setHeader('Content-Type', 'text/html');
  
  // Tell the client that the server can use device pixel ratio
  res.setHeader('Accept-CH', 'DPR');

  console.log(`response headers sent by "${req.url}":`);
  console.log(JSON.stringify(res.getHeaders(), null, 2));
  res.end(data);
}

// Return the image to serve based on a ste of options (content type,pixel ratio, etc.)
function pickFile(image, options) {
  const { contentType, dpr, saveData } = options;

  let extension;
  if(contentType === 'image/avif') {
    extension = 'avif';
  } else if(contentType === 'image/webp') {
    extension = 'webp';
  } else {
    extension = 'jpg';
  }

  let pixelRatio = 1;
  // if saveData, never serve a high density image
  if(dpr > 1 && !saveData) {
    pixelRatio = 2;
  }

  return `images/${image}-${pixelRatio}x.${extension}`;
}

async function serveImage(req, res) {
  console.log(`request headers received by "${req.url}":`);
  console.log(JSON.stringify(req.headers, null, 2));

  res.setHeader('Vary', 'Accept, DPR');

  let contentType;
  let dpr;
  let saveData = false;

  const acceptHeader = req.headers.accept;
  const image = path.basename(req.url);
  

  if (acceptHeader && acceptHeader.includes('image/avif')) {
    contentType = 'image/avif';
  } else if (acceptHeader && acceptHeader.includes('image/webp')) {
    contentType = 'image/webp';
  } else {
    contentType = 'image/jpeg';
  }
  res.setHeader('Content-Type', contentType);
  console.log(`Image Content-Type served: ${contentType}`);

  
  if(req.headers['dpr']) {
    console.log(`Client Device Pixel Ratio: ${req.headers.dpr}`);

    dpr = Math.ceil(parseFloat(req.headers.dpr));

    console.log(`Image Device Pixel Ratio served: ${dpr}`);
    res.setHeader('Content-DPR', dpr);
  }

  if(req.headers['save-data']) {
    console.log('Client is in Save-Data mode');
    saveData = true;
  }

  const file = pickFile(image, { contentType, dpr, saveData });


  console.log(`Serving file: ${file}`);

  try {
    const data = await readFile(file);

    console.log(`response headers sent by "${req.url}":`);
    console.log(JSON.stringify(res.getHeaders(), null, 2));
    res.end(data);
  } catch (err) {
    console.error(err);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/images/')) {
    await serveImage(req, res);
  } else if (req.url.startsWith('/favicon')) {
    return;
  } else {
    await serveIndex(req, res);
  }
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});
