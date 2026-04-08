// ============================
// DATA (from CSV analysis)
// ============================
const DEFAULT_DATA = [
  {location:"Sunway Lagoon",country:"Malaysia",category:"Entertainment",visitors:948853,rating:4.9,revenue:8438838000,accommodation:"Yes"},
  {location:"Petronas Twin Towers",country:"Malaysia",category:"Historical",visitors:813627,rating:4.8,revenue:8026256000,accommodation:"No"},
  {location:"Angkor Wat",country:"Cambodia",category:"Historical",visitors:508673,rating:4.8,revenue:33877711000,accommodation:"Yes"},
  {location:"Ha Long Bay",country:"Vietnam",category:"Nature",visitors:623329,rating:4.7,revenue:2951836000,accommodation:"Yes"},
  {location:"Mount Bromo",country:"Indonesia",category:"Nature",visitors:421500,rating:4.7,revenue:1200000000,accommodation:"Yes"},
  {location:"Batu Caves",country:"Malaysia",category:"Cultural",visitors:380000,rating:4.6,revenue:950000000,accommodation:"No"},
  {location:"Phuket Beach",country:"Thailand",category:"Nature",visitors:1200000,rating:4.6,revenue:5500000000,accommodation:"Yes"},
  {location:"Borobudur Temple",country:"Indonesia",category:"Historical",visitors:520000,rating:4.8,revenue:1800000000,accommodation:"Yes"},
  {location:"Gardens by the Bay",country:"Singapore",category:"Entertainment",visitors:750000,rating:4.7,revenue:3200000000,accommodation:"No"},
  {location:"Sentosa Island",country:"Singapore",category:"Entertainment",visitors:890000,rating:4.5,revenue:4100000000,accommodation:"Yes"},
  {location:"Komodo Island",country:"Indonesia",category:"Nature",visitors:175000,rating:4.9,revenue:890000000,accommodation:"Yes"},
  {location:"Tanah Lot",country:"Indonesia",category:"Cultural",visitors:430000,rating:4.6,revenue:1100000000,accommodation:"No"},
  {location:"Prambanan Temple",country:"Indonesia",category:"Historical",visitors:385000,rating:4.7,revenue:980000000,accommodation:"Yes"},
  {location:"Raja Ampat",country:"Indonesia",category:"Nature",visitors:95000,rating:4.9,revenue:620000000,accommodation:"Yes"},
  {location:"Ubud Monkey Forest",country:"Indonesia",category:"Nature",visitors:210000,rating:4.3,revenue:450000000,accommodation:"No"},
  {location:"Dieng Plateau",country:"Indonesia",category:"Nature",visitors:165000,rating:4.5,revenue:380000000,accommodation:"Yes"},
  {location:"Keraton Yogyakarta",country:"Indonesia",category:"Cultural",visitors:340000,rating:4.6,revenue:720000000,accommodation:"No"},
  {location:"Malioboro Street",country:"Indonesia",category:"Cultural",visitors:580000,rating:4.4,revenue:890000000,accommodation:"Yes"},
  {location:"Kawah Ijen",country:"Indonesia",category:"Nature",visitors:145000,rating:4.8,revenue:320000000,accommodation:"Yes"},
  {location:"Taman Mini Indonesia",country:"Indonesia",category:"Entertainment",visitors:620000,rating:4.2,revenue:1200000000,accommodation:"Yes"},
  {location:"Dufan Jakarta",country:"Indonesia",category:"Entertainment",visitors:540000,rating:4.3,revenue:1500000000,accommodation:"No"},
  {location:"Monas Jakarta",country:"Indonesia",category:"Historical",visitors:480000,rating:4.5,revenue:750000000,accommodation:"No"},
  {location:"Kota Tua Jakarta",country:"Indonesia",category:"Historical",visitors:390000,rating:4.4,revenue:580000000,accommodation:"No"},
  {location:"Ancol Beach",country:"Indonesia",category:"Entertainment",visitors:720000,rating:4.1,revenue:1800000000,accommodation:"Yes"},
  {location:"Bandung Tea Plantation",country:"Indonesia",category:"Nature",visitors:280000,rating:4.6,revenue:420000000,accommodation:"Yes"},
  {location:"Tangkuban Perahu",country:"Indonesia",category:"Nature",visitors:195000,rating:4.4,revenue:310000000,accommodation:"Yes"},
  {location:"Trans Studio Bandung",country:"Indonesia",category:"Entertainment",visitors:450000,rating:4.2,revenue:980000000,accommodation:"No"},
  {location:"Surabaya Zoo",country:"Indonesia",category:"Entertainment",visitors:320000,rating:3.8,revenue:450000000,accommodation:"No"},
  {location:"House of Sampoerna",country:"Indonesia",category:"Historical",visitors:145000,rating:4.5,revenue:220000000,accommodation:"No"},
  {location:"Lawang Sewu Semarang",country:"Indonesia",category:"Historical",visitors:210000,rating:4.6,revenue:380000000,accommodation:"No"},
  {location:"Sam Poo Kong Temple",country:"Indonesia",category:"Cultural",visitors:175000,rating:4.5,revenue:290000000,accommodation:"No"},
];

