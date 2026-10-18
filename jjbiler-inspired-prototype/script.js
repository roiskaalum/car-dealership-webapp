const CONFIG_KEY = 'dealer_app_config';
const THEME_KEY = 'dealer_theme';

const defaultConfig = window.APP_CONFIG || {
  siteTitle: 'KRATHMAN',
  logoUrl: '../images/logo.jpg',
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  primary: '#123f79',
  primaryDark: '#0d2d5d',
  primaryLight: '#dfeeff',
  accent: '#1e88e5',
  navText: '#edf6ff',
  darkNavText: '#1e88e5',
  background: '#f4f7fb',
  backgroundAlt: '#edf3fb',
  panel: '#ffffff',
  panelStrong: '#0f172a',
  panelSoft: '#eaf2ff',
  text: '#111827',
  textSoft: '#53627a',
  border: 'rgba(15, 23, 42, 0.12)',
  darkPrimary: '#1d4ed8',
  darkPrimaryDark: '#0f2f69',
  darkPrimaryLight: '#bfdcff',
  darkAccent: '#63b3ff',
  darkBackground: '#0f172a',
  darkBackgroundAlt: '#111c2d',
  darkPanel: '#152333',
  darkPanelStrong: '#101c2d',
  darkPanelSoft: '#1a2c42',
  darkText: '#edf3ff',
  darkTextSoft: '#a7b7cf',
  darkBorder: 'rgba(148, 163, 184, 0.18)',
  bannerTitle: 'Kvalitetsbiler til Alle',
  bannerText: 'Udforsk udvalget af biler tilgængelige på BilInfo.',
  homeHeroTitle: 'Find den rette bil hos Krathman',
  homeHeroText: 'Krathman er din leverandør af kvalitetsbiler i alle aldre. Vi tilbyder et velholdt udvalg af brugte biler og personlig service med fokus på ærlighed, kvalitet og en god oplevelse fra første kontakt til købesummering.',
  homeAboutHeading: 'Vi har altid ca. 25 biler på lager',
  homeAboutText: 'Krathman er kendt for at kombinere mange års erfaring med personlig service, som gør det nemt at finde den rigtige bil. Vi arbejder med et bredt udvalg af kvalitetsbiler og hjælper dig fra første spørgsmål til den afsluttende aftale.',
  serviceTitle1: 'Lav gerne en aftale i forvejen',
  serviceText1: 'Det er altid en god idé at ringe i forvejen, inden du besøger os. Då vi kan sikre, at vi har åbent, er klar til at tage imod dig og kan give dig tiden og den service, du fortjener.',
  serviceTitle2: 'Vi guider dig til den rigtige bil',
  serviceText2: 'Uanset om du vil have en lille bybil, en praktisk familiebil, en meget økonomisk diesel eller en moderne elbil, så hjælper vi med at finde en løsning, der passer til dit behov.',
  contactSectionTitle: 'Kontakt os',
  contactSectionText: 'Vi er altid klar til at hjælpe dig med at finde den rigtige bil til dig og din hverdag.',
  ownerName: 'Kurt Krathmand',
  ownerPhoto: 'https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=612x612&w=is&k=20&c=-Jq_6tAjuYieAjOB5B1CyUXSrD_tKE3IKZwVGIjn8-8=',
  aboutHeading: 'Krathman',
  aboutText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre.',
  contactPhone: '+45 86 62 85 45',
  contactPhoneHref: 'tel:+4586628545',
  contactEmail: 'kurt@krathmand.dk',
  contactEmailHref: 'mailto:kurt@krathmand.dk',
  contactAddress: 'Fabrikvej 1 8800 Viborg',
  contactHours: 'Efter aftale',
  adminSlug: 'x8fD4r7nQ2'
};

