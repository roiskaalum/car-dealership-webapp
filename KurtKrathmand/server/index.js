const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const ADMIN_PATH = path.join(DATA_DIR, 'admin.json');

const publicDir = path.join(__dirname, '..', 'public');

fs.mkdirSync(DATA_DIR, { recursive: true });

const defaultConfig = {
  siteTitle: 'Krathmand',
  logoUrl: '/assets/logo.jpg',
  primaryColor: '#123f79',
  secondaryColor: '#1e88e5',
  background: '#f4f7fb',
  backgroundAlt: '#edf3fb',
  panel: '#ffffff',
  text: '#111827',
  textSoft: '#53627a',
  border: 'rgba(15, 23, 42, 0.12)',
  darkBackground: '#0f172a',
  darkPanel: '#152333',
  darkText: '#edf3ff',
  darkTextSoft: '#a7b7cf',
  darkBorder: 'rgba(148, 163, 184, 0.18)',
  homeHeroTitle: 'Find den rette bil hos Krathmand',
  homeHeroText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre. Vi tilbyder et velholdt udvalg af brugte biler og personlig service med fokus på ærlighed, kvalitet og en god oplevelse fra første kontakt til købesummering.',
  homeAboutHeading: 'Vi har altid ca. 25 biler på lager',
  homeAboutText: 'Krathmand er kendt for at kombinere mange års erfaring med personlig service, som gør det nemt at finde den rigtige bil. Vi arbejder med et bredt udvalg af kvalitetsbiler og hjælper dig fra første spørgsmål til den afsluttende aftale.',
  serviceTitle1: 'Lav gerne en aftale i forvejen',
  serviceText1: 'Det er altid en god idé at ringe i forvejen, inden du besøger os. Då vi kan sikre, at vi har åbent, er klar til at tage imod dig og kan give dig tiden og den service, du fortjener.',
  serviceTitle2: 'Vi guider dig til den rigtige bil',
  serviceText2: 'Uanset om du vil have en lille bybil, en praktisk familiebil, en meget økonomisk diesel eller en moderne elbil, så hjælper vi med at finde en løsning, der passer til dit behov.',
  contactSectionTitle: 'Kontakt os',
  contactSectionText: 'Vi er altid klar til at hjælpe dig med at finde den rigtige bil til dig og din hverdag.',
  contactPhone: '+45 86 62 85 45',
  contactEmail: 'kurt@krathmand.dk',
  contactAddress: 'Fabrikvej 1 8800 Viborg',
  contactHours: 'Efter aftale',
  ownerName: 'Kurt Krathmand',
  ownerPhoto: 'https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=612x612&w=is&k=20&c=-Jq_6tAjuYieAjOB5B1CyUXSrD_tKE3IKZwVGIjn8-8=',
  aboutHeading: 'Krathmand',
  aboutText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre.\n\nFirmaet har mange års erfaring og har samarbejde med finansieringsselskaber, så drømmebilen kan blive en realitet.\n\nVi fremskaffer også biler ud fra bestemte ønsker, så giv et ring på 40 15 90 45.',
  bannerTitle: 'Kvalitetsbiler til Alle',
  bannerText: 'Udforsk udvalget af biler tilgængelige på BilInfo.',
  apiMode: 'offline',
  apiUrl: '',
  apiUsername: '',
  apiPassword: ''
};

function ensureConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2));
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ensureConfigFile();

app.use(express.json());
app.use(session({
  secret: 'kurt-krathmand-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

app.use(express.static(publicDir));

function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminLoggedIn) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

app.get('/api/config', (req, res) => {
  const config = readJson(CONFIG_PATH, defaultConfig);
  res.json({ ok: true, config });
});

app.post('/api/config', requireAuth, (req, res) => {
  const current = readJson(CONFIG_PATH, defaultConfig);
  const next = { ...current, ...req.body };
  writeJson(CONFIG_PATH, next);
  res.json({ ok: true, config: next });
});

app.get('/api/admin/status', (req, res) => {
  const adminExists = fs.existsSync(ADMIN_PATH);
  res.json({ ok: true, adminExists, loggedIn: !!(req.session && req.session.adminLoggedIn) });
});

app.post('/api/admin/create-first', (req, res) => {
  if (fs.existsSync(ADMIN_PATH)) {
    return res.status(409).json({ ok: false, error: 'Admin already exists.' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Username and password are required.' });
  }

  const passwordHash = Buffer.from(String(password)).toString('base64');
  writeJson(ADMIN_PATH, { username, passwordHash, createdAt: new Date().toISOString() });
  req.session.adminLoggedIn = true;
  req.session.adminUsername = username;
  return res.json({ ok: true, message: 'Admin created.' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, error: 'Username and password are required.' });
  }

  if (!fs.existsSync(ADMIN_PATH)) {
    return res.status(404).json({ ok: false, error: 'No admin configured. Create the first admin.' });
  }

  const admin = readJson(ADMIN_PATH, null);
  const expectedHash = Buffer.from(String(password)).toString('base64');

  if (admin && admin.username === username && admin.passwordHash === expectedHash) {
    req.session.adminLoggedIn = true;
    req.session.adminUsername = username;
    return res.json({ ok: true, message: 'Logged in.' });
  }

  return res.status(401).json({ ok: false, error: 'Invalid username or password.' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Logged out.' });
  });
});

app.post('/api/admin/reset', (req, res) => {
  if (fs.existsSync(ADMIN_PATH)) {
    fs.unlinkSync(ADMIN_PATH);
  }
  if (req.session) {
    req.session.destroy(() => {});
  }
  res.json({ ok: true, message: 'Admin reset. Next login will create a new admin.' });
});

app.get('/admin', (req, res) => {
  if (req.session && req.session.adminLoggedIn) {
    return res.sendFile(path.join(publicDir, 'dashboard.html'));
  }
  return res.redirect('/login.html');
});

app.get('/dashboard', (req, res) => {
  if (req.session && req.session.adminLoggedIn) {
    return res.sendFile(path.join(publicDir, 'dashboard.html'));
  }
  return res.redirect('/login.html');
});

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.adminLoggedIn) {
    return res.redirect('/dashboard');
  }
  return res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.adminLoggedIn) {
    return res.redirect('/dashboard');
  }
  return res.sendFile(path.join(publicDir, 'login.html'));
});

app.get('/biler', (req, res) => {
  res.redirect('/biler.html');
});

app.get('/om-os-kontakt', (req, res) => {
  res.redirect('/om-os-kontakt.html');
});

app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

app.get('/partials/header', (req, res) => {
  res.sendFile(path.join(publicDir, 'partials', 'header.html'));
});

app.get('/partials/footer', (req, res) => {
  res.sendFile(path.join(publicDir, 'partials', 'footer.html'));
});

app.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {});
  }
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Krathmand app listening at http://localhost:${PORT}`);
});
