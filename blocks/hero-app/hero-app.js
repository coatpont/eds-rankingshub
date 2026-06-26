/**
 * loads and decorates the app-intro hero with an auto-advancing screenshot carousel
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div:first-child > div');
  if (!row) return;

  const pictures = [...row.querySelectorAll('picture')];
  if (pictures.length <= 1) return;

  // Make first image eager since it's above the fold
  const firstImg = pictures[0].querySelector('img');
  if (firstImg) firstImg.loading = 'eager';

  const carousel = document.createElement('div');
  carousel.className = 'hero-app-carousel';
  pictures[0].classList.add('is-active');
  pictures.forEach((pic) => carousel.append(pic));

  row.innerHTML = '';
  row.append(carousel);

  // Wrap the last clause (after the final ", ") in a gradient span
  const h1 = block.querySelector('h1');
  if (h1) {
    const text = h1.textContent;
    const lastComma = text.lastIndexOf(', ');
    if (lastComma !== -1) {
      h1.innerHTML = `${text.slice(0, lastComma + 2)}<span class="hero-app-gradient">${text.slice(lastComma + 2)}</span>`;
    }
  }

  let current = 0;
  setInterval(() => {
    pictures[current].classList.remove('is-active');
    current = (current + 1) % pictures.length;
    pictures[current].classList.add('is-active');
  }, 3000);
}