let CSV_DATA = [...DEFAULT_DATA];
let filteredData = [...CSV_DATA];
let charts = {};
let currentPage = 1;
const ROWS_PER_PAGE = 10;

const DATA_ENDPOINT = '/tourism-data';

async function loadDataset() {
  try {
    const response = await fetch(DATA_ENDPOINT);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Response dataset bukan array');
    CSV_DATA = data.map(item => ({
      location: item.location || '',
      country: item.country || '',
      category: item.category || '',
      visitors: Number(item.visitors) || 0,
      rating: Number(item.rating) || 0,
      revenue: Number(item.revenue) || 0,
      accommodation: item.accommodation || ''
    }));
  } catch (error) {
    console.error('Gagal memuat dataset CSV:', error);
    CSV_DATA = [...DEFAULT_DATA];
    showToast('Gagal memuat file CSV, menggunakan dataset default.');
  }
  filteredData = [...CSV_DATA];
}

// ============================
// NAVIGATION
// ============================
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const idx = {home:0, dashboard:1, pipeline:2};
  document.querySelectorAll('.nav-link')[idx[page]]?.classList.add('active');
  window.scrollTo(0, 0);

  if (page === 'dashboard') {
    setTimeout(() => {
      initCharts();
      animateBars();
      updateLastUpdate();
    }, 100);
  }
  if (page === 'home') {
    setTimeout(() => {
      drawHeroMap();
      runCountUps();
    }, 200);
  }
  if (page === 'pipeline') {
    setTimeout(runCountUps, 300);
  }
  setTimeout(revealElements, 100);
}

function filterCity(city) {
  showPage('dashboard');
  setTimeout(() => {
    document.getElementById('cityFilter').value = city;
    applyFilters();
  }, 300);
}

// ============================
// SIDEBAR VIEWS
// ============================
function switchSidebar(view) {
  ['dashboard','map','analytics','table'].forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.style.display = v === view ? 'block' : 'none';
    const sb = document.getElementById('sb-' + v);
    if (sb) sb.classList.toggle('active', v === view);
  });

  if (view === 'map') setTimeout(drawMapView, 100);
  if (view === 'analytics') setTimeout(initAnalyticsCharts, 100);
  if (view === 'table') renderTable();
}

