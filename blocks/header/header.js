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
 * Build a native language <select> from a list of language links.
 * @param {Element} listSection the nav section holding language anchors
 * @returns {Element} the language switcher wrapper
 */
function buildLanguageSelect(listSection) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-lang';

  const label = document.createElement('label');
  label.setAttribute('for', 'nav-lang-select');
  label.textContent = 'Language';

  const select = document.createElement('select');
  select.id = 'nav-lang-select';
  select.setAttribute('aria-label', 'Language');

  const current = window.location.pathname;
  listSection.querySelectorAll('a').forEach((a) => {
    const option = document.createElement('option');
    option.value = a.getAttribute('href');
    option.textContent = a.textContent.trim();
    if (option.value === current) option.selected = true;
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
  const resp = await fetch('/content/nav.plain.html');
  let html = '';
  if (resp.ok) {
    html = await resp.text();
  } else {
    const fallback = await fetch('/nav.plain.html');
    if (fallback.ok) html = await fallback.text();
  }

  const fragment = document.createElement('div');
  fragment.innerHTML = html;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';

  const sections = [...fragment.children];
  const [brandSection, linksSection, langSection] = sections;

  // Brand
  const navBrand = document.createElement('div');
  navBrand.className = 'nav-brand';
  if (brandSection) navBrand.append(...brandSection.childNodes);

  // Nav links
  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  if (linksSection) navSections.append(...linksSection.childNodes);
  navSections.querySelectorAll('a').forEach((a) => {
    if (a.getAttribute('href') === window.location.pathname) a.classList.add('active');
  });

  // Tools (language selector built from the language section)
  const navTools = document.createElement('div');
  navTools.className = 'nav-tools';
  if (langSection) navTools.append(buildLanguageSelect(langSection));

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
