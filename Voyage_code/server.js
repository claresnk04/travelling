const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = path.join(__dirname);
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const datasetPath = path.join(__dirname, '..', 'Datasettt baru banget dasbord (tourism dataset fiks).csv');

function splitCsvLine(line) {
  const regex = /(?:"([^"]*)"|([^",]+))/g;
  const values = [];
  let match;
  while ((match = regex.exec(line))) {
    values.push(match[1] !== undefined ? match[1] : match[2]);
  }
  return values.map(value => (value || '').trim());
}

function parseCsv(csv) {
  const rows = csv.trim().split(/\r?\n/).filter(Boolean);
  const rawHeaders = splitCsvLine(rows.shift());
  const headers = rawHeaders.map(header => header.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/_+/g, '_')
  );

  return rows.map(line => {
    const values = splitCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    if (row.visitors !== undefined) row.visitors = Number(row.visitors.replace(/[^0-9.-]/g, '')) || 0;
    if (row.rating !== undefined) row.rating = Number(row.rating) || 0;
    if (row.revenue_actual_usd !== undefined) row.revenue = Number(row.revenue_actual_usd.replace(/[^0-9.-]/g, '')) || 0;
    if (row.revenue !== undefined) row.revenue = Number(String(row.revenue).replace(/[^0-9.-]/g, '')) || 0;
    if (row.accommodation_available !== undefined) row.accommodation = row.accommodation_available;
    return row;
  });
}

const server = http.createServer((req, res) => {
  const requestedUrl = req.url.split('?')[0];

  if (requestedUrl === '/tourism-data') {
    fs.readFile(datasetPath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Dataset tidak dapat dimuat.' }));
      }
      const jsonData = parseCsv(data);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(jsonData));
    });
    return;
  }

  let filePath = path.join(rootDir, requestedUrl === '/' ? '/home.html' : requestedUrl);

  if (!path.resolve(filePath).startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('Forbidden');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'home.html');
  }

  const ext = path.extname(filePath) || '.html';
  const contentType = mimeTypes[ext.toLowerCase()] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not Found');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
