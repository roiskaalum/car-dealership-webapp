const CONFIG_KEY = 'dealer_app_config';
const THEME_KEY = 'dealer_theme';
const defaultConfig = window.APP_CONFIG || {
  siteTitle: 'Krathman',
  logoUrl: '../images/logo.jpg',
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  bannerTitle: 'Kvalitetsbiler til Alle',
  bannerText: 'Udforsk udvalget af biler tilgængelige på BilInfo.',
  ownerName: 'Kurt Krathmand',
  ownerPhoto: 'https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=612x612&w=is&k=20&c=-Jq_6tAjuYieAjOB5B1CyUXSrD_tKE3IKZwVGIjn8-8=',
  aboutText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre.',
  contactPhone: '+45 86 62 85 45',
  contactPhoneHref: 'tel:+4586628545',
  contactEmail: 'kurt@krathmand.dk',
  contactEmailHref: 'mailto:kurt@krathmand.dk',
  contactAddress: 'Fabrikvej 1 8800 Viborg',
  contactHours: 'Efter aftale',
  adminSlug: 'x8fD4r7nQ2'
};

const cars = [
  { brand: 'Audi', model: 'A4', year: 2021, price: 285000, fuel: 'benzin', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { brand: 'BMW', model: '320d', year: 2020, price: 265000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', badge: 'Premium' },
  { brand: 'Volkswagen', model: 'Golf', year: 2022, price: 220000, fuel: 'hybrid', doors: 'door-4', transmission: 'aut', type: 'hatchback', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { brand: 'Volvo', model: 'XC60', year: 2019, price: 340000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'suv', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', badge: 'SUV' },
  { brand: 'Peugeot', model: '2008', year: 2017, price: 64900, fuel: 'diesel', doors: 'door-4', transmission: 'man', type: 'suv', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', badge: 'Tilbud' },
  { brand: 'Tesla', model: 'Model 3', year: 2022, price: 289900, fuel: 'electric', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', badge: 'Elbil' }
];

const appState = {
  selectedBrand: 'all',
  selectedModel: 'all',
  selectedPrice: 'all',
  selectedSort: 'newest',
  selectedFilters: new Set(),
  query: ''
};

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
  document.documentElement.style.setProperty('--primary', config.primaryColor || '#1e3a8a');
  document.documentElement.style.setProperty('--primary-dark', config.primaryColor || '#1e3a8a');

  document.querySelectorAll('[data-config]').forEach((element) => {
    const key = element.dataset.config;
    if (key === 'siteTitle') element.textContent = config.siteTitle;
    if (key === 'contactPhone') element.textContent = config.contactPhone;
    if (key === 'contactEmail') element.textContent = config.contactEmail;
    if (key === 'contactAddress') element.textContent = config.contactAddress;
    if (key === 'bannerTitle') element.textContent = config.bannerTitle;
    if (key === 'bannerText') element.textContent = config.bannerText;
    if (key === 'aboutText') element.textContent = config.aboutText;
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
  return [...appState.selectedFilters].every((filter) => {
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
    return true;
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

  const visibleCars = getVisibleCars();
  if (countEl) countEl.textContent = `${visibleCars.length} biler fundet`;
  if (summaryEl) summaryEl.textContent = `Viser ${visibleCars.length} biler`;

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

function initializeFilters() {
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
    <h1>Admin</h1>
    <p>Opdater siteinformation og tekst, så de vises på forsiden og om-os-siden.</p>
    <form id="adminForm" class="admin-form">
      <div class="field"><label for="cfgSiteTitle">Firma navn</label><input id="cfgSiteTitle" type="text" value="${config.siteTitle}" /></div>
      <div class="field"><label for="cfgLogoUrl">Logo URL</label><input id="cfgLogoUrl" type="text" value="${config.logoUrl}" /></div>
      <div class="field"><label for="cfgBannerTitle">Banner titel</label><input id="cfgBannerTitle" type="text" value="${config.bannerTitle}" /></div>
      <div class="field"><label for="cfgBannerText">Banner tekst</label><input id="cfgBannerText" type="text" value="${config.bannerText}" /></div>
      <div class="field"><label for="cfgOwnerName">Ejer navn</label><input id="cfgOwnerName" type="text" value="${config.ownerName}" /></div>
      <div class="field"><label for="cfgOwnerPhoto">Ejer billede URL</label><input id="cfgOwnerPhoto" type="text" value="${config.ownerPhoto}" /></div>
      <div class="field"><label for="cfgAboutText">Om os tekst</label><textarea id="cfgAboutText" rows="5">${config.aboutText}</textarea></div>
      <div class="field"><label for="cfgPhone">Telefon</label><input id="cfgPhone" type="text" value="${config.contactPhone}" /></div>
      <div class="field"><label for="cfgEmail">E-mail</label><input id="cfgEmail" type="text" value="${config.contactEmail}" /></div>
      <div class="field"><label for="cfgAddress">Adresse</label><input id="cfgAddress" type="text" value="${config.contactAddress}" /></div>
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
      bannerTitle: document.getElementById('cfgBannerTitle').value,
      bannerText: document.getElementById('cfgBannerText').value,
      ownerName: document.getElementById('cfgOwnerName').value,
      ownerPhoto: document.getElementById('cfgOwnerPhoto').value,
      aboutText: document.getElementById('cfgAboutText').value,
      contactPhone: document.getElementById('cfgPhone').value,
      contactEmail: document.getElementById('cfgEmail').value,
      contactAddress: document.getElementById('cfgAddress').value,
      contactPhoneHref: `tel:${document.getElementById('cfgPhone').value.replace(/\s+/g, '').replace('+', '')}`,
      contactEmailHref: `mailto:${document.getElementById('cfgEmail').value}`
    };

    localStorage.setItem(CONFIG_KEY, JSON.stringify(nextConfig));
    applyConfig();
    window.location.reload();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyConfig();
  initializeTheme();
  initializeFilters();
  renderCars();
  initializeMailForm();
  initializeAdminPage();
});

    .map(
      (car) => `
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
              <li>Km: 150.000</li>
              <li>Drivmiddel: ${car.fuel}</li>
              <li>Gear: ${car.transmission === 'aut' ? 'Automatgear' : 'Manuel'}</li>
            </ul>
            <div class="card-footer">
              <span>Kontantpris</span>
              <a href="#contact" class="detail-btn">Spørg om bilen</a>
            </div>
          </div>
        </article>
      `
    )
    .join('');

  if (filterSummary) filterSummary.textContent = `Viser ${visibleCars.length} biler`;
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark-theme', isDark);
  const icon = isDark ? '🌙' : '☀️';
  const text = isDark ? 'Mørk' : 'Lys';

  if (themeIcon) themeIcon.textContent = icon;
  if (themeText) themeText.textContent = text;

  localStorage.setItem('jjbiler-theme', isDark ? 'dark' : 'light');
}

function initializeTheme() {
  const savedTheme = localStorage.getItem('jjbiler-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextDark = !document.body.classList.contains('dark-theme');
      applyTheme(nextDark);
    });
  }
}

function initializeFilterControls() {
  document.querySelectorAll('.filter-options input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      readSelectedCheckboxValues();
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

  if (yearSelect) {
    yearSelect.addEventListener('change', (event) => {
      appState.selectedYear = event.target.value;
      renderCars();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      appState.selectedSort = event.target.value;
      renderCars();
    });
  }
}

function initializeMailtoForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('senderName').value.trim();
    const email = document.getElementById('senderEmail').value.trim();
    const subject = document.getElementById('mailSubject').value.trim();
    const body = document.getElementById('mailBody').value.trim();

    const mailtoLink = `mailto:${appConfig.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `Navn: ${name}\nEmail: ${email}\n\n${body}`
    )}`;

    window.location.href = mailtoLink;
  });
}

function initializeAdminAccess() {
  const params = new URLSearchParams(window.location.search);
  const providedKey = params.get('key');
  const isAdminPage = window.location.pathname.endsWith('admin.html');

  if (!isAdminPage) return;

  const adminContainer = document.getElementById('adminContent');
  const secret = appConfig.adminSlug;

  if (providedKey !== secret) {
    adminContainer.innerHTML = `
      <div class="admin-lock">
        <h2>Adgang nægtet</h2>
        <p>Du har ikke adgang til denne side uden det korrekte hemmelige nøgle.</p>
        <p>Dette er bevidst skjult fra den offentlige navigation.</p>
      </div>
    `;
    return;
  }

  const nameInput = document.getElementById('siteName');
  const accentInput = document.getElementById('accentColor');

  if (nameInput) nameInput.value = appConfig.siteName;
  if (accentInput) accentInput.value = '#143d7a';
}

populateBrandOptions();
populateModelOptions();
initializeTheme();
initializeFilterControls();
renderCars();
initializeMailtoForm();
initializeAdminAccess();