// ============================
// LIVE CLOCK
// ============================
function startClock() {
  function tick() {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    document.getElementById('live-clock').textContent =
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
  tick();
  setInterval(tick, 1000);
}

function updateLastUpdate() {
  const lastUpdate = document.getElementById('last-update');
  if (!lastUpdate) return;
  const now = new Date();
  lastUpdate.textContent = `Terakhir diperbarui: ${now.toLocaleTimeString('id-ID')}`;
}

// ============================
// FILTERS
// ============================
function applyFilters() {
  const city = document.getElementById('cityFilter').value;
  const cat = document.getElementById('catFilter').value;
  const minRating = parseFloat(document.getElementById('ratingFilter').value);

  filteredData = CSV_DATA.filter(d => {
    if (city !== 'all' && !d.location.toLowerCase().includes(city.toLowerCase()) && !d.country.toLowerCase().includes(city.toLowerCase())) return false;
    if (cat !== 'all' && d.category !== cat) return false;
    if (d.rating < minRating) return false;
    return true;
  });

  updateKPIs();
  updateCharts();
  showToast(`Filter diterapkan — ${filteredData.length} destinasi`);
}

function resetFilters() {
  document.getElementById('cityFilter').value = 'all';
  document.getElementById('catFilter').value = 'all';
  document.getElementById('ratingFilter').value = '1';
  document.getElementById('ratingVal').textContent = '1.0';
  filteredData = [...CSV_DATA];
  updateKPIs();
  updateCharts();
  showToast('Filter direset');
}

// ============================
// KPI UPDATE
// ============================
function updateKPIs() {
  document.getElementById('kpi-total').textContent = filteredData.length;

  const avgRating = (filteredData.reduce((s,d) => s+d.rating, 0) / filteredData.length).toFixed(1);
  document.getElementById('kpi-rating').textContent = avgRating + '★';

  const cats = {};
  filteredData.forEach(d => cats[d.category] = (cats[d.category]||0)+1);
  const topCat = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
  document.getElementById('kpi-cat').textContent = topCat ? topCat[0] : '—';

  const totalRev = filteredData.reduce((s,d) => s+d.revenue, 0);
  const fmt = totalRev >= 1e12 ? (totalRev/1e12).toFixed(1)+'T' : (totalRev/1e9).toFixed(1)+'B';
  document.getElementById('kpi-rev').textContent = '$' + fmt;
}

// ============================
// CHARTS
// ============================
function initCharts() {
  if (charts.city) return; // already initialized
  renderCityChart();
  renderCatChart();
  renderRatingChart();
  renderBarList();
}

function updateCharts() {
  renderCityChart(true);
  renderCatChart(true);
  renderRatingChart(true);
  renderBarList();
}

function catColors() {
  return {
    Nature: '#0c9a6e', Historical: '#c9a227', Cultural: '#1a4fd4',
    Entertainment: '#e8421a', Other: '#7a7668'
  };
}

function renderCityChart(update) {
  const cityCount = {};
  filteredData.forEach(d => {
    // map location to city for Indonesian data
    const city = getCity(d);
    cityCount[city] = (cityCount[city]||0)+1;
  });
  const labels = Object.keys(cityCount);
  const values = Object.values(cityCount);
  const colors = ['#1a4fd4','#c9a227','#0c9a6e','#e8421a','#5c3d8a','#0a9aae','#8a3d5c'];

  const ctx = document.getElementById('cityChart').getContext('2d');
  if (update && charts.city) {
    charts.city.data.labels = labels;
    charts.city.data.datasets[0].data = values;
    charts.city.update('active');
    return;
  }
  if (charts.city) charts.city.destroy();
  charts.city = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Jumlah Destinasi',
        data: values,
        backgroundColor: colors,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} destinasi` } } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'Arial, sans-serif', size: 12 } } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Arial, sans-serif', size: 11 } } }
      },
      animation: { duration: 800, easing: 'easeInOutQuart' }
    }
  });
}

function getCity(d) {
  const loc = d.location.toLowerCase();
  if (loc.includes('jakarta') || loc.includes('monas') || loc.includes('ancol') || loc.includes('kota tua') || loc.includes('dufan') || loc.includes('taman mini')) return 'Jakarta';
  if (loc.includes('yogyakarta') || loc.includes('malioboro') || loc.includes('keraton') || loc.includes('prambanan') || loc.includes('borobudur')) return 'Yogyakarta';
  if (loc.includes('bandung') || loc.includes('trans studio') || loc.includes('tangkuban') || loc.includes('tea plantation')) return 'Bandung';
  if (loc.includes('surabaya') || loc.includes('sampoerna')) return 'Surabaya';
  if (loc.includes('semarang') || loc.includes('lawang sewu') || loc.includes('sam poo')) return 'Semarang';
  if (d.country === 'Indonesia') return 'Lainnya (Indonesia)';
  return d.country;
}

function renderCatChart(update) {
  const cats = {};
  filteredData.forEach(d => cats[d.category] = (cats[d.category]||0)+1);
  const labels = Object.keys(cats);
  const values = Object.values(cats);
  const cc = catColors();
  const colors = labels.map(l => cc[l]||cc.Other);

  const ctx = document.getElementById('catChart').getContext('2d');
  if (update && charts.cat) {
    charts.cat.data.labels = labels;
    charts.cat.data.datasets[0].data = values;
    charts.cat.data.datasets[0].backgroundColor = colors;
    charts.cat.update('active');
    return;
  }
  if (charts.cat) charts.cat.destroy();
  charts.cat = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 8 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { family: 'Arial, sans-serif', size: 12 }, boxWidth: 12, borderRadius: 6 } }
      },
      animation: { animateRotate: true, duration: 1000 }
    }
  });
}

function renderRatingChart(update) {
  const buckets = {'1.0-2.0':0,'2.0-3.0':0,'3.0-4.0':0,'4.0-4.5':0,'4.5-5.0':0};
  filteredData.forEach(d => {
    if (d.rating < 2) buckets['1.0-2.0']++;
    else if (d.rating < 3) buckets['2.0-3.0']++;
    else if (d.rating < 4) buckets['3.0-4.0']++;
    else if (d.rating < 4.5) buckets['4.0-4.5']++;
    else buckets['4.5-5.0']++;
  });

  const ctx = document.getElementById('ratingChart').getContext('2d');
  if (update && charts.rating) {
    charts.rating.data.datasets[0].data = Object.values(buckets);
    charts.rating.update('active');
    return;
  }
  if (charts.rating) charts.rating.destroy();
  charts.rating = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(buckets),
      datasets: [{
        label: 'Jumlah Destinasi',
        data: Object.values(buckets),
        backgroundColor: ['#e8421a','#c9a227','#0a9aae','#1a4fd4','#0c9a6e'],
        borderRadius: 8, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { family: 'monospace', size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 1, font: { family: 'Arial, sans-serif', size: 11 } } }
      },
      animation: { duration: 800 }
    }
  });
}

function renderBarList() {
  const sorted = [...filteredData].sort((a,b) => b.rating - a.rating).slice(0,6);
  const maxV = sorted[0]?.rating || 5;
  const container = document.getElementById('barList');
  container.innerHTML = sorted.map(d => `
    <div class="bar-item">
      <div class="bar-meta">
        <span class="bar-name">${d.location}</span>
        <span class="bar-val">${d.rating.toFixed(1)}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" data-width="${(d.rating/maxV*100).toFixed(0)}%"></div>
      </div>
    </div>
  `).join('');
  setTimeout(animateBars, 100);
}

function animateBars() {
  document.querySelectorAll('.bar-fill').forEach(bar => {
    const w = bar.getAttribute('data-width');
    bar.style.width = w;
  });
}

// Analytics Charts
function initAnalyticsCharts() {
  renderAccomChart();
  renderRevChart();
}

function renderAccomChart() {
  const yes = filteredData.filter(d => d.accommodation === 'Yes').length;
  const no = filteredData.length - yes;
  const ctx = document.getElementById('accomChart').getContext('2d');
  if (charts.accom) charts.accom.destroy();
  charts.accom = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Tersedia', 'Tidak Tersedia'],
      datasets: [{ data: [yes, no], backgroundColor: ['#0c9a6e','#e8421a'], borderWidth: 0, hoverOffset: 8 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { family: 'Arial, sans-serif' }, padding: 20, boxWidth: 14, borderRadius: 4 } } }
    }
  });
}

function renderRevChart() {
  const revByCat = {};
  filteredData.forEach(d => revByCat[d.category] = (revByCat[d.category]||0) + d.revenue);
  const labels = Object.keys(revByCat);
  const values = labels.map(l => +(revByCat[l]/1e9).toFixed(1));
  const cc = catColors();

  const ctx = document.getElementById('revChart').getContext('2d');
  if (charts.rev) charts.rev.destroy();
  charts.rev = new Chart(ctx, {
    type: 'bar',
    data: {
      labels, datasets: [{
        label: 'Revenue (Billion USD)',
        data: values, backgroundColor: labels.map(l => cc[l]||cc.Other),
        borderRadius: 10, borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` $${c.raw}B` } } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { callback: v => '$'+v+'B', font: { family: 'monospace', size: 11 } } },
        y: { grid: { display: false }, ticks: { font: { family: 'Arial, sans-serif', size: 12 } } }
      }
    }
  });
}

// ============================
// DATA TABLE
// ============================
function renderTable() {
  currentPage = 1;
  renderTablePage();
}

function renderTablePage() {
  const start = (currentPage-1)*ROWS_PER_PAGE;
  const rows = filteredData.slice(start, start+ROWS_PER_PAGE);
  document.getElementById('tableCount').textContent = `Menampilkan ${start+1}–${Math.min(start+ROWS_PER_PAGE, filteredData.length)} dari ${filteredData.length} destinasi`;

  const catClass = {Nature:'badge-nature', Historical:'badge-historical', Cultural:'badge-cultural', Entertainment:'badge-other'};
  const body = document.getElementById('tableBody');
  body.innerHTML = rows.map((d,i) => `
    <tr>
      <td style="color:var(--muted); font-size:0.75rem; font-family:monospace;">${start+i+1}</td>
      <td style="font-weight:600;">${d.location}</td>
      <td>${d.country}</td>
      <td><span class="badge ${catClass[d.category]||'badge-other'}">${d.category}</span></td>
      <td class="mono">${d.visitors.toLocaleString()}</td>
      <td><span class="rating-star">★</span> ${d.rating.toFixed(1)}</td>
      <td class="mono" style="font-size:0.8rem;">$${(d.revenue/1e9).toFixed(2)}B</td>
      <td><span style="color:${d.accommodation==='Yes'?'var(--accent3)':'var(--muted)'}; font-weight:600;">${d.accommodation==='Yes'?'✓ Ya':'✗ Tidak'}</span></td>
    </tr>
  `).join('');

  // Pagination
  const totalPages = Math.ceil(filteredData.length/ROWS_PER_PAGE);
  const pag = document.getElementById('tablePagination');
  pag.innerHTML = '';
  for(let p=1; p<=totalPages; p++) {
    const btn = document.createElement('button');
    btn.textContent = p;
    btn.className = 'filter-btn';
    btn.style.cssText = `padding:6px 14px; font-size:0.8rem; background:${p===currentPage?'var(--accent)':'var(--cream)'}; color:${p===currentPage?'#fff':'var(--ink)'};`;
    btn.onclick = () => { currentPage = p; renderTablePage(); };
    pag.appendChild(btn);
  }
}

// ============================
// MAP CANVAS (Hero)
// ============================
function drawHeroMap() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 400;
  canvas.height = canvas.offsetHeight || 400;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Background
  ctx.clearRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for(let x=0; x<W; x+=40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0; y<H; y+=40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  // City dots
  const cities = [
    {name:'Jakarta', x:0.32, y:0.55, count:124, color:'#1a4fd4'},
    {name:'Bandung', x:0.30, y:0.60, count:78, color:'#0c9a6e'},
    {name:'Semarang', x:0.45, y:0.52, count:64, color:'#5c3d8a'},
    {name:'Yogyakarta', x:0.43, y:0.58, count:89, color:'#c9a227'},
    {name:'Surabaya', x:0.55, y:0.52, count:82, color:'#e8421a'},
  ];

  // Draw connections
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for(let i=0; i<cities.length; i++) {
    for(let j=i+1; j<cities.length; j++) {
      ctx.beginPath();
      ctx.moveTo(cities[i].x*W, cities[i].y*H);
      ctx.lineTo(cities[j].x*W, cities[j].y*H);
      ctx.stroke();
    }
  }

  // Draw dots
  cities.forEach(c => {
    const x = c.x*W, y = c.y*H;
    const r = 6 + c.count/25;

    // Glow
    const grd = ctx.createRadialGradient(x,y,0,x,y,r*3);
    grd.addColorStop(0, c.color+'66');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, r*3, 0, Math.PI*2);
    ctx.fill();

    // Dot
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `600 10px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(c.name, x, y + r + 14);
  });

  // Animate the canvas
  animateHeroMap(ctx, W, H, cities);
}

