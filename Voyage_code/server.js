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

const pivotDatasetPath = path.join(__dirname, '..', 'Datasettt baru banget dasbord pivot 1(Pivot 2 ).csv');

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

function parsePivotDataset(csv) {
  const rows = csv.trim().split(/\r?\n/).filter(line => line.trim() && !line.startsWith(','));
  const rawHeaders = splitCsvLine(rows.shift());
  const headers = rawHeaders.map(header => header.trim().toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[()]/g, '')
    .replace(/_+/g, '_')
    .replace(/_$/, '')
  ).filter(h => h.length > 0);

  const categoryData = {};
  rows.forEach(line => {
    if (!line.trim()) return;
    const values = splitCsvLine(line);
    const category = (values[0] || '').trim();
    if (!category || category === 'Grand Total') return;
    
    const revenue = Number((values[1] || '0').replace(/[^0-9.-]/g, '')) || 0;
    const visitors = Number((values[2] || '0').replace(/[^0-9.-]/g, '')) || 0;
    
    categoryData[category] = { revenue, visitors };
  });
  return categoryData;
}

function generateDestinationsFromPivot(categoryData) {
  const destinations = [];
  const destinationNamesByCategory = {
    'Adventure': ['Mount Bromo', 'Kawah Ijen', 'Caving Adventure', 'White Water Rafting', 'Rock Climbing', 'Khao Yai Trek', 'Ha Long Bay Kayak', 'Palawan Island', 'Petronas Trek', 'Hang Son Doong'],
    'Beach': ['Bali Beach', 'Lombok Beach', 'Gili Islands', 'Komodo Bay', 'Raja Ampat', 'Phuket Beach', 'Krabi Beach', 'Boracay Beach', 'Penang Beach', 'Sihanoukville Beach'],
    'Cultural': ['Yogyakarta Palace', 'Traditional Dance Show', 'Art Gallery', 'Heritage Site', 'Local Museum', 'Bangkok Temple', 'Hanoi Old Quarter', 'Manila Heritage', 'Georgetown Heritage', 'Bagan Temples'],
    'Historical': ['Borobudur', 'Prambanan', 'Ancient Fort', 'War Museum', 'Historical Garden', 'Ayutthaya Ruins', 'Hoi An Ancient Town', 'Intramuros', 'Penang Fort', 'Pagan Ancient City'],
    'Nature': ['Rainforest Trek', 'Waterfall Hike', 'Jungle Safari', 'Nature Reserve', 'National Park', 'Doi Inthanon', 'Sapa Terraces', 'Taal Volcano', 'Cameron Highlands', 'Inle Lake Trek'],
    'Urban': ['Jakarta Downtown', 'Shopping Mall', 'Night Market', 'Business District', 'City Tour', 'Bangkok City', 'Hanoi City', 'Manila City', 'Kuala Lumpur City', 'Singapore City']
  };

  const destinations_by_country = {
    'Indonesia': [
      {name:'Jakarta', city:'Jakarta'},
      {name:'Yogyakarta', city:'Yogyakarta'},
      {name:'Bandung', city:'Bandung'},
      {name:'Surabaya', city:'Surabaya'},
      {name:'Semarang', city:'Semarang'},
      {name:'Bali', city:'Bali'},
      {name:'Lombok', city:'Lombok'}
    ],
    'Thailand': [
      {name:'Bangkok', city:'Bangkok'},
      {name:'Phuket', city:'Phuket'},
      {name:'Krabi', city:'Krabi'},
      {name:'Chiang Mai', city:'Chiang Mai'},
      {name:'Pattaya', city:'Pattaya'}
    ],
    'Vietnam': [
      {name:'Hanoi', city:'Hanoi'},
      {name:'Ho Chi Minh', city:'Ho Chi Minh City'},
      {name:'Ha Long', city:'Ha Long Bay'},
      {name:'Da Nang', city:'Da Nang'},
      {name:'Sapa', city:'Sapa'}
    ],
    'Philippines': [
      {name:'Manila', city:'Manila'},
      {name:'Cebu', city:'Cebu'},
      {name:'Palawan', city:'Palawan'},
      {name:'Boracay', city:'Boracay'}
    ],
    'Malaysia': [
      {name:'Kuala Lumpur', city:'Kuala Lumpur'},
      {name:'Penang', city:'Penang'},
      {name:'Malacca', city:'Malacca'},
      {name:'Cameron Highlands', city:'Cameron Highlands'}
    ],
    'Cambodia': [
      {name:'Siem Reap', city:'Siem Reap'},
      {name:'Phnom Penh', city:'Phnom Penh'},
      {name:'Sihanoukville', city:'Sihanoukville'}
    ],
    'Myanmar': [
      {name:'Yangon', city:'Yangon'},
      {name:'Mandalay', city:'Mandalay'},
      {name:'Bagan', city:'Bagan'}
    ],
    'Singapore': [
      {name:'Singapore', city:'Singapore'}
    ]
  };

  let id = 1;
  Object.entries(destinations_by_country).forEach(([country, cities]) => {
    cities.forEach((loc, cityIdx) => {

      Object.entries(categoryData).forEach(([category, stats]) => {
        const names = destinationNamesByCategory[category] || ['Destination ' + id];
        const nameIdx = (cityIdx + id) % names.length;
        const name = names[nameIdx];
        
        const variation = 0.8 + Math.random() * 0.4;
        destinations.push({
          location: name,
          city: loc.name,
          country: country,
          category: category,
          visitors: Math.round(stats.visitors * variation),
          rating: 3.5 + Math.random() * 1.5,
          revenue: Math.round(stats.revenue * variation),
          accommodation: Math.random() > 0.3 ? 'Yes' : 'No',
          device_preference: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
          location_preference: ['urban', 'suburban', 'rural'][Math.floor(Math.random() * 3)],
          engagement_time: Math.floor(Math.random() * 60) + 10,
          social_followers: Math.floor(Math.random() * 50000) + 1000,
          decade: ['2000s', '2010s', '2020s'][Math.floor(Math.random() * 3)]
        });
        id++;
      });
    });
  });

  return destinations;
}



const server = http.createServer((req, res) => {
  const requestedUrl = req.url.split('?')[0];

  if (requestedUrl === '/tourism-data') {
    // Read pivot dataset
    fs.readFile(pivotDatasetPath, 'utf8', (err, pivotCsv) => {
      if (err) {
        console.error('Error reading pivot dataset:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Pivot dataset tidak dapat dimuat.' }));
      }
      
      try {
        const categoryData = parsePivotDataset(pivotCsv);
        const destinations = generateDestinationsFromPivot(categoryData);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(destinations));
      } catch (error) {
        console.error('Error processing pivot dataset:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Error processing dataset' }));
      }
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
