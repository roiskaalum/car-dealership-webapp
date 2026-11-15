const CONFIG_FIELDS = [
  'siteTitle',
  'logoUrl',
  'contactPhone',
  'contactEmail',
  'contactAddress',
  'contactHours',
  'primary',
  'accent',
  'darkPrimary',
  'darkAccent',
  'homeHeroTitle',
  'homeHeroText',
  'homeAboutHeading',
  'homeAboutText',
  'serviceTitle1',
  'serviceText1',
  'serviceTitle2',
  'serviceText2',
  'ownerName',
  'ownerPhoto',
  'aboutHeading',
  'aboutText',
  'bannerTitle',
  'bannerText'
];

const configForm = document.getElementById('configForm');
const adminStatus = document.getElementById('adminStatus');
const credentialStatus = document.getElementById('credentialStatus');

async function requestJson(url, options) {
  const response = await fetch(url, options);
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Serveren returnerede et ugyldigt svar (${response.status}).`);
  }
  if (!response.ok || !result.ok) {
    throw new Error(result.error || `Anmodningen mislykkedes (${response.status}).`);
  }
  return result;
}

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

async function loadConfig() {
  const result = await requestJson('/api/config', { cache: 'no-store' });
  for (const key of CONFIG_FIELDS) {
    const field = configForm.elements.namedItem(key);
    if (field && typeof result.config[key] === 'string') field.value = result.config[key];
  }
}

async function loadCredentialStatus() {
  const result = await requestJson('/api/admin/credentials', { cache: 'no-store' });
  credentialStatus.textContent = result.configured
    ? 'BilInfo-login er gemt. Adgangskoden vises ikke af sikkerhedshensyn.'
    : 'BilInfo-login er endnu ikke indtastet.';
}

function formatInventoryDate(value) {
  if (!value) return 'Aldrig';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('da-DK');
}

function renderInventorySettings(settings) {
  document.getElementById('autoRefreshEnabled').checked = settings.autoRefreshEnabled;
  document.getElementById('inventoryIntervalHours').value = String(settings.intervalHours);

  const scheduleStatus = document.getElementById('inventoryScheduleStatus');
  const vehicleCount = Number.isInteger(settings.vehicleCount)
    ? ` Antal biler i gemte lagerkopi: ${settings.vehicleCount}.`
    : '';
  const nextUpdate = settings.autoRefreshEnabled
    ? ` Næste planlagte opdatering: ${formatInventoryDate(settings.nextRefreshAt)}.`
    : ' Der er ingen planlagt automatisk opdatering.';
  scheduleStatus.textContent =
    `Senest opdateret: ${formatInventoryDate(settings.lastUpdatedAt)}.${vehicleCount}${nextUpdate}` +
    (settings.lastError ? ` ${settings.lastError}` : '');
  scheduleStatus.classList.toggle('error', Boolean(settings.lastError));
}

async function loadInventorySettings() {
  const result = await requestJson('/api/admin/inventory/settings', { cache: 'no-store' });
  renderInventorySettings(result.settings);
}

configForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = document.getElementById('saveConfigButton');
  const config = Object.fromEntries(CONFIG_FIELDS.map((key) => [key, configForm.elements.namedItem(key).value]));
  button.disabled = true;
  showStatus(adminStatus, 'Gemmer hjemmesideændringer…');
  try {
    await requestJson('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    showStatus(adminStatus, 'Ændringerne er gemt. Den offentlige side bruger dem uden en ny udgivelse.');
  } catch (error) {
    showStatus(adminStatus, `Kunne ikke gemme ændringerne: ${error.message}`, true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('reloadConfigButton').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await loadConfig();
    showStatus(adminStatus, 'De senest gemte værdier er hentet. Ikke-gemte ændringer er erstattet.');
  } catch (error) {
    showStatus(adminStatus, `Kunne ikke hente indstillinger: ${error.message}`, true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('saveCredentialsButton').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  const username = document.getElementById('bilinfoUsername').value.trim();
  const password = document.getElementById('bilinfoPassword').value;
  if (!username || !password) {
    showStatus(credentialStatus, 'Udfyld både API-brugernavn og adgangskode for at gemme eller udskifte login.', true);
    return;
  }

  button.disabled = true;
  showStatus(credentialStatus, 'Gemmer BilInfo-login krypteret…');
  try {
    await requestJson('/api/admin/credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    document.getElementById('bilinfoPassword').value = '';
    showStatus(credentialStatus, 'BilInfo-login er gemt krypteret. Brug knappen ved siden af for at hente bilerne.');
  } catch (error) {
    showStatus(credentialStatus, `Kunne ikke gemme BilInfo-login: ${error.message}`, true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('refreshInventoryButton').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  showStatus(adminStatus, 'Kontakter BilInfo og opdaterer bilerne…');
  try {
    const result = await requestJson('/api/admin/inventory/refresh', { method: 'POST' });
    const refreshedAt = result.refreshedAt ? new Date(result.refreshedAt).toLocaleString('da-DK') : '';
    showStatus(
      adminStatus,
      `Bil-lageret er opdateret fra BilInfo${Number.isInteger(result.vehicleCount) ? ` (${result.vehicleCount} biler)` : ''}${refreshedAt ? ` kl. ${refreshedAt}` : ''}.`
    );
    try {
      await loadInventorySettings();
    } catch (error) {
      const scheduleStatus = document.getElementById('inventoryScheduleStatus');
      scheduleStatus.textContent = `Lageret blev opdateret, men opdateringsstatus kunne ikke hentes: ${error.message}`;
      scheduleStatus.classList.add('error');
    }
  } catch (error) {
    showStatus(adminStatus, `Kunne ikke opdatere bil-lageret: ${error.message}`, true);
  } finally {
    button.disabled = false;
  }
});

document.getElementById('saveInventorySettingsButton').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    const result = await requestJson('/api/admin/inventory/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        autoRefreshEnabled: document.getElementById('autoRefreshEnabled').checked,
        intervalHours: Number(document.getElementById('inventoryIntervalHours').value)
      })
    });
    renderInventorySettings(result.settings);
    showStatus(adminStatus, 'Opdateringsplanen er gemt.');
  } catch (error) {
    showStatus(adminStatus, `Kunne ikke gemme opdateringsplanen: ${error.message}`, true);
  } finally {
    button.disabled = false;
  }
});

Promise.all([loadConfig(), loadCredentialStatus(), loadInventorySettings()])
  .then(() => showStatus(adminStatus, 'Indstillinger indlæst. Redigér felterne, og gem når du er klar.'))
  .catch((error) => {
    showStatus(adminStatus, `Kontrolpanelet kunne ikke indlæse data: ${error.message}`, true);
    configForm.querySelectorAll('input, textarea, button').forEach((field) => {
      if (field.type !== 'password') field.disabled = true;
    });
  });
