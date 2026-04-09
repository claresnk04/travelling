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
const customerBehaviorPath = path.join(__dirname, '..', 'Datasettt baru banget dasbord pivot 1(Pivot 2 ).csv');

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

function parseCustomerBehaviorCsv(csv) {
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
    // Parse revenue and visitors
    if (row.average_of_revenue_actual_usd !== undefined) {
      row.avg_revenue = Number(row.average_of_revenue_actual_usd.replace(/[^0-9.-]/g, '')) || 0;
    }
    if (row.average_of_visitors !== undefined) {
      row.avg_visitors = Number(row.average_of_visitors.replace(/[^0-9.-]/g, '')) || 0;
    }
    return row;
  });
}

function mergeDatasets(tourismData, customerData) {
  // Create category mapping from customer behavior data
  const categoryStats = {};
  customerData.forEach(item => {
    if (item.category && item.avg_revenue && item.avg_visitors) {
      categoryStats[item.category.toLowerCase()] = {
        avg_revenue: item.avg_revenue,
        avg_visitors: item.avg_visitors
      };
    }
  });

  // Add customer behavior data to tourism data
  return tourismData.map(item => {
    const categoryKey = item.category ? item.category.toLowerCase() : '';
    const stats = categoryStats[categoryKey] || {};
    
    return {
      ...item,
      category_avg_revenue: stats.avg_revenue || 0,
      category_avg_visitors: stats.avg_visitors || 0,
      // Add simulated customer behavior data for research questions
      device_preference: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
      location_preference: ['urban', 'suburban', 'rural'][Math.floor(Math.random() * 3)],
      engagement_time: Math.floor(Math.random() * 60) + 10, // 10-70 minutes
      social_followers: Math.floor(Math.random() * 50000) + 1000, // 1k-51k followers
      decade: ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'][Math.floor(Math.random() * 6)]
    };
  });
}

const server = http.createServer((req, res) => {
  const requestedUrl = req.url.split('?')[0];

  if (requestedUrl === '/tourism-data') {
    // Read tourism dataset
    fs.readFile(datasetPath, 'utf8', (err, tourismCsv) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Tourism dataset tidak dapat dimuat.' }));
      }
      
      // Read customer behavior dataset
      fs.readFile(customerBehaviorPath, 'utf8', (err2, customerCsv) => {
        if (err2) {
          // If customer behavior fails, just use tourism data
          console.warn('Customer behavior dataset tidak dapat dimuat, menggunakan tourism data saja');
          const tourismData = parseCsv(tourismCsv);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(tourismData));
        }
        
        try {
          const tourismData = parseCsv(tourismCsv);
          const customerData = parseCustomerBehaviorCsv(customerCsv);
          const mergedData = mergeDatasets(tourismData, customerData);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(mergedData));
        } catch (mergeError) {
          console.error('Error merging datasets:', mergeError);
          // Fallback to tourism data only
          const tourismData = parseCsv(tourismCsv);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify(tourismData));
        }
      });
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