const starterCars = [
  { id: 'demo-audi-a4', brand: 'Audi', model: 'A4', year: 2021, price: 285000, fuel: 'benzin', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { id: 'demo-bmw-320d', brand: 'BMW', model: '320d', year: 2020, price: 265000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', badge: 'Premium' },
  { id: 'demo-vw-golf', brand: 'Volkswagen', model: 'Golf', year: 2022, price: 220000, fuel: 'hybrid', doors: 'door-4', transmission: 'aut', type: 'hatchback', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { id: 'demo-volvo-xc60', brand: 'Volvo', model: 'XC60', year: 2019, price: 340000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'suv', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', badge: 'SUV' },
  { id: 'demo-peugeot-2008', brand: 'Peugeot', model: '2008', year: 2017, price: 64900, fuel: 'diesel', doors: 'door-4', transmission: 'man', type: 'suv', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', badge: 'Tilbud' },
  { id: 'demo-tesla-model3', brand: 'Tesla', model: 'Model 3', year: 2022, price: 289900, fuel: 'electric', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', badge: 'Elbil' }
];

let cars = [...starterCars];

const appState = {
  selectedBrand: 'all',
  selectedModel: 'all',
  selectedPrice: 'all',
  selectedSort: 'newest',
  selectedFilters: new Set(),
  query: ''
};

const pageMode = document.body.dataset.page || 'home';
window.BILINFO_FETCH_MODE = window.BILINFO_FETCH_MODE || 'offline';

function getRandomFeaturedCars(list, count = 6) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy.slice(0, count);
}

function getCurrentConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null');
    return { ...defaultConfig, ...(stored || {}) };
  } catch {
    return { ...defaultConfig };
  }
}

function applyConfig() {
  const config = getCurrentConfig();
  const lightPalette = {
    '--primary': config.primary || config.primaryColor || '#123f79',
    '--primary-dark': config.primaryDark || config.primaryColor || '#0d2d5d',
    '--primary-light': config.primaryLight || '#dfeeff',
    '--accent': config.accent || config.secondaryColor || '#1e88e5',
    '--nav-text': config.navText || '#edf6ff',
    '--dark-nav-text': config.darkNavText || config.darkAccent || config.accent || '#1e88e5',
    '--bg': config.background || '#f4f7fb',
    '--bg-alt': config.backgroundAlt || '#edf3fb',
    '--panel': config.panel || '#ffffff',
    '--panel-strong': config.panelStrong || '#0f172a',
    '--panel-soft': config.panelSoft || '#eaf2ff',
    '--text': config.text || '#111827',
    '--text-soft': config.textSoft || '#53627a',
    '--border': config.border || 'rgba(15, 23, 42, 0.12)',
    '--dark-bg': config.darkBackground || '#0f172a',
    '--dark-bg-alt': config.darkBackgroundAlt || '#111c2d',
    '--dark-panel': config.darkPanel || '#152333',
    '--dark-panel-strong': config.darkPanelStrong || '#101c2d',
    '--dark-panel-soft': config.darkPanelSoft || '#1a2c42',
    '--dark-text': config.darkText || '#edf3ff',
    '--dark-text-soft': config.darkTextSoft || '#a7b7cf',
    '--dark-border': config.darkBorder || 'rgba(148, 163, 184, 0.18)',
    '--dark-primary': config.darkPrimary || '#1d4ed8',
    '--dark-primary-dark': config.darkPrimaryDark || '#0f2f69',
    '--dark-primary-light': config.darkPrimaryLight || '#bfdcff',
    '--dark-accent': config.darkAccent || '#63b3ff',
    '--dark-warning': config.darkWarning || '#fbbf24',
    '--dark-success': config.darkSuccess || '#34d399'
  };

  Object.entries(lightPalette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });

  document.querySelectorAll('[data-config]').forEach((element) => {
    const key = element.dataset.config;
    if (key === 'siteTitle') element.textContent = config.siteTitle;
    if (key === 'contactPhone') element.textContent = config.contactPhone;
    if (key === 'contactEmail') element.textContent = config.contactEmail;
    if (key === 'contactAddress') element.textContent = config.contactAddress;
    if (key === 'contactHours') element.textContent = config.contactHours;
    if (key === 'bannerTitle') element.textContent = config.bannerTitle;
    if (key === 'bannerText') element.textContent = config.bannerText;
    if (key === 'homeHeroTitle') element.textContent = config.homeHeroTitle;
    if (key === 'homeHeroText') element.textContent = config.homeHeroText;
    if (key === 'homeAboutHeading') element.textContent = config.homeAboutHeading;
    if (key === 'homeAboutText') element.textContent = config.homeAboutText;
    if (key === 'serviceTitle1') element.textContent = config.serviceTitle1;
    if (key === 'serviceText1') element.textContent = config.serviceText1;
    if (key === 'serviceTitle2') element.textContent = config.serviceTitle2;
    if (key === 'serviceText2') element.textContent = config.serviceText2;
    if (key === 'contactSectionTitle') element.textContent = config.contactSectionTitle;
    if (key === 'contactSectionText') element.textContent = config.contactSectionText;
    if (key === 'aboutHeading') element.textContent = config.aboutHeading || config.ownerName;
    if (key === 'aboutText') element.textContent = config.aboutText;
    if (key === 'ownerName') element.textContent = config.ownerName;
    if (key === 'ownerPhoto' && element.tagName === 'IMG') element.src = config.ownerPhoto;
    if (key === 'logoUrl' && element.tagName === 'IMG') element.src = config.logoUrl;
    if (key === 'phoneHref') element.href = config.contactPhoneHref || `tel:${config.contactPhone.replace(/\s+/g, '').replace('+', '')}`;
    if (key === 'emailHref') element.href = config.contactEmailHref || `mailto:${config.contactEmail}`;
  });

  document.querySelectorAll('[data-config-value]').forEach((element) => {
    const key = element.dataset.configValue;
    if (key === 'contactPhone') element.textContent = config.contactPhone;
    if (key === 'contactEmail') element.textContent = config.contactEmail;
    if (key === 'contactAddress') element.textContent = config.contactAddress;
  });
}

function formatPrice(value) {
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(value);
}

function normalizeBilInfoText(node) {
  return node ? node.textContent.trim() : '';
}

function normalizeFuel(value) {
  const normalized = value.toLowerCase();
  if (normalized.includes('el')) return 'electric';
  if (normalized.includes('diesel')) return 'diesel';
  if (normalized.includes('hybrid')) return 'hybrid';
  return 'benzin';
}

function normalizeTransmission(value) {
  const normalized = (value || '').toUpperCase();
  if (normalized.includes('A')) return 'aut';
  return 'man';
}

function normalizeVehicleType(value) {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('suv')) return 'suv';
  if (normalized.includes('station')) return 'kombi';
  if (normalized.includes('vogn')) return 'sedan';
  if (normalized.includes('person')) return 'sedan';
  return 'sedan';
}

function normalizeDoors(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isFinite(parsed) && parsed >= 2) {
    if (parsed === 2) return 'door-2';
    if (parsed === 4) return 'door-4';
    return 'door-5';
  }
  return 'door-4';
}

