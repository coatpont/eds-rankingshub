// rankingshub.app header: brand + nav links + language selector, sticky translucent bar.

const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    if (nav && nav.getAttribute('aria-expanded') === 'true' && !isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, false);
    }
  }
}

/**
 * Open/close the mobile nav.
 * @param {Element} nav
 * @param {boolean|null} forceExpanded
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null
    ? !forceExpanded
    : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  if (!expanded && !isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
  }
}

/**
 * Returns the locale code from the current URL path, or 'en' for the root locale.
 * Matches the first path segment when it looks like a locale code (2-letter or BCP-47 subtag).
 * @returns {string}
 */
function getLocale() {
  const match = window.location.pathname.match(/^\/([a-z]{2}(?:-[a-z]+)?)(?:\/|$)/i);
  return match ? match[1].toLowerCase() : 'en';
}

/**
 * Fetches nav translations from /translations.json. Returns {} on failure.
 * @returns {Promise<Object>}
 */
async function fetchTranslations() {
  try {
    const resp = await fetch('/translations.json');
    if (resp.ok) return resp.json();
  } catch (e) { /* fall through */ }
  return {};
}

/**
 * Prefixes a root-relative href with the current locale.
 * English paths and external URLs are returned unchanged.
 * @param {string} href
 * @param {string} locale
 * @returns {string}
 */
function localizeHref(href, locale) {
  if (!href || locale === 'en' || href.startsWith('http') || href.startsWith(`/${locale}`)) {
    return href;
  }
  if (href === '/') return `/${locale}/`;
  return `/${locale}${href}`;
}

/**
 * Build a native language <select> from a list of language links.
 * Active option is determined by the current locale, not exact pathname,
 * so it remains correct on any subpage.
 * @param {Element} listSection the nav section holding language anchors
 * @param {string} locale the current locale code
 * @param {Object} t translations for the current locale
 * @returns {Element} the language switcher wrapper
 */
function buildLanguageSelect(listSection, locale, t) {
  const langNames = t.languages || {};
  const labelText = t.language || 'Language';

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-lang';

  const label = document.createElement('label');
  label.setAttribute('for', 'nav-lang-select');
  label.textContent = labelText;

  const select = document.createElement('select');
  select.id = 'nav-lang-select';
  select.setAttribute('aria-label', labelText);

  listSection.querySelectorAll('a').forEach((a) => {
    const option = document.createElement('option');
    const href = a.getAttribute('href');
    option.value = href.endsWith('/') ? href : `${href}/`;
    const targetLocale = option.value === '/' ? 'en' : option.value.replace(/^\/|\/$/g, '');
    option.textContent = langNames[targetLocale] || a.textContent.trim();
    const isEnglish = option.value === '/';
    option.selected = isEnglish ? locale === 'en' : option.value === `/${locale}/`;
    select.append(option);
  });

  select.addEventListener('change', () => {
    if (select.value) window.location.href = select.value;
  });

  wrapper.append(label, select);
  return wrapper;
}

/**
 * loads and decorates the header nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const locale = getLocale();
  const translationsPromise = fetchTranslations();

  const resp = await fetch('/content/nav.plain.html');
  let html = '';
  if (resp.ok) {
    html = await resp.text();
  } else {
    const fallback = await fetch('/nav.plain.html');
    if (fallback.ok) html = await fallback.text();
  }

  const translations = await translationsPromise;
  const t = translations[locale] || {};

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  const sections = [...fragment.children];
  const [brandSection, linksSection, langSection] = sections;

  // Brand — localize the home link for non-English locales
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  if (brandSection) {
    navBrand.append(...brandSection.childNodes);
    navBrand.querySelectorAll('a').forEach((a) => {
      a.setAttribute('href', localizeHref(a.getAttribute('href'), locale));
    });
  }

  // Nav links — translate text and localize hrefs
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (linksSection) navSections.append(...linksSection.childNodes);
  navSections.querySelectorAll('a').forEach((a) => {
    const key = a.textContent.trim().toLowerCase();
    if (t[key]) a.textContent = t[key];
    const localHref = localizeHref(a.getAttribute('href'), locale);
    a.setAttribute('href', localHref);
    if (localHref === window.location.pathname) a.classList.add('active');
  });

  // Tools (language selector built from the language section)
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  if (langSection) navTools.append(buildLanguageSelect(langSection, locale, t));

  // Hamburger (mobile)
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));

  nav.append(navBrand, navSections, navTools, hamburger);
  nav.setAttribute('aria-expanded', 'false');

  isDesktop.addEventListener('change', () => {
    nav.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = '';
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
