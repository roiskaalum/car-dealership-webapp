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

const starterCars = [
  { id: 'demo-audi-a4', brand: 'Audi', model: 'A4', year: 2021, price: 285000, fuel: 'benzin', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { id: 'demo-bmw-320d', brand: 'BMW', model: '320d', year: 2020, price: 265000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', badge: 'Premium' },
  { id: 'demo-vw-golf', brand: 'Volkswagen', model: 'Golf', year: 2022, price: 220000, fuel: 'hybrid', doors: 'door-4', transmission: 'aut', type: 'hatchback', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { id: 'demo-volvo-xc60', brand: 'Volvo', model: 'XC60', year: 2019, price: 340000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'suv', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', badge: 'SUV' },
  { id: 'demo-peugeot-2008', brand: 'Peugeot', model: '2008', year: 2017, price: 64900, fuel: 'diesel', doors: 'door-4', transmission: 'man', type: 'suv', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', badge: 'Tilbud' },
  { id: 'demo-tesla-model3', brand: 'Tesla', model: 'Model 3', year: 2022, price: 289900, fuel: 'electric', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', badge: 'Elbil' }
];

let appConfig = { ...defaultConfig };
let cars = [...starterCars];
let currentPage = document.body.dataset.page || 'home';

async function fetchJson(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers });
  return response.json();
}

async function loadConfig() {
  try {
    const result = await fetchJson('/api/config');
    if (result && result.ok && result.config) {
      appConfig = { ...defaultConfig, ...result.config };
    }
  } catch (error) {
    console.warn('Could not load config from backend, using default config.', error);
    appConfig = { ...defaultConfig };
  }
}

function applyConfig() {
  document.documentElement.style.setProperty('--primary', appConfig.primaryColor || '#123f79');
  document.documentElement.style.setProperty('--primary-dark', appConfig.primaryColor || '#0d2d5d');
  document.documentElement.style.setProperty('--accent', appConfig.secondaryColor || '#1e88e5');
  document.documentElement.style.setProperty('--bg', appConfig.background || '#f4f7fb');
  document.documentElement.style.setProperty('--bg-alt', appConfig.backgroundAlt || '#edf3fb');
  document.documentElement.style.setProperty('--panel', appConfig.panel || '#ffffff');
  document.documentElement.style.setProperty('--text', appConfig.text || '#111827');
  document.documentElement.style.setProperty('--text-soft', appConfig.textSoft || '#53627a');
  document.documentElement.style.setProperty('--border', appConfig.border || 'rgba(15, 23, 42, 0.12)');
  document.documentElement.style.setProperty('--dark-bg', appConfig.darkBackground || '#0f172a');
  document.documentElement.style.setProperty('--dark-panel', appConfig.darkPanel || '#152333');
  document.documentElement.style.setProperty('--dark-text', appConfig.darkText || '#edf3ff');
  document.documentElement.style.setProperty('--dark-text-soft', appConfig.darkTextSoft || '#a7b7cf');
  document.documentElement.style.setProperty('--dark-border', appConfig.darkBorder || 'rgba(148, 163, 184, 0.18)');

  const ids = ['siteTitle', 'homeHeroTitle', 'homeHeroText', 'homeAboutHeading', 'homeAboutText', 'serviceTitle1', 'serviceText1', 'serviceTitle2', 'serviceText2', 'contactSectionTitle', 'contactSectionText', 'contactAddress', 'contactHours', 'ownerName', 'aboutHeading', 'aboutText', 'bannerTitle', 'bannerText', 'footerBrand'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const valueMap = {
      siteTitle: appConfig.siteTitle,
      homeHeroTitle: appConfig.homeHeroTitle,
      homeHeroText: appConfig.homeHeroText,
      homeAboutHeading: appConfig.homeAboutHeading,
      homeAboutText: appConfig.homeAboutText,
      serviceTitle1: appConfig.serviceTitle1,
      serviceText1: appConfig.serviceText1,
      serviceTitle2: appConfig.serviceTitle2,
      serviceText2: appConfig.serviceText2,
      contactSectionTitle: appConfig.contactSectionTitle,
      contactSectionText: appConfig.contactSectionText,
      contactAddress: appConfig.contactAddress,
      contactHours: appConfig.contactHours,
      ownerName: appConfig.ownerName,
      aboutHeading: appConfig.aboutHeading,
      aboutText: appConfig.aboutText,
      bannerTitle: appConfig.bannerTitle,
      bannerText: appConfig.bannerText,
      footerBrand: appConfig.siteTitle
    };
    if (valueMap[id] !== undefined) el.textContent = valueMap[id];
  });

  const phoneLink = document.getElementById('contactPhoneLink') || document.getElementById('footerPhoneLink') || document.getElementById('contactPhoneFooterLink');
  const emailLink = document.getElementById('contactEmailLink') || document.getElementById('footerEmailLink') || document.getElementById('contactEmailFooterLink');
  const ownerPhoto = document.getElementById('ownerPhoto');
  const footerAddress = document.getElementById('footerAddress');

  if (phoneLink) {
    phoneLink.href = `tel:${appConfig.contactPhone.replace(/\s+/g, '').replace('+', '')}`;
    phoneLink.textContent = appConfig.contactPhone;
  }
  if (emailLink) {
    emailLink.href = `mailto:${appConfig.contactEmail}`;
    emailLink.textContent = appConfig.contactEmail;
  }
  if (ownerPhoto) ownerPhoto.src = appConfig.ownerPhoto;
  if (footerAddress) footerAddress.textContent = appConfig.contactAddress;

  const contactAddressEls = document.querySelectorAll('#contactAddress, #footerAddress');
  contactAddressEls.forEach((el) => {
    el.textContent = appConfig.contactAddress;
  });

  const titleEls = document.querySelectorAll('#siteTitle');
  titleEls.forEach((el) => {
    el.textContent = appConfig.siteTitle;
  });

  const logoImg = document.querySelector('.brand img');
  if (logoImg) logoImg.src = appConfig.logoUrl;
}

function formatPrice(value) {
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(value);
}

function renderCars() {
  const grid = document.getElementById('carGrid');
  if (!grid) return;

  grid.innerHTML = cars.map((car) => `
    <article class="car-card">
      <div class="car-image">
        <span class="new-badge">${car.badge}</span>
        <img src="${car.image}" alt="${car.brand} ${car.model}" />
      </div>
      <div class="card-content">
        <div class="card-head">
          <h3>${car.brand} ${car.model}</h3>
          <span class="price-tag">${formatPrice(car.price)}</span>
        </div>
        <ul class="meta-list">
          <li>År: ${car.year}</li>
          <li>Brændstof: ${car.fuel}</li>
          <li>Gearkasse: ${car.transmission === 'aut' ? 'Automatgear' : 'Manuel'}</li>
          <li>Biltype: ${car.type}</li>
        </ul>
        <div class="card-footer">
          <span>Kontantpris</span>
          <a href="/biler" class="detail-btn">Se mere</a>
        </div>
      </div>
    </article>
  `).join('');
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('kurt_theme') || 'light';
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const icon = toggle.querySelector('.toggle-icon');
  if (!icon) return;

  const sunSvg = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.5a1 1 0 0 1 1 1V5a1 1 0 1 1-2 0v-.5a1 1 0 0 1 1-1Zm0 15a1 1 0 0 1 1 1V19a1 1 0 1 1-2 0v-.5a1 1 0 0 1 1-1Zm8.5-6.5a1 1 0 0 1 0 2h-.5a1 1 0 1 1 0-2h.5ZM5 12a1 1 0 0 1 0 2H4.5a1 1 0 0 1 0-2H5Zm12.85-5.35a1 1 0 0 1 1.4 0l.35.35a1 1 0 1 1-1.4 1.4l-.35-.35a1 1 0 0 1 0-1.4ZM5.15 17.15a1 1 0 0 1 1.4 0l.35.35a1 1 0 1 1-1.4 1.4l-.35-.35a1 1 0 0 1 0-1.4ZM18.85 17.15a1 1 0 0 1 0 1.4l-.35.35a1 1 0 0 1-1.4-1.4l.35-.35a1 1 0 0 1 1.4 0ZM5.15 6.85a1 1 0 0 1 0 1.4L4.8 8.6a1 1 0 1 1-1.4-1.4l.35-.35a1 1 0 0 1 1.4 0ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="currentColor"/>
    </svg>
  `;
  const moonSvg = `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.3 14.8A7.95 7.95 0 0 1 9.2 3.7a8.5 8.5 0 1 0 11.1 11.1Z" fill="currentColor"/>
    </svg>
  `;

  icon.innerHTML = savedTheme === 'dark' ? moonSvg : sunSvg;

  toggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem('kurt_theme', dark ? 'dark' : 'light');
    icon.innerHTML = dark ? moonSvg : sunSvg;
  });
}

function populateAdminForm() {
  const form = document.getElementById('adminForm');
  if (!form) return;

  form.querySelector('#cfgSiteTitle').value = appConfig.siteTitle;
  form.querySelector('#cfgLogoUrl').value = appConfig.logoUrl;
  form.querySelector('#cfgPhone').value = appConfig.contactPhone;
  form.querySelector('#cfgEmail').value = appConfig.contactEmail;
  form.querySelector('#cfgAddress').value = appConfig.contactAddress;
  form.querySelector('#cfgHours').value = appConfig.contactHours;
  form.querySelector('#cfgHomeHeroTitle').value = appConfig.homeHeroTitle;
  form.querySelector('#cfgHomeHeroText').value = appConfig.homeHeroText;
  form.querySelector('#cfgHomeAboutHeading').value = appConfig.homeAboutHeading;
  form.querySelector('#cfgHomeAboutText').value = appConfig.homeAboutText;
  form.querySelector('#cfgServiceTitle1').value = appConfig.serviceTitle1;
  form.querySelector('#cfgServiceText1').value = appConfig.serviceText1;
  form.querySelector('#cfgServiceTitle2').value = appConfig.serviceTitle2;
  form.querySelector('#cfgServiceText2').value = appConfig.serviceText2;
  form.querySelector('#cfgContactSectionTitle').value = appConfig.contactSectionTitle;
  form.querySelector('#cfgContactSectionText').value = appConfig.contactSectionText;
  form.querySelector('#cfgOwnerName').value = appConfig.ownerName;
  form.querySelector('#cfgOwnerPhoto').value = appConfig.ownerPhoto;
  form.querySelector('#cfgAboutHeading').value = appConfig.aboutHeading;
  form.querySelector('#cfgAboutText').value = appConfig.aboutText;
  form.querySelector('#cfgBannerTitle').value = appConfig.bannerTitle;
  form.querySelector('#cfgBannerText').value = appConfig.bannerText;
  form.querySelector('#cfgPrimary').value = appConfig.primaryColor || '#123f79';
  form.querySelector('#cfgAccent').value = appConfig.secondaryColor || '#1e88e5';
}

async function saveConfig(evt) {
  evt.preventDefault();
  const form = evt.target;

  const nextConfig = {
    ...appConfig,
    siteTitle: form.querySelector('#cfgSiteTitle').value,
    logoUrl: form.querySelector('#cfgLogoUrl').value,
    contactPhone: form.querySelector('#cfgPhone').value,
    contactEmail: form.querySelector('#cfgEmail').value,
    contactAddress: form.querySelector('#cfgAddress').value,
    contactHours: form.querySelector('#cfgHours').value,
    homeHeroTitle: form.querySelector('#cfgHomeHeroTitle').value,
    homeHeroText: form.querySelector('#cfgHomeHeroText').value,
    homeAboutHeading: form.querySelector('#cfgHomeAboutHeading').value,
    homeAboutText: form.querySelector('#cfgHomeAboutText').value,
    serviceTitle1: form.querySelector('#cfgServiceTitle1').value,
    serviceText1: form.querySelector('#cfgServiceText1').value,
    serviceTitle2: form.querySelector('#cfgServiceTitle2').value,
    serviceText2: form.querySelector('#cfgServiceText2').value,
    contactSectionTitle: form.querySelector('#cfgContactSectionTitle').value,
    contactSectionText: form.querySelector('#cfgContactSectionText').value,
    ownerName: form.querySelector('#cfgOwnerName').value,
    ownerPhoto: form.querySelector('#cfgOwnerPhoto').value,
    aboutHeading: form.querySelector('#cfgAboutHeading').value,
    aboutText: form.querySelector('#cfgAboutText').value,
    bannerTitle: form.querySelector('#cfgBannerTitle').value,
    bannerText: form.querySelector('#cfgBannerText').value,
    primaryColor: form.querySelector('#cfgPrimary').value,
    secondaryColor: form.querySelector('#cfgAccent').value
  };

  try {
    const result = await fetchJson('/api/config', {
      method: 'POST',
      body: JSON.stringify(nextConfig)
    });
    if (result && result.ok) {
      appConfig = { ...defaultConfig, ...result.config };
      applyConfig();
      showStatus('Ændringer gemt.');
    } else {
      showStatus('Kunne ikke gemme ændringer.');
    }
  } catch (error) {
    showStatus('Kunne ikke gemme ændringer.');
  }
}

function showStatus(message) {
  const status = document.getElementById('adminStatus');
  if (status) {
    status.textContent = message;
  }
}

async function ensureAdminFlow() {
  const path = window.location.pathname;
  const isDashboard = path === '/dashboard' || path === '/admin';
  const isLogin = path === '/login' || path === '/admin/login';

  if (isDashboard || isLogin) {
    try {
      const status = await fetchJson('/api/admin/status');
      if (!status.adminExists && isDashboard) {
        window.location.href = '/login';
      }
      if (status.adminExists && status.loggedIn && isLogin) {
        window.location.href = '/dashboard';
      }
      if (!status.loggedIn && isDashboard) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.warn('Admin status check failed.', error);
    }
  }
}

async function renderAdminPage() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  try {
    const status = await fetchJson('/api/admin/status');
    if (!status.adminExists) {
      adminContent.innerHTML = `
        <h1>Opret første admin</h1>
        <p>Der er endnu ingen admin-bruger. Lav den første bruger for at aktivere administrationspanelet.</p>
        <form id="createAdminForm" class="admin-form">
          <div class="field">
            <label for="adminUsername">Brugernavn</label>
            <input id="adminUsername" type="text" />
          </div>
          <div class="field">
            <label for="adminPassword">Adgangskode</label>
            <input id="adminPassword" type="password" />
          </div>
          <div class="actions">
            <button class="primary-btn" type="submit">Opret admin</button>
          </div>
          <div id="adminStatus" class="status"></div>
        </form>
      `;

      document.getElementById('createAdminForm')?.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        try {
          const result = await fetchJson('/api/admin/create-first', {
            method: 'POST',
            body: JSON.stringify({ username, password })
          });
          if (result.ok) {
            window.location.href = '/admin';
          } else {
            showStatus(result.error || 'Kunne ikke oprette admin.');
          }
        } catch (error) {
          showStatus('Kunne ikke oprette admin.');
        }
      });
      return;
    }

    adminContent.innerHTML = `
      <h1>Admin config</h1>
      <p>Opdater tekst, kontaktinfo, logo og API-indstillinger her.</p>
      <form id="adminForm" class="admin-form">
        <div class="config-grid">
          <section class="config-section">
            <h2>Branding og kontakt</h2>
            <div class="field"><label for="cfgSiteTitle">Logo tekst</label><input id="cfgSiteTitle" type="text" /></div>
            <div class="field"><label for="cfgLogoUrl">Logo billede URL</label><input id="cfgLogoUrl" type="text" /></div>
            <div class="field"><label for="cfgPhone">Telefonnummer</label><input id="cfgPhone" type="text" /></div>
            <div class="field"><label for="cfgEmail">E-mail</label><input id="cfgEmail" type="text" /></div>
            <div class="field"><label for="cfgAddress">Adresse</label><input id="cfgAddress" type="text" /></div>
            <div class="field"><label for="cfgHours">Åbningstider</label><input id="cfgHours" type="text" /></div>
          </section>

          <section class="config-section">
            <h2>Forside tekst</h2>
            <div class="field"><label for="cfgHomeHeroTitle">Hero overskrift</label><input id="cfgHomeHeroTitle" type="text" /></div>
            <div class="field"><label for="cfgHomeHeroText">Hero tekst</label><textarea id="cfgHomeHeroText"></textarea></div>
            <div class="field"><label for="cfgHomeAboutHeading">Om os overskrift</label><input id="cfgHomeAboutHeading" type="text" /></div>
            <div class="field"><label for="cfgHomeAboutText">Om os tekst</label><textarea id="cfgHomeAboutText"></textarea></div>
            <div class="field"><label for="cfgServiceTitle1">Service 1 titel</label><input id="cfgServiceTitle1" type="text" /></div>
            <div class="field"><label for="cfgServiceText1">Service 1 tekst</label><textarea id="cfgServiceText1"></textarea></div>
            <div class="field"><label for="cfgServiceTitle2">Service 2 titel</label><input id="cfgServiceTitle2" type="text" /></div>
            <div class="field"><label for="cfgServiceText2">Service 2 tekst</label><textarea id="cfgServiceText2"></textarea></div>
            <div class="field"><label for="cfgContactSectionTitle">Kontakt titel</label><input id="cfgContactSectionTitle" type="text" /></div>
            <div class="field"><label for="cfgContactSectionText">Kontakt tekst</label><textarea id="cfgContactSectionText"></textarea></div>
          </section>

          <section class="config-section">
            <h2>Om os-siden</h2>
            <div class="field"><label for="cfgOwnerName">Ejer navn</label><input id="cfgOwnerName" type="text" /></div>
            <div class="field"><label for="cfgOwnerPhoto">Ejer billede URL</label><input id="cfgOwnerPhoto" type="text" /></div>
            <div class="field"><label for="cfgAboutHeading">Om os overskrift</label><input id="cfgAboutHeading" type="text" /></div>
            <div class="field"><label for="cfgAboutText">Om os tekst</label><textarea id="cfgAboutText"></textarea></div>
            <div class="field"><label for="cfgBannerTitle">Biler-side titel</label><input id="cfgBannerTitle" type="text" /></div>
            <div class="field"><label for="cfgBannerText">Biler-side tekst</label><textarea id="cfgBannerText"></textarea></div>
          </section>

          <section class="config-section">
            <h2>Farver</h2>
            <div class="field"><label for="cfgPrimary">Primær farve</label><input id="cfgPrimary" type="text" /></div>
            <div class="field"><label for="cfgAccent">Accent farve</label><input id="cfgAccent" type="text" /></div>
          </section>
        </div>

        <div class="danger-box" style="margin-top: 18px;">
          <h3>Reset admin</h3>
          <p>Når du klikker her, vil den nuværende admin logik blive slettet. Derefter kan den første login oprette en ny admin igen.</p>
          <button type="button" id="resetAdminButton">Reset admin</button>
        </div>

        <div class="actions">
          <button class="primary-btn" type="submit">Gem ændringer</button>
          <button class="secondary-btn" type="button" id="logoutButton">Log ud</button>
        </div>
        <div id="adminStatus" class="status"></div>
      </form>
    `;

    populateAdminForm();
    document.getElementById('adminForm')?.addEventListener('submit', saveConfig);
    document.getElementById('logoutButton')?.addEventListener('click', async () => {
      await fetchJson('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    });

    document.getElementById('resetAdminButton')?.addEventListener('click', async () => {
      const confirmed = window.confirm('Er du sikker på, at du vil nulstille admin-brugeren?');
      if (!confirmed) return;
      await fetchJson('/api/admin/reset', { method: 'POST' });
      window.location.href = '/admin/login';
    });
  } catch (error) {
    adminContent.innerHTML = '<h1>Adgang nægtet</h1><p>Du er ikke logget ind.</p><a href="/admin/login">Log ind</a>';
  }
}

async function setupLoginPage() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();
    const status = document.getElementById('loginStatus');
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const result = await fetchJson('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (result.ok) {
        window.location.href = '/admin';
      } else {
        if (status) status.textContent = result.error || 'Login fejlede.';
      }
    } catch (error) {
      if (status) status.textContent = 'Login fejlede.';
    }
  });
}

async function loadPublicContent() {
  await loadConfig();
  applyConfig();
  initializeTheme();
  renderCars();
}

async function loadSharedPartials() {
  const headerHost = document.getElementById('siteHeader');
  const footerHost = document.getElementById('siteFooter');

  if (headerHost) {
    try {
      const headerHtml = await fetch('/partials/header').then((response) => response.text());
      headerHost.innerHTML = headerHtml;
    } catch (error) {
      console.warn('Could not load header partial.', error);
    }
  }

  if (footerHost) {
    try {
      const footerHtml = await fetch('/partials/footer').then((response) => response.text());
      footerHost.innerHTML = footerHtml;
    } catch (error) {
      console.warn('Could not load footer partial.', error);
    }
  }

  const pageName = (document.body.dataset.page || window.location.pathname.replace(/\/+$/, '') || '/').toLowerCase();
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const normalized = href.replace(/\/+$/, '');
    const active =
      (pageName === 'home' && (normalized === '/' || normalized === '')) ||
      (pageName === 'biler' && normalized === '/biler') ||
      (pageName === 'om-os-kontakt' && normalized === '/om-os-kontakt') ||
      (pageName === 'admin' && normalized === '/admin/login');

    link.classList.toggle('active', active);
  });

  const homeLink = document.querySelector('.nav-home');
  if (homeLink) {
    const pageIsHome = pageName === 'home' || window.location.pathname === '/';
    homeLink.classList.toggle('active', pageIsHome);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSharedPartials();
  const path = window.location.pathname;
  await loadPublicContent();

  if (path === '/dashboard' || path === '/admin') {
    await ensureAdminFlow();
    await renderAdminPage();
  } else if (path === '/login' || path === '/admin/login') {
    await ensureAdminFlow();
    setupLoginPage();
  }
});