function normalizeImage(url, brand, model) {
  if (url && url.trim()) return url.trim();
  return `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80&text=${encodeURIComponent(brand + ' ' + model)}`;
}

function normalizeBilInfoVehicle(vehicleNode, index) {
  const getText = (selector) => normalizeBilInfoText(vehicleNode.querySelector(selector));
  const make = getText('Make') || 'Ukendt';
  const model = getText('Model') || getText('Variant') || 'Ukendt';
  const variant = getText('Variant');
  const year = Number.parseInt(getText('Year'), 10) || 0;
  const mileage = Number.parseInt((getText('Mileage') || '').replace(/[^0-9]/g, ''), 10) || 0;
  const price = Number.parseInt((getText('NewPrice') || getText('Price') || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const fuel = normalizeFuel(getText('Propellant'));
  const transmission = normalizeTransmission(getText('GearType'));
  const type = normalizeVehicleType(getText('Type'));
  const doorCode = normalizeDoors(getText('NumberOfDoors'));
  const image = normalizeImage(getText('ImageUrl') || getText('Image') || getText('MainImageUrl'), make, model);

  return {
    id: `bilinfo-${getText('Id') || index + 1}`,
    brand: make,
    model: variant ? `${model} ${variant}` : model,
    year,
    price,
    mileage,
    fuel,
    doors: doorCode,
    transmission,
    type,
    image,
    badge: 'BilInfo'
  };
}

function parseBilInfoXml(xmlText) {
  if (!xmlText || typeof xmlText !== 'string') return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    console.warn('BilInfo XML parse error:', parseError.textContent);
    return [];
  }

  return Array.from(doc.querySelectorAll('Vehicle')).map((node, index) => normalizeBilInfoVehicle(node, index));
}

async function fetchLocalBilInfoXml() {
  const response = await fetch('./bilinfo-offline.xml', { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`Offline BilInfo XML not found: ${response.status}`);
  }
  return response.text();
}

async function fetchLiveBilInfoXml() {
  const endpoint = 'https://gw.bilinfo.net/listingapi/api/export';
  const authHeader = 'Basic ' + btoa('demo:ocfB6XzF73');

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
      Accept: 'application/xml,text/xml,application/json;q=0.9,*/*;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`BilInfo request failed with status ${response.status}`);
  }

  return response.text();
}

