import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const [imageCell, infoCell] = [...block.firstElementChild.children];
  if (!imageCell || !infoCell) return;

  imageCell.className = 'player-highlight-image';
  infoCell.className = 'player-highlight-info';

  const img = imageCell.querySelector('picture > img');
  if (img) {
    // only optimize AEM-served images (relative paths or aem CDN); leave external URLs as-is
    const src = img.getAttribute('src') || '';
    if (!src.startsWith('http') || /\.(aem\.(page|live)|hlx\.(page|live))/.test(src)) {
      const optimized = createOptimizedPicture(src, img.alt, true, [{ width: '600' }]);
      img.closest('picture').replaceWith(optimized);
    } else {
      img.loading = 'eager';
    }
  }

  const [firstName, lastName, country, sport] = [...infoCell.querySelectorAll('p')];
  if (firstName) firstName.className = 'player-first-name';
  if (lastName) lastName.className = 'player-last-name';
  if (country) country.className = 'player-country';
  if (sport) sport.className = 'player-sport';
}
