import http from 'http';
import fs from 'fs';
import path from 'path';

const readFile = fs.promises.readFile;

async function serveIndex(req, res) {
  console.log(`request headers received by "${req.url}":`);
  console.log(req.headers);

  const data = await readFile('index.html');
  res.setHeader('Content-Type', 'text/html');
  
  console.log(`response headers sent by "${req.url}":`);
  console.log(JSON.stringify(res.getHeaders(), null, 2));
  res.end(data);
}

async function serveImage(req, res) {
  console.log(`request headers received by "${req.url}":`);
  console.log(req.headers);

  const acceptHeader = req.headers.accept;
  const image = path.basename(req.url);
  let file;
  let contentType;

  if (acceptHeader && acceptHeader.includes('image/avif')) {
    file = `images/${image}.avif`;
    contentType = 'image/avif';
  } else if (acceptHeader && acceptHeader.includes('image/webp')) {
    file = `images/${image}.webp`;
    contentType = 'image/webp';
  } else {
    file = `images/${image}.jpg`;
    contentType = 'image/jpeg';
  }

  res.setHeader('Vary', 'Accept');

  console.log(`Serving image: ${contentType}`);

  res.setHeader('Content-Type', contentType);

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
