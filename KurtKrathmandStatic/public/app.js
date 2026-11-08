const defaultConfig = {
  siteTitle: 'KRATHMAN',
  logoUrl: '/assets/logo.jpg',
  contactPhone: '+45 86 62 85 45',
  contactEmail: 'kurt@krathmand.dk',
  contactAddress: 'Fabrikvej 1 8800 Viborg',
  contactHours: 'Efter aftale',
  homeHeroTitle: 'Find den rette bil hos Krathman',
  homeHeroText: 'Krathman er din leverandør af kvalitetsbiler i alle aldre.',
  homeAboutHeading: 'Vi har altid ca. 25 biler på lager',
  homeAboutText: 'Krathman er kendt for at kombinere mange års erfaring med personlig service.',
  serviceTitle1: 'Lav gerne en aftale i forvejen',
  serviceText1: 'Det er altid en god idé at ringe i forvejen.',
  serviceTitle2: 'Vi guider dig til den rigtige bil',
  serviceText2: 'Uanset om du vil have en lille bybil eller en familiebil, vi hjælper dig.',
  contactSectionTitle: 'Kontakt os',
  contactSectionText: 'Vi er altid klar til at hjælpe dig med at finde den rigtige bil.',
  ownerName: 'Kurt Krathmand',
  ownerPhoto: 'https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=612x612&w=is&k=20&c=-Jq_6tAjuYieAjOB5B1CyUXSrD_tKE3IKZwVGIjn8-8=',
  aboutHeading: 'Krathman',
  aboutText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre.',
  bannerTitle: 'Kvalitetsbiler til Alle',
  bannerText: 'Udforsk udvalget af biler tilgængelige på BilInfo.'
};

const starterCars = [
  { brand: 'Audi', model: 'A4', year: 2021, price: 285000, fuel: 'benzin', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { brand: 'BMW', model: '320d', year: 2020, price: 265000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80', badge: 'Premium' },
  { brand: 'Volkswagen', model: 'Golf', year: 2022, price: 220000, fuel: 'hybrid', doors: 'door-4', transmission: 'aut', type: 'hatchback', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', badge: 'Nyhed' },
  { brand: 'Volvo', model: 'XC60', year: 2019, price: 340000, fuel: 'diesel', doors: 'door-4', transmission: 'aut', type: 'suv', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80', badge: 'SUV' },
  { brand: 'Peugeot', model: '2008', year: 2017, price: 64900, fuel: 'diesel', doors: 'door-4', transmission: 'man', type: 'suv', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', badge: 'Tilbud' },
  { brand: 'Tesla', model: 'Model 3', year: 2022, price: 289900, fuel: 'electric', doors: 'door-4', transmission: 'aut', type: 'sedan', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80', badge: 'Elbil' }
];

let cars = [...starterCars];

function formatPrice(value) {
  return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', maximumFractionDigits: 0 }).format(value);
}

function applyConfig() {
  const siteTitleEls = document.querySelectorAll('#siteTitle, #footerBrand');
  siteTitleEls.forEach((el) => {
    el.textContent = defaultConfig.siteTitle;
  });

  const ids = ['homeHeroTitle','homeHeroText','homeAboutHeading','homeAboutText','serviceTitle1','serviceText1','serviceTitle2','serviceText2','contactSectionTitle','contactSectionText','contactAddress','contactHours','ownerName','aboutHeading','aboutText','bannerTitle','bannerText'];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      const map = {
        homeHeroTitle: defaultConfig.homeHeroTitle,
        homeHeroText: defaultConfig.homeHeroText,
        homeAboutHeading: defaultConfig.homeAboutHeading,
        homeAboutText: defaultConfig.homeAboutText,
        serviceTitle1: defaultConfig.serviceTitle1,
        serviceText1: defaultConfig.serviceText1,
        serviceTitle2: defaultConfig.serviceTitle2,
        serviceText2: defaultConfig.serviceText2,
        contactSectionTitle: defaultConfig.contactSectionTitle,
        contactSectionText: defaultConfig.contactSectionText,
        contactAddress: defaultConfig.contactAddress,
        contactHours: defaultConfig.contactHours,
        ownerName: defaultConfig.ownerName,
        aboutHeading: defaultConfig.aboutHeading,
        aboutText: defaultConfig.aboutText,
        bannerTitle: defaultConfig.bannerTitle,
        bannerText: defaultConfig.bannerText
      };
      if (map[id] !== undefined) el.textContent = map[id];
    }
  });

  const phoneLink = document.getElementById('contactPhoneLink') || document.getElementById('footerPhoneLink') || document.getElementById('contactPhoneFooterLink');
  const emailLink = document.getElementById('contactEmailLink') || document.getElementById('footerEmailLink') || document.getElementById('contactEmailFooterLink');
  const ownerPhoto = document.getElementById('ownerPhoto');

  if (phoneLink) {
    phoneLink.href = `tel:${defaultConfig.contactPhone.replace(/\s+/g, '').replace('+', '')}`;
    phoneLink.textContent = defaultConfig.contactPhone;
  }
  if (emailLink) {
    emailLink.href = `mailto:${defaultConfig.contactEmail}`;
    emailLink.textContent = defaultConfig.contactEmail;
  }
  if (ownerPhoto) ownerPhoto.src = defaultConfig.ownerPhoto;

  const addressEls = document.querySelectorAll('#contactAddress, #footerAddress');
  addressEls.forEach((el) => {
    el.textContent = defaultConfig.contactAddress;
  });

  const logoImg = document.querySelector('.brand img');
  if (logoImg) logoImg.src = defaultConfig.logoUrl;
}

function renderCars() {
  const grid = document.getElementById('carGrid');
  if (!grid) return;

  grid.innerHTML = cars.map((car) => `
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
          <a href="/biler.html" class="detail-btn">Se mere</a>
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
  const text = toggle.querySelector('.toggle-text');
  if (icon) icon.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
  if (text) text.textContent = savedTheme === 'dark' ? 'Mørk' : 'Lys';

  toggle.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-theme');
    document.body.classList.toggle('dark-theme', dark);
    localStorage.setItem('kurt_theme', dark ? 'dark' : 'light');
    if (icon) icon.textContent = dark ? '🌙' : '☀️';
    if (text) text.textContent = dark ? 'Mørk' : 'Lys';
  });
}

async function loadSharedPartials() {
  const headerHost = document.getElementById('siteHeader');
  const footerHost = document.getElementById('siteFooter');

  if (headerHost) {
    try {
      const res = await fetch('/partials/header.html');
      headerHost.innerHTML = await res.text();
    } catch (error) {
      console.warn('Header partial failed to load.', error);
    }
  }

  if (footerHost) {
    try {
      const res = await fetch('/partials/footer.html');
      footerHost.innerHTML = await res.text();
    } catch (error) {
      console.warn('Footer partial failed to load.', error);
    }
  }

  const path = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.main-nav a');

  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const target = href.split('/').pop() || 'index.html';
    const active =
      (path === '' || path === 'index.html') && target === 'index.html' ||
      (path === 'biler.html' && target === 'biler.html') ||
      (path === 'om-os-kontakt.html' && target === 'om-os-kontakt.html') ||
      (path === 'admin.html' && target === 'admin.html');

    link.classList.toggle('active', active);
  });

  const homeLink = document.querySelector('.nav-home');
  if (homeLink) {
    homeLink.classList.toggle('active', path === '' || path === 'index.html');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSharedPartials();
  applyConfig();
  initializeTheme();
  renderCars();
});