async function fetchBilInfoCars() {
  const mode = (window.BILINFO_FETCH_MODE || 'offline').toLowerCase();
  const sourceLabel = mode === 'live' ? 'live' : 'offline';
  console.info(`[BilInfo] Using ${sourceLabel} source. Set window.BILINFO_FETCH_MODE = 'live' only for limited test calls.`);

  try {
    const xmlText = mode === 'live'
      ? await fetchLiveBilInfoXml()
      : await fetchLocalBilInfoXml();

    const parsed = parseBilInfoXml(xmlText);
    return parsed.length ? parsed : [...starterCars];
  } catch (error) {
    if (mode === 'live') {
      console.warn('Live BilInfo fetch failed; falling back to offline XML once.', error);
      try {
        const fallbackXml = await fetchLocalBilInfoXml();
        const parsed = parseBilInfoXml(fallbackXml);
        if (parsed.length) return parsed;
      } catch (fallbackError) {
        console.warn('Offline fallback also failed.', fallbackError);
      }
    } else {
      console.warn('Offline BilInfo XML failed; using starter data instead.', error);
    }
    return [...starterCars];
  }
}

function populateBrandOptions() {
  const select = document.getElementById('brandSelect');
  if (!select) return;
  const brands = ['all', ...new Set(cars.map((car) => car.brand))];
  select.innerHTML = brands.map((brand) => `<option value="${brand}">${brand === 'all' ? 'Alle mærker' : brand}</option>`).join('');
  select.value = appState.selectedBrand;
}

function populateModelOptions() {
  const select = document.getElementById('modelSelect');
  if (!select) return;
  const selectedBrand = appState.selectedBrand;
  const modelList = selectedBrand === 'all'
    ? [...new Set(cars.map((car) => car.model))]
    : [...new Set(cars.filter((car) => car.brand === selectedBrand).map((car) => car.model))];

  select.innerHTML = '<option value="all">Alle modeller</option>' + modelList.map((model) => `<option value="${model}">${model}</option>`).join('');
  if (!modelList.includes(appState.selectedModel)) appState.selectedModel = 'all';
  select.value = appState.selectedModel;
}

function readSelectedFilters() {
  const set = new Set();
  document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
    if (checkbox.checked) set.add(checkbox.value);
  });
  appState.selectedFilters = set;
}

function matchesPriceFilter(car) {
  if (appState.selectedPrice === 'all') return true;
  const [min, max] = appState.selectedPrice.split('-').map(Number);
  return car.price >= min && car.price <= max;
}