let heroAnimFrame;
let heroTick = 0;
function animateHeroMap(ctx, W, H, cities) {
  cancelAnimationFrame(heroAnimFrame);
  function draw() {
    heroTick++;
    ctx.clearRect(0,0,W,H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let x=0; x<W; x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0; y<H; y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Connections
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for(let i=0;i<cities.length;i++){for(let j=i+1;j<cities.length;j++){
      ctx.beginPath();ctx.moveTo(cities[i].x*W,cities[i].y*H);ctx.lineTo(cities[j].x*W,cities[j].y*H);ctx.stroke();
    }}

    // Dots with pulse
    cities.forEach((c,idx) => {
      const x=c.x*W, y=c.y*H;
      const pulse = Math.sin(heroTick*0.04 + idx) * 0.5 + 0.5;
      const r = 6 + c.count/25;

      // Pulse ring
      ctx.strokeStyle = c.color + '44';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x,y, r + pulse*14, 0, Math.PI*2);
      ctx.stroke();

      // Glow
      const grd = ctx.createRadialGradient(x,y,0,x,y,r*3);
      grd.addColorStop(0, c.color+'55');
      grd.addColorStop(1,'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();ctx.arc(x,y,r*3,0,Math.PI*2);ctx.fill();

      ctx.fillStyle = c.color;
      ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = "600 10px Arial, sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText(c.name, x, y+r+14);
    });

    heroAnimFrame = requestAnimationFrame(draw);
  }
  draw();
}

// ============================
// MAP VIEW (Dashboard)
// ============================
function drawMapView() {
  const canvas = document.getElementById('mapViewCanvas');
  if (!canvas) return;
  canvas.width = canvas.offsetWidth || 800;
  canvas.height = 440;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  ctx.fillStyle = '#0a0f1e';
  ctx.fillRect(0,0,W,H);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  for(let x=0;x<W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // Title label
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = "500 12px Arial, sans-serif";
  ctx.fillText('▶ Peta Interaktif — Sebaran Destinasi Wisata Indonesia', 16, 28);

  const cities = [
    {name:'Jakarta',x:0.28,y:0.55,count:124,color:'#1a4fd4'},
    {name:'Bandung',x:0.26,y:0.64,count:78,color:'#0c9a6e'},
    {name:'Semarang',x:0.42,y:0.50,count:64,color:'#5c3d8a'},
    {name:'Yogyakarta',x:0.40,y:0.60,count:89,color:'#c9a227'},
    {name:'Surabaya',x:0.56,y:0.50,count:82,color:'#e8421a'},
  ];

  // Filter city highlight
  const selectedCity = document.getElementById('cityFilter').value;

  cities.forEach((c,idx) => {
    const x=c.x*W, y=c.y*H;
    const r = 8 + c.count/20;
    const highlighted = selectedCity === 'all' || c.name === selectedCity;

    if (!highlighted) {
      ctx.globalAlpha = 0.2;
    }

    // Connections to others
    if (highlighted) {
      cities.forEach(c2 => {
        ctx.strokeStyle = c.color+'22';
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(c2.x*W,c2.y*H);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Glow
    const grd = ctx.createRadialGradient(x,y,0,x,y,r*4);
    grd.addColorStop(0, c.color+'66');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();ctx.arc(x,y,r*4,0,Math.PI*2);ctx.fill();

    ctx.fillStyle = c.color;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();

    // Count ring
    ctx.strokeStyle = c.color;
    ctx.lineWidth = 2;
    ctx.beginPath();ctx.arc(x,y,r+8,0,Math.PI*2);ctx.stroke();

    // Labels
    ctx.fillStyle = '#fff';
    ctx.font = "700 13px Arial, sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(c.name, x, y-r-12);

    ctx.fillStyle = c.color;
    ctx.font = "600 11px monospace";
    ctx.fillText(c.count + ' destinasi', x, y-r-28);

    ctx.globalAlpha = 1;
  });

  // Legend
  const legendX = W - 200, legendY = H - 140;
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.roundRect(legendX, legendY, 180, 120, 12);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = "600 10px Arial, sans-serif";
  ctx.textAlign = 'left';
  ctx.fillText('LEGENDA', legendX+14, legendY+20);

  cities.forEach((c,i) => {
    ctx.fillStyle = c.color;
    ctx.beginPath();ctx.arc(legendX+22, legendY+36+i*18, 5, 0, Math.PI*2);ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = "500 10px Arial, sans-serif";
    ctx.fillText(`${c.name} (${c.count})`, legendX+34, legendY+40+i*18);
  });
}

// ============================
// COUNT-UP ANIMATION
// ============================
function runCountUps() {
  document.querySelectorAll('.count-up').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const duration = 1200;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
  });
}

// ============================
// SCROLL REVEAL
// ============================
function revealElements() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ============================
// TOAST
// ============================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ============================
// REAL-TIME SIMULATION
// ============================
function startRealtimeSimulation() {
  setInterval(() => {
    const kpiRev = document.getElementById('kpi-rev');
    if (kpiRev) {
      const base = 8.2 + (Math.random()-0.5)*0.4;
      kpiRev.textContent = '$' + base.toFixed(1) + 'B';
    }
    updateLastUpdate();
  }, 5000);
}

function getQueryParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

function getPageType() {
  return document.body.dataset.page || '';
}

// ============================
// INIT
// ============================
window.addEventListener('DOMContentLoaded', async () => {
  await loadDataset();
  startClock();
  revealElements();
  startRealtimeSimulation();

  const pageType = getPageType();
  const params = getQueryParams();

  if (pageType === 'home') {
    runCountUps();
    drawHeroMap();
  }

  if (pageType === 'dashboard') {
    switchSidebar('dashboard');
    initCharts();
    animateBars();
    updateLastUpdate();
    if (params.city) {
      document.getElementById('cityFilter').value = params.city;
      applyFilters();
    } else {
      updateKPIs();
    }
  }

  if (pageType === 'pipeline') {
    runCountUps();
  }

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x,y,w,h,r) {
      this.beginPath();
      this.moveTo(x+r,y);
      this.lineTo(x+w-r,y);
      this.quadraticCurveTo(x+w,y,x+w,y+r);
      this.lineTo(x+w,y+h-r);
      this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      this.lineTo(x+r,y+h);
      this.quadraticCurveTo(x,y+h,x,y+h-r);
      this.lineTo(x,y+r);
      this.quadraticCurveTo(x,y,x+r,y);
      this.closePath();
      return this;
    };
  }
});
