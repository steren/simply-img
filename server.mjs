import http from 'http';
import fs from 'fs';
import path from 'path';

const readFile = fs.promises.readFile;

async function serveIndex(res) {
  const data = await readFile('index.html');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(data);
}

async function serveImage(res, req) {
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

  console.log(`Serving image: ${contentType}`);

  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (err) {
    console.error(err);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/images/')) {
    await serveImage(res, req);
  } else {
    await serveIndex(res);
  }
});

server.listen(8080, () => {
  console.log('Server listening on port 8080');
});