function matchesCheckboxFilters(car) {
  if (appState.selectedFilters.size === 0) return true;

  return [...appState.selectedFilters].some((filter) => {
    if (filter === 'electric') return car.fuel === 'electric';
    if (filter === 'diesel') return car.fuel === 'diesel';
    if (filter === 'benzin') return car.fuel === 'benzin';
    if (filter === 'hybrid') return car.fuel === 'hybrid';
    if (filter === 'suv') return car.type === 'suv';
    if (filter === 'hatchback') return car.type === 'hatchback';
    if (filter === 'sedan') return car.type === 'sedan';
    if (filter === 'kombi') return car.type === 'kombi';
    if (filter === 'aut') return car.transmission === 'aut';
    if (filter === 'man') return car.transmission === 'man';
    return false;
  });
}

function getVisibleCars() {
  let filtered = cars.filter((car) => {
    const brandMatch = appState.selectedBrand === 'all' || car.brand === appState.selectedBrand;
    const modelMatch = appState.selectedModel === 'all' || car.model === appState.selectedModel;
    const searchMatch = !appState.query || `${car.brand} ${car.model} ${car.fuel}`.toLowerCase().includes(appState.query.toLowerCase());
    const priceMatch = matchesPriceFilter(car);
    const checkboxMatch = matchesCheckboxFilters(car);
    return brandMatch && modelMatch && searchMatch && priceMatch && checkboxMatch;
  });

  filtered.sort((a, b) => {
    if (appState.selectedSort === 'price-low') return a.price - b.price;
    if (appState.selectedSort === 'price-high') return b.price - a.price;
    return b.year - a.year;
  });

  return filtered;
}

function renderCars() {
  const grid = document.getElementById('carGrid');
  const countEl = document.getElementById('inventoryCount');
  const summaryEl = document.getElementById('filterSummary');
  if (!grid) return;

  const fullMatchCars = getVisibleCars();
  const visibleCars = pageMode === 'home'
    ? getRandomFeaturedCars(fullMatchCars.length ? fullMatchCars : cars, 6)
    : fullMatchCars;

  if (countEl) {
    const total = pageMode === 'home' ? fullMatchCars.length : fullMatchCars.length;
    countEl.textContent = `${total} biler fundet`;
  }

  if (summaryEl) {
    summaryEl.textContent = pageMode === 'home' ? 'Udvalgte biler til inspiration' : `Viser ${visibleCars.length} biler`;
  }

  if (visibleCars.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h3>Ingen biler matcher dine valg</h3><p>Prøv at ændre dine filtre.</p></div>';
    return;
  }

  grid.innerHTML = visibleCars.map((car) => `
    <article class="car-card">
      <div class="car-image">
        <span class="new-badge">${car.badge}</span>
        <span class="fav-badge">♡</span>
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
          <a href="biler.html" class="detail-btn">Se mere</a>
        </div>
      </div>
    </article>
  `).join('');
}

function initializeFilterAccordions() {
  document.querySelectorAll('.filter-group').forEach((group) => {
    const heading = group.querySelector('p');
    const options = group.querySelector('.filter-options');
    if (!heading || !options) return;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'filter-group-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<span>${heading.textContent.trim()}</span><span class="chevron">▾</span>`;

    group.insertBefore(toggle, heading);
    heading.remove();
    options.hidden = true;

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      options.hidden = isExpanded;
      toggle.classList.toggle('is-open', !isExpanded);
    });
  });
}

function initializeFilters() {
  initializeFilterAccordions();

  const brandSelect = document.getElementById('brandSelect');
  const modelSelect = document.getElementById('modelSelect');
  const priceSelect = document.getElementById('priceSelect');
  const sortSelect = document.getElementById('sortSelect');
  const searchInput = document.getElementById('searchInput');

  document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      readSelectedFilters();
      renderCars();
    });
  });

  if (brandSelect) {
    brandSelect.addEventListener('change', (event) => {
      appState.selectedBrand = event.target.value;
      appState.selectedModel = 'all';
      populateModelOptions();
      renderCars();
    });
  }

  if (modelSelect) {
    modelSelect.addEventListener('change', (event) => {
      appState.selectedModel = event.target.value;
      renderCars();
    });
  }

  if (priceSelect) {
    priceSelect.addEventListener('change', (event) => {
      appState.selectedPrice = event.target.value;
      renderCars();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      appState.selectedSort = event.target.value;
      renderCars();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      appState.query = event.target.value;
      renderCars();
    });
  }

  populateBrandOptions();
  populateModelOptions();
}

function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const icon = toggle.querySelector('.toggle-icon');
  const text = toggle.querySelector('.toggle-text');
  if (icon) icon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
  if (text) text.textContent = savedTheme === 'dark' ? 'Mørk' : 'Lys';

  toggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    if (icon) icon.textContent = dark ? '🌙' : '☀️';
    if (text) text.textContent = dark ? 'Mørk' : 'Lys';
  });
}

function initializeMailForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('senderName')?.value || '';
    const email = document.getElementById('senderEmail')?.value || '';
    const subject = document.getElementById('mailSubject')?.value || 'Kontakt';
    const body = document.getElementById('mailBody')?.value || '';
    const config = getCurrentConfig();
    window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Navn: ${name}\nEmail: ${email}\n\n${body}`)}`;
  });
}

function initializeAdminPage() {
  const adminContent = document.getElementById('adminContent');
  if (!adminContent) return;

  const params = new URLSearchParams(window.location.search);
  const key = params.get('key');
  const config = getCurrentConfig();

  if (key !== config.adminSlug) {
    adminContent.innerHTML = `
      <div class="admin-lock">
        <h2>Adgang nægtet</h2>
        <p>Du har ikke adgang til denne side uden det korrekte hemmelige nøgle.</p>
        <p>Eksempel: /admin.html?key=${config.adminSlug}</p>
      </div>
    `;
    return;
  }

  adminContent.innerHTML = `
    <h1>Admin config</h1>
    <p>Opdater tekst, kontaktinfo og billede links her. Felterne er organiseret efter, hvor de vises på hjemmesiden.</p>
    <form id="adminForm" class="admin-form">
      <div class="config-grid">
        <section class="config-section">
          <h2>Branding og kontakt</h2>
          <div class="field">
            <label for="cfgSiteTitle">Logo tekst</label>
            <div class="field-note">Vises i header og footer.</div>
            <input id="cfgSiteTitle" type="text" value="${config.siteTitle}" />
          </div>
          <div class="field">
            <label for="cfgLogoUrl">Logo billede URL</label>
            <input id="cfgLogoUrl" type="text" value="${config.logoUrl}" />
          </div>
          <div class="field">
            <label for="cfgPhone">Telefonnummer</label>
            <input id="cfgPhone" type="text" value="${config.contactPhone}" />
          </div>
          <div class="field">
            <label for="cfgEmail">E-mail</label>
            <input id="cfgEmail" type="text" value="${config.contactEmail}" />
          </div>
          <div class="field">
            <label for="cfgAddress">Adresse</label>
            <input id="cfgAddress" type="text" value="${config.contactAddress}" />
          </div>
          <div class="field">
            <label for="cfgHours">Åbningstider</label>
            <input id="cfgHours" type="text" value="${config.contactHours || 'Efter aftale'}" />
          </div>
        </section>

        <section class="config-section">
          <h2>Forside tekst</h2>
          <div class="field">
            <label for="cfgHomeHeroTitle">Hero overskrift</label>
            <input id="cfgHomeHeroTitle" type="text" value="${config.homeHeroTitle}" />
          </div>
          <div class="field">
            <label for="cfgHomeHeroText">Hero tekst</label>
            <textarea id="cfgHomeHeroText">${config.homeHeroText}</textarea>
          </div>
          <div class="field">
            <label for="cfgHomeAboutHeading">Om os overskrift</label>
            <input id="cfgHomeAboutHeading" type="text" value="${config.homeAboutHeading}" />
          </div>
          <div class="field">
            <label for="cfgHomeAboutText">Om os tekst</label>
            <textarea id="cfgHomeAboutText">${config.homeAboutText}</textarea>
          </div>
          <div class="field">
            <label for="cfgServiceTitle1">Service 1 titel</label>
            <input id="cfgServiceTitle1" type="text" value="${config.serviceTitle1}" />
          </div>
          <div class="field">
            <label for="cfgServiceText1">Service 1 tekst</label>
            <textarea id="cfgServiceText1">${config.serviceText1}</textarea>
          </div>
          <div class="field">
            <label for="cfgServiceTitle2">Service 2 titel</label>
            <input id="cfgServiceTitle2" type="text" value="${config.serviceTitle2}" />
          </div>
          <div class="field">
            <label for="cfgServiceText2">Service 2 tekst</label>
            <textarea id="cfgServiceText2">${config.serviceText2}</textarea>
          </div>
          <div class="field">
            <label for="cfgContactSectionTitle">Kontakt sektion titel</label>
            <input id="cfgContactSectionTitle" type="text" value="${config.contactSectionTitle}" />
          </div>
          <div class="field">
            <label for="cfgContactSectionText">Kontakt sektion tekst</label>
            <textarea id="cfgContactSectionText">${config.contactSectionText}</textarea>
          </div>
        </section>

        <section class="config-section">
          <h2>Om os-siden</h2>
          <div class="field">
            <label for="cfgOwnerName">Ejer navn</label>
            <input id="cfgOwnerName" type="text" value="${config.ownerName}" />
          </div>
          <div class="field">
            <label for="cfgOwnerPhoto">Ejer billede URL</label>
            <input id="cfgOwnerPhoto" type="text" value="${config.ownerPhoto}" />
          </div>
          <div class="field">
            <label for="cfgAboutHeading">Om os overskrift</label>
            <input id="cfgAboutHeading" type="text" value="${config.aboutHeading || config.ownerName}" />
          </div>
          <div class="field">
            <label for="cfgAboutText">Om os tekst</label>
            <textarea id="cfgAboutText">${config.aboutText}</textarea>
          </div>
          <div class="field">
            <label for="cfgBannerTitle">Biler-side titel</label>
            <input id="cfgBannerTitle" type="text" value="${config.bannerTitle}" />
          </div>
          <div class="field">
            <label for="cfgBannerText">Biler-side tekst</label>
            <textarea id="cfgBannerText">${config.bannerText}</textarea>
          </div>
        </section>

        <section class="config-section">
          <h2>Farver og tema</h2>
          <div class="field">
            <label for="cfgPrimary">Primær farve</label>
            <input id="cfgPrimary" type="text" value="${config.primary || config.primaryColor || '#123f79'}" />
          </div>
          <div class="field">
            <label for="cfgPrimaryDark">Mørk primær farve</label>
            <input id="cfgPrimaryDark" type="text" value="${config.primaryDark || '#0d2d5d'}" />
          </div>
          <div class="field">
            <label for="cfgAccent">Accent farve</label>
            <input id="cfgAccent" type="text" value="${config.accent || config.secondaryColor || '#1e88e5'}" />
          </div>
          <div class="field">
            <label for="cfgNavText">Navbar tekst (lys tema)</label>
            <input id="cfgNavText" type="text" value="${config.navText || '#edf6ff'}" />
          </div>
          <div class="field">
            <label for="cfgDarkNavText">Navbar tekst (mørkt tema)</label>
            <input id="cfgDarkNavText" type="text" value="${config.darkNavText || config.darkAccent || config.accent || '#1e88e5'}" />
          </div>
          <div class="field">
            <label for="cfgBackground">Lys baggrund</label>
            <input id="cfgBackground" type="text" value="${config.background || '#f4f7fb'}" />
          </div>
          <div class="field">
            <label for="cfgPanel">Panel farve</label>
            <input id="cfgPanel" type="text" value="${config.panel || '#ffffff'}" />
          </div>
          <div class="field">
            <label for="cfgText">Tekst farve</label>
            <input id="cfgText" type="text" value="${config.text || '#111827'}" />
          </div>
          <div class="field">
            <label for="cfgDarkPrimary">Mørk tema primær</label>
            <input id="cfgDarkPrimary" type="text" value="${config.darkPrimary || '#1d4ed8'}" />
          </div>
          <div class="field">
            <label for="cfgDarkAccent">Mørk tema accent</label>
            <input id="cfgDarkAccent" type="text" value="${config.darkAccent || '#63b3ff'}" />
          </div>
          <div class="field">
            <label for="cfgDarkBackground">Mørk baggrund</label>
            <input id="cfgDarkBackground" type="text" value="${config.darkBackground || '#0f172a'}" />
          </div>
          <div class="field">
            <label for="cfgDarkText">Mørk tekst</label>
            <input id="cfgDarkText" type="text" value="${config.darkText || '#edf3ff'}" />
          </div>
        </section>
      </div>

      <div class="readability-preview">
        <strong>Reference for hvor teksten vises</strong>
        <span>Header/footer: logo, telefon, e-mail, adresse</span>
        <span>Forside: hero, virksomhedsinfo, service-sektioner og kontakt-blok</span>
        <span>Om os: ejer, billede og virksomhedsbeskrivelse</span>
        <span>Biler: sideoverskrift og introduktion</span>
      </div>

      <div class="actions">
        <button class="primary-btn" type="submit">Gem ændringer</button>
        <a class="secondary-btn" href="index.html">Tilbage til hjemmeside</a>
      </div>
    </form>
  `;

  document.getElementById('adminForm')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const nextConfig = {
      ...config,
      siteTitle: document.getElementById('cfgSiteTitle').value,
      logoUrl: document.getElementById('cfgLogoUrl').value,
      contactPhone: document.getElementById('cfgPhone').value,
      contactEmail: document.getElementById('cfgEmail').value,
      contactAddress: document.getElementById('cfgAddress').value,
      contactHours: document.getElementById('cfgHours').value,
      homeHeroTitle: document.getElementById('cfgHomeHeroTitle').value,
      homeHeroText: document.getElementById('cfgHomeHeroText').value,
      homeAboutHeading: document.getElementById('cfgHomeAboutHeading').value,
      homeAboutText: document.getElementById('cfgHomeAboutText').value,
      serviceTitle1: document.getElementById('cfgServiceTitle1').value,
      serviceText1: document.getElementById('cfgServiceText1').value,
      serviceTitle2: document.getElementById('cfgServiceTitle2').value,
      serviceText2: document.getElementById('cfgServiceText2').value,
      contactSectionTitle: document.getElementById('cfgContactSectionTitle').value,
      contactSectionText: document.getElementById('cfgContactSectionText').value,
      ownerName: document.getElementById('cfgOwnerName').value,
      ownerPhoto: document.getElementById('cfgOwnerPhoto').value,
      aboutHeading: document.getElementById('cfgAboutHeading').value,
      aboutText: document.getElementById('cfgAboutText').value,
      bannerTitle: document.getElementById('cfgBannerTitle').value,
      bannerText: document.getElementById('cfgBannerText').value,
      primary: document.getElementById('cfgPrimary').value,
      primaryDark: document.getElementById('cfgPrimaryDark').value,
      accent: document.getElementById('cfgAccent').value,
      navText: document.getElementById('cfgNavText').value,
      darkNavText: document.getElementById('cfgDarkNavText').value,
      background: document.getElementById('cfgBackground').value,
      panel: document.getElementById('cfgPanel').value,
      text: document.getElementById('cfgText').value,
      darkPrimary: document.getElementById('cfgDarkPrimary').value,
      darkAccent: document.getElementById('cfgDarkAccent').value,
      darkBackground: document.getElementById('cfgDarkBackground').value,
      darkText: document.getElementById('cfgDarkText').value,
      contactPhoneHref: `tel:${document.getElementById('cfgPhone').value.replace(/\s+/g, '').replace('+', '')}`,
      contactEmailHref: `mailto:${document.getElementById('cfgEmail').value}`
    };

    localStorage.setItem(CONFIG_KEY, JSON.stringify(nextConfig));
    applyConfig();
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  applyConfig();
  initializeTheme();
  initializeFilters();

  const bilInfoCars = await fetchBilInfoCars();
  if (bilInfoCars.length) {
    cars = bilInfoCars;
  }

  renderCars();
  initializeMailForm();
  initializeAdminPage();
});